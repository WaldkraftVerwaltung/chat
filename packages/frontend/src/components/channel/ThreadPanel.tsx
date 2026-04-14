'use client';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useThreadsStore } from '@/stores/threads.store';
import { useMessagesStore } from '@/stores/messages.store';
import { useAuthStore } from '@/stores/auth.store';
import { MessageItem } from './MessageItem';
import { apiFetch } from '@/lib/api';

export function ThreadPanel({ channelId }: { channelId: string }) {
  const { activeThreadId, replies, closeThread, fetchReplies, addReply } = useThreadsStore();
  const messages = useMessagesStore((s) => s.messagesByChannel[channelId] || []);
  const parentMessage = messages.find((m) => m.id === activeThreadId);
  const threadReplies = activeThreadId ? (replies[activeThreadId] || []) : [];
  const [replyContent, setReplyContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (activeThreadId) {
      fetchReplies(activeThreadId);
      // Auto-focus textarea when thread opens
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [activeThreadId, fetchReplies]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadReplies.length]);

  if (!activeThreadId || !parentMessage) return null;

  async function sendReply() {
    const text = replyContent.trim();
    if (!text || !activeThreadId || sending) return;

    setSending(true);

    // Optimistic update — show reply immediately
    const tempId = 'temp-' + Date.now();
    const optimisticReply = {
      id: tempId,
      channelId,
      userId: user?.id || '',
      content: text,
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      threadParentId: activeThreadId,
      alsoSentToChannel: false,
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
      user: { id: user?.id || '', displayName: user?.displayName || '', avatarUrl: (user as any)?.avatarUrl || null },
      reactions: [],
      files: [],
    };
    addReply(activeThreadId, optimisticReply);
    setReplyContent('');
    textareaRef.current?.focus();

    try {
      // Send via REST API with threadParentId
      const saved = await apiFetch<any>(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: text, threadParentId: activeThreadId }),
      });

      // Replace optimistic reply with real one
      const currentReplies = useThreadsStore.getState().replies[activeThreadId] || [];
      const filtered = currentReplies.filter((r: any) => r.id !== tempId);
      useThreadsStore.setState((s) => ({
        replies: { ...s.replies, [activeThreadId]: [...filtered, saved] },
      }));
    } catch {
      // Remove optimistic reply on failure
      const currentReplies = useThreadsStore.getState().replies[activeThreadId] || [];
      useThreadsStore.setState((s) => ({
        replies: { ...s.replies, [activeThreadId]: currentReplies.filter((r: any) => r.id !== tempId) },
      }));
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  }

  return (
    <div className="flex h-full w-full flex-col border-l border-slack-border bg-white">
      <div className="flex items-center justify-between border-b border-slack-border px-4 py-3">
        <h2 className="text-sm font-semibold text-gray-900">Thread</h2>
        <button onClick={closeThread} className="text-slack-gray-text hover:text-gray-700 text-lg">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-slack-border pb-2">
          <MessageItem message={parentMessage} channelId={channelId} />
        </div>
        <div className="py-2">
          <p className="px-5 text-xs text-slack-gray-text mb-2">{threadReplies.length} Antwort{threadReplies.length !== 1 ? 'en' : ''}</p>
          {threadReplies.map((reply: any) => (
            <MessageItem key={reply.id} message={reply} channelId={channelId} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-slack-border px-4 py-3">
        <div className="flex items-end gap-2 rounded-lg border border-slack-input-border bg-white px-3 py-2">
          <textarea
            ref={textareaRef}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Antworten..."
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-slack-gray-text"
            rows={1}
            autoFocus
          />
          <button onClick={sendReply} disabled={!replyContent.trim() || sending}
            className="rounded bg-slack-green px-3 py-1 text-sm text-white hover:bg-slack-green-hover disabled:opacity-50">
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}
