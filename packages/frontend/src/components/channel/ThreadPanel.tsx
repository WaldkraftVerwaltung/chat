'use client';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { useThreadsStore } from '@/stores/threads.store';
import { useMessagesStore } from '@/stores/messages.store';
import { MessageItem } from './MessageItem';
import { getSocket } from '@/lib/socket';

export function ThreadPanel({ channelId }: { channelId: string }) {
  const { activeThreadId, replies, closeThread, fetchReplies } = useThreadsStore();
  const messages = useMessagesStore((s) => s.messagesByChannel[channelId] || []);
  const parentMessage = messages.find((m) => m.id === activeThreadId);
  const threadReplies = activeThreadId ? (replies[activeThreadId] || []) : [];
  const [replyContent, setReplyContent] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeThreadId) fetchReplies(activeThreadId);
  }, [activeThreadId, fetchReplies]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadReplies.length]);

  if (!activeThreadId || !parentMessage) return null;

  function sendReply() {
    const text = replyContent.trim();
    if (!text || !activeThreadId) return;
    getSocket().emit('message:send', { channelId, content: text, threadParentId: activeThreadId });
    setReplyContent('');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }
  }

  return (
    <div className="flex h-full w-96 flex-col border-l bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Thread</h2>
        <button onClick={closeThread} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b pb-2">
          <MessageItem message={parentMessage} channelId={channelId} />
        </div>
        <div className="py-2">
          <p className="px-5 text-xs text-gray-500 mb-2">{threadReplies.length} Antwort{threadReplies.length !== 1 ? 'en' : ''}</p>
          {threadReplies.map((reply: any) => (
            <MessageItem key={reply.id} message={reply} channelId={channelId} />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t px-4 py-3">
        <div className="flex items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
          <textarea value={replyContent} onChange={(e) => setReplyContent(e.target.value)} onKeyDown={handleKeyDown}
            placeholder="Antworten..." className="flex-1 resize-none bg-transparent text-sm outline-none" rows={1} />
          <button onClick={sendReply} disabled={!replyContent.trim()} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">Senden</button>
        </div>
      </div>
    </div>
  );
}
