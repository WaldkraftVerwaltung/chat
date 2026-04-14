'use client';
import { useState, useRef, KeyboardEvent, useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { EmojiPicker } from './EmojiPicker';
import { VoiceRecorder } from './VoiceRecorder';
import { useMessagesStore } from '@/stores/messages.store';
import { useAuthStore } from '@/stores/auth.store';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ChannelMember {
  id: string;
  displayName: string;
  avatarUrl: string | null;
}

interface ChannelRef {
  id: string;
  name: string;
}

interface MessageInputProps {
  channelId: string;
  threadParentId?: string;
  channelName?: string;
}

export function MessageInput({ channelId, threadParentId, channelName }: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [sendError, setSendError] = useState(false);
  const [showFormatBar, setShowFormatBar] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [channelQuery, setChannelQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<ChannelMember[]>([]);
  const [channelResults, setChannelResults] = useState<ChannelRef[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const draftTimeout = useRef<NodeJS.Timeout>();

  // Auto-resize textarea on content change
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [content]);

  // Load draft on channel mount
  useEffect(() => {
    apiFetch<any[]>('/drafts').then((drafts) => {
      const draft = drafts.find((d) =>
        d.channelId === channelId && (d.threadParentId || null) === (threadParentId || null)
      );
      if (draft) setContent(draft.content);
    }).catch(() => {});
  }, [channelId, threadParentId]);

  // Auto-save draft with 2s debounce
  const saveDraft = useCallback((value: string) => {
    clearTimeout(draftTimeout.current);
    draftTimeout.current = setTimeout(() => {
      if (value.trim()) {
        apiFetch('/drafts', {
          method: 'PUT',
          body: JSON.stringify({ channelId, threadParentId: threadParentId || undefined, content: value }),
        }).catch(() => {});
      }
    }, 2000);
  }, [channelId, threadParentId]);

  // Fetch mention results
  useEffect(() => {
    if (mentionQuery === null) { setMentionResults([]); return; }
    apiFetch<ChannelMember[]>(`/channels/${channelId}/members?search=${encodeURIComponent(mentionQuery)}`)
      .then(setMentionResults)
      .catch(() => setMentionResults([]));
  }, [mentionQuery, channelId]);

  // Fetch channel results
  useEffect(() => {
    if (channelQuery === null) { setChannelResults([]); return; }
    apiFetch<ChannelRef[]>(`/channels?search=${encodeURIComponent(channelQuery)}`)
      .then(setChannelResults)
      .catch(() => setChannelResults([]));
  }, [channelQuery]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Handle mention/channel autocomplete navigation
    if (mentionQuery !== null && mentionResults.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedMentionIndex((i) => Math.min(i + 1, mentionResults.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedMentionIndex((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(mentionResults[selectedMentionIndex]);
        return;
      }
      if (e.key === 'Escape') { setMentionQuery(null); return; }
    }
    if (channelQuery !== null && channelResults.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedMentionIndex((i) => Math.min(i + 1, channelResults.length - 1)); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedMentionIndex((i) => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertChannelRef(channelResults[selectedMentionIndex]);
        return;
      }
      if (e.key === 'Escape') { setChannelQuery(null); return; }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); return; }
    // Arrow-up on empty input: edit last own message
    if (e.key === 'ArrowUp' && !content.trim()) {
      e.preventDefault();
      const msgs = useMessagesStore.getState().messagesByChannel[channelId] || [];
      const userId = useAuthStore.getState().user?.id;
      const lastOwn = [...msgs].reverse().find((m) => m.userId === userId && !m.isDeleted);
      if (lastOwn) {
        window.dispatchEvent(new CustomEvent('edit-message', { detail: { messageId: lastOwn.id } }));
      }
    }
  }

  function insertMention(member: ChannelMember) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const text = content;
    const before = text.substring(0, pos);
    const atIndex = before.lastIndexOf('@');
    if (atIndex === -1) return;
    const replacement = `@${member.displayName.replace(/\s/g, '_')} `;
    const newContent = text.substring(0, atIndex) + replacement + text.substring(pos);
    setContent(newContent);
    setMentionQuery(null);
    setSelectedMentionIndex(0);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = atIndex + replacement.length;
      textarea.focus();
    }, 0);
  }

  function insertChannelRef(channel: ChannelRef) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const text = content;
    const before = text.substring(0, pos);
    const hashIndex = before.lastIndexOf('#');
    if (hashIndex === -1) return;
    const replacement = `#${channel.name} `;
    const newContent = text.substring(0, hashIndex) + replacement + text.substring(pos);
    setContent(newContent);
    setChannelQuery(null);
    setSelectedMentionIndex(0);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = hashIndex + replacement.length;
      textarea.focus();
    }, 0);
  }

  async function sendMessage() {
    const text = content.trim();
    if (!text && !pendingFile) return;

    // Optimistic update — show message immediately
    const tempId = 'temp-' + Date.now();
    const user = useAuthStore.getState().user;
    const optimisticMsg = {
      id: tempId,
      channelId,
      userId: user?.id || '',
      content: text || ' ',
      isEdited: false,
      isDeleted: false,
      isPinned: false,
      threadParentId: threadParentId || null,
      alsoSentToChannel: false,
      isSystemMessage: false,
      createdAt: new Date().toISOString(),
      user: { id: user?.id || '', displayName: user?.displayName || '', avatarUrl: user?.avatarUrl || null },
      reactions: [],
      files: pendingFile ? [pendingFile] : [],
    };

    useMessagesStore.getState().addMessage(channelId, optimisticMsg as any);
    setContent('');
    setPendingFile(null);
    setSendError(false);
    textareaRef.current?.focus();

    // Clear draft
    clearTimeout(draftTimeout.current);
    apiFetch('/drafts', {
      method: 'PUT',
      body: JSON.stringify({ channelId, threadParentId: threadParentId || undefined, content: '' }),
    }).catch(() => {});

    try {
      const body: any = { content: text || ' ' };
      if (threadParentId) body.threadParentId = threadParentId;

      const saved = await apiFetch<any>(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      // Replace optimistic message with real one
      useMessagesStore.getState().removeMessage(channelId, tempId);
      useMessagesStore.getState().addMessage(channelId, saved);
    } catch {
      // Remove optimistic message on failure
      useMessagesStore.getState().removeMessage(channelId, tempId);
      setSendError(true);
    }
  }

  function handleInput(value: string) {
    setContent(value);
    try {
      const socket = getSocket();
      socket.emit('typing:start', { channelId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => { socket.emit('typing:stop', { channelId }); }, 3000);
    } catch {
      // Socket not ready — typing indicator is non-critical
    }
    saveDraft(value);

    // Check for @mention trigger
    const textarea = textareaRef.current;
    if (textarea) {
      const pos = textarea.selectionStart;
      const before = value.substring(0, pos);
      const atMatch = before.match(/@(\w*)$/);
      const hashMatch = before.match(/#(\w*)$/);
      if (atMatch) {
        setMentionQuery(atMatch[1]);
        setChannelQuery(null);
        setSelectedMentionIndex(0);
      } else if (hashMatch) {
        setChannelQuery(hashMatch[1]);
        setMentionQuery(null);
        setSelectedMentionIndex(0);
      } else {
        setMentionQuery(null);
        setChannelQuery(null);
      }
    }
  }

  function wrapSelection(before: string, after: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const selected = text.substring(start, end);
    const replacement = before + (selected || 'text') + after;
    const newContent = text.substring(0, start) + replacement + text.substring(end);
    setContent(newContent);
    setTimeout(() => {
      if (selected) {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
      } else {
        textarea.selectionStart = start + before.length;
        textarea.selectionEnd = start + before.length + 4;
      }
      textarea.focus();
    }, 0);
  }

  function prependLines(prefix: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = content;
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = text.indexOf('\n', end);
    const selectedLines = text.substring(lineStart, lineEnd === -1 ? text.length : lineEnd);
    const prefixed = selectedLines.split('\n').map((line) => prefix + line).join('\n');
    const newContent = text.substring(0, lineStart) + prefixed + text.substring(lineEnd === -1 ? text.length : lineEnd);
    setContent(newContent);
    setTimeout(() => { textarea.focus(); }, 0);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error('Upload failed');
      const attachment = await res.json();
      setPendingFile(attachment);
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  function handleEmojiSelect(emoji: string) {
    const textarea = textareaRef.current;
    if (textarea) {
      const pos = textarea.selectionStart;
      const newContent = content.substring(0, pos) + emoji + content.substring(pos);
      setContent(newContent);
      setShowEmojiPicker(false);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = pos + emoji.length;
        textarea.focus();
      }, 0);
    } else {
      setContent(content + emoji);
      setShowEmojiPicker(false);
    }
  }

  function triggerMention() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const newContent = content.substring(0, pos) + '@' + content.substring(pos);
    setContent(newContent);
    setMentionQuery('');
    setSelectedMentionIndex(0);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = pos + 1;
      textarea.focus();
    }, 0);
  }

  async function startVideoMeeting() {
    const roomId = Math.random().toString(36).substring(2, 8) + '-' +
                   Math.random().toString(36).substring(2, 6) + '-' +
                   Math.random().toString(36).substring(2, 5);
    const meetUrl = `https://meet.google.com/${roomId}`;

    try {
      await apiFetch(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: `📹 Video-Meeting gestartet: ${meetUrl}\n\nKlicke auf den Link um beizutreten.` }),
      });
      window.open(meetUrl, '_blank');
    } catch {}
  }

  const canSend = !uploading && (content.trim().length > 0 || !!pendingFile);
  const placeholderText = channelName
    ? `Nachricht an #${channelName}`
    : 'Nachricht schreiben...';

  return (
    <div className="bg-white px-5 pb-4 pt-1">
      {/* Send error toast */}
      {sendError && (
        <div className="mb-2 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700">
          <span>Nachricht konnte nicht gesendet werden.</span>
          <button onClick={() => setSendError(false)} className="ml-auto text-red-500 hover:text-red-700">&#x2715;</button>
        </div>
      )}

      {/* File preview */}
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded border border-slack-border bg-gray-50 px-3 py-1.5 text-sm">
          <span className="truncate text-gray-700 max-w-[300px]">{pendingFile.originalFilename}</span>
          <button onClick={() => setPendingFile(null)} className="ml-auto text-slack-gray-text hover:text-gray-700" title="Entfernen">&#x2715;</button>
        </div>
      )}

      <div className="rounded-lg border border-slack-input-border bg-white">
        {/* Mention autocomplete dropdown */}
        {mentionQuery !== null && mentionResults.length > 0 && (
          <div className="border-b border-slack-border bg-white rounded-t-lg shadow-inner">
            {mentionResults.slice(0, 8).map((member, i) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                  i === selectedMentionIndex ? 'bg-slack-mention-bg text-slack-blue' : 'text-gray-700 hover:bg-slack-msg-hover'
                }`}
              >
                <span className="font-medium">@{member.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Channel autocomplete dropdown */}
        {channelQuery !== null && channelResults.length > 0 && (
          <div className="border-b border-slack-border bg-white rounded-t-lg shadow-inner">
            {channelResults.slice(0, 8).map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => insertChannelRef(ch)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                  i === selectedMentionIndex ? 'bg-slack-mention-bg text-slack-blue' : 'text-gray-700 hover:bg-slack-msg-hover'
                }`}
              >
                <span className="font-medium">#{ch.name}</span>
              </button>
            ))}
          </div>
        )}

        {/* Formatting toolbar (toggled by Aa button) */}
        {showFormatBar && (
          <div className="flex items-center gap-0.5 border-b border-slack-border px-2 py-1">
            <FmtBtn title="Fett" onClick={() => wrapSelection('*', '*')}>
              <span className="font-bold text-[13px]">B</span>
            </FmtBtn>
            <FmtBtn title="Kursiv" onClick={() => wrapSelection('_', '_')}>
              <span className="italic text-[13px]">I</span>
            </FmtBtn>
            <FmtBtn title="Unterstrichen" onClick={() => wrapSelection('__', '__')}>
              <span className="underline text-[13px]">U</span>
            </FmtBtn>
            <FmtBtn title="Durchgestrichen" onClick={() => wrapSelection('~', '~')}>
              <span className="line-through text-[13px]">S</span>
            </FmtBtn>
            <Separator />
            <FmtBtn title="Link" onClick={() => wrapSelection('[', '](url)')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </FmtBtn>
            <FmtBtn title="Nummerierte Liste" onClick={() => prependLines('1. ')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </FmtBtn>
            <FmtBtn title="Aufzaehlung" onClick={() => prependLines('- ')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </FmtBtn>
            <Separator />
            <FmtBtn title="Blockzitat" onClick={() => prependLines('> ')}>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16h6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </FmtBtn>
            <FmtBtn title="Code" onClick={() => wrapSelection('`', '`')}>
              <span className="font-mono text-xs">&lt;/&gt;</span>
            </FmtBtn>
            <FmtBtn title="Code-Block" onClick={() => wrapSelection('```\n', '\n```')}>
              <span className="font-mono text-xs">{'{}'}</span>
            </FmtBtn>
          </div>
        )}

        {/* Textarea */}
        <div className="px-3 py-2">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholderText}
            className="w-full resize-none bg-transparent text-sm text-gray-900 outline-none placeholder:text-slack-gray-text"
            rows={1}
            style={{ minHeight: '24px', maxHeight: '200px' }}
          />
        </div>

        {/* Bottom toolbar — always visible */}
        <div className="flex items-center justify-between border-t border-slack-border px-1.5 py-1">
          {/* Left side icons */}
          <div className="flex items-center gap-0.5">
            {/* Attach file */}
            <ToolbarBtn
              title="Datei anhaengen"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <span className="text-xs text-slack-gray-text">...</span>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </ToolbarBtn>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

            {/* Format toggle (Aa) */}
            <ToolbarBtn
              title="Formatierung"
              onClick={() => setShowFormatBar(!showFormatBar)}
              active={showFormatBar}
            >
              <span className="text-sm font-semibold leading-none">Aa</span>
            </ToolbarBtn>

            {/* Emoji picker */}
            <div className="relative">
              <ToolbarBtn
                title="Emoji"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                active={showEmojiPicker}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </ToolbarBtn>
              {showEmojiPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-50">
                  <EmojiPicker
                    onSelect={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </div>
              )}
            </div>

            {/* Mention button */}
            <ToolbarBtn title="Erwaehnung (@)" onClick={triggerMention}>
              <span className="text-sm font-semibold leading-none">@</span>
            </ToolbarBtn>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-300 mx-1" />

            {/* Video clip */}
            <button title="Videoclip aufnehmen" className="p-1.5 rounded hover:bg-gray-100 text-slack-gray-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>

            {/* Audio clip */}
            <button title="Sprachnachricht aufnehmen" className="p-1.5 rounded hover:bg-gray-100 text-slack-gray-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Separator */}
            <div className="w-px h-5 bg-gray-300 mx-1" />

            {/* Shortcut/Canvas */}
            <button title="Erstellen" className="p-1.5 rounded hover:bg-gray-100 text-slack-gray-text">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </button>
          </div>

          {/* Right side — Send button */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={sendMessage}
              disabled={!canSend}
              className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                canSend
                  ? 'bg-slack-green text-white hover:bg-slack-green-hover'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Senden"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
            <button title="Nachricht planen" className="p-1 text-slack-gray-text hover:text-gray-600">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function Separator() {
  return <div className="mx-0.5 h-5 w-px bg-gray-300" />;
}

function FmtBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center rounded px-1.5 py-1 text-slack-gray-text hover:bg-slack-msg-hover hover:text-gray-700 transition-colors"
      title={title}
    >
      {children}
    </button>
  );
}

function ToolbarBtn({ title, onClick, children, active, disabled }: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
        active
          ? 'text-slack-blue bg-slack-mention-bg'
          : 'text-slack-gray-text hover:text-gray-700 hover:bg-slack-msg-hover'
      } disabled:opacity-50`}
      title={title}
    >
      {children}
    </button>
  );
}
