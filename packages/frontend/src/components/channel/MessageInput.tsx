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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [channelQuery, setChannelQuery] = useState<string | null>(null);
  const [mentionResults, setMentionResults] = useState<ChannelMember[]>([]);
  const [channelResults, setChannelResults] = useState<ChannelRef[]>([]);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [unsent, setUnsent] = useState<{ messageId: string; countdown: number } | null>(null);
  const dragCounter = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plusMenuRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();
  const draftTimeout = useRef<NodeJS.Timeout>();
  const unsentInterval = useRef<ReturnType<typeof setInterval>>();

  // Close plus menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target as Node)) {
        setShowPlusMenu(false);
      }
    }
    if (showPlusMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPlusMenu]);

  // Countdown timer for unsend banner
  useEffect(() => {
    if (!unsent) return;
    unsentInterval.current = setInterval(() => {
      setUnsent((u) => {
        if (!u) return null;
        if (u.countdown <= 1) { clearInterval(unsentInterval.current); return null; }
        return { ...u, countdown: u.countdown - 1 };
      });
    }, 1000);
    return () => clearInterval(unsentInterval.current);
  }, [unsent?.messageId]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [content]);

  // Load draft
  useEffect(() => {
    apiFetch<any[]>('/drafts').then((drafts) => {
      const draft = drafts.find((d) =>
        d.channelId === channelId && (d.threadParentId || null) === (threadParentId || null)
      );
      if (draft) setContent(draft.content);
    }).catch(() => {});
  }, [channelId, threadParentId]);

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

  useEffect(() => {
    if (mentionQuery === null) { setMentionResults([]); return; }
    apiFetch<ChannelMember[]>(`/channels/${channelId}/members?search=${encodeURIComponent(mentionQuery)}`)
      .then(setMentionResults)
      .catch(() => setMentionResults([]));
  }, [mentionQuery, channelId]);

  useEffect(() => {
    if (channelQuery === null) { setChannelResults([]); return; }
    apiFetch<ChannelRef[]>(`/channels?search=${encodeURIComponent(channelQuery)}`)
      .then(setChannelResults)
      .catch(() => setChannelResults([]));
  }, [channelQuery]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
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

      useMessagesStore.getState().removeMessage(channelId, tempId);
      useMessagesStore.getState().addMessage(channelId, saved);
      clearInterval(unsentInterval.current);
      setUnsent({ messageId: saved.id, countdown: 15 });
    } catch {
      useMessagesStore.getState().removeMessage(channelId, tempId);
      setSendError(true);
    }
  }

  async function handleUnsend() {
    if (!unsent) return;
    const { messageId } = unsent;
    clearInterval(unsentInterval.current);
    setUnsent(null);
    try {
      await apiFetch(`/messages/${messageId}`, { method: 'DELETE' });
      useMessagesStore.getState().removeMessage(channelId, messageId);
    } catch { /* message already gone */ }
  }

  function handleInput(value: string) {
    setContent(value);
    try {
      const socket = getSocket();
      socket.emit('typing:start', { channelId });
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => { socket.emit('typing:stop', { channelId }); }, 3000);
    } catch { /* ignore */ }
    saveDraft(value);

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

  async function uploadFile(file: File) {
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

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
  }

  function handleDragEnter(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) setIsDragOver(true);
  }
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragOver(false);
  }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); e.stopPropagation(); }
  async function handleDrop(e: React.DragEvent) {
    e.preventDefault(); e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files?.[0];
    if (file) await uploadFile(file);
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

  const canSend = !uploading && (content.trim().length > 0 || !!pendingFile);
  const placeholderText = channelName
    ? `Nachricht an ${channelName.startsWith('#') ? '' : ''}${channelName}`
    : 'Nachricht schreiben...';

  return (
    <div
      className="bg-white px-5 pb-4 pt-1 relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {isDragOver && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-slack-blue bg-blue-50/90 pointer-events-none">
          <svg className="w-10 h-10 text-slack-blue mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-semibold text-slack-blue">Datei hier ablegen</p>
          <p className="text-xs text-blue-500 mt-0.5">Loslassen zum Hochladen</p>
        </div>
      )}

      {unsent && (
        <div className="mb-2 flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-800">
          <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Nachricht gesendet</span>
          <button
            onClick={handleUnsend}
            className="ml-2 font-semibold text-green-700 underline hover:text-green-900 transition-colors"
          >
            Widerrufen ({unsent.countdown}s)
          </button>
          <button
            onClick={() => { clearInterval(unsentInterval.current); setUnsent(null); }}
            className="ml-auto text-green-500 hover:text-green-700"
          >&#x2715;</button>
        </div>
      )}

      {sendError && (
        <div className="mb-2 flex items-center gap-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700">
          <span>Nachricht konnte nicht gesendet werden.</span>
          <button onClick={() => setSendError(false)} className="ml-auto text-red-500 hover:text-red-700">&#x2715;</button>
        </div>
      )}

      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded border border-slack-border bg-gray-50 px-3 py-1.5 text-sm">
          <span className="truncate text-gray-700 max-w-[300px]">{pendingFile.originalFilename}</span>
          <button onClick={() => setPendingFile(null)} className="ml-auto text-slack-gray-text hover:text-gray-700" title="Entfernen">&#x2715;</button>
        </div>
      )}

      <div className="rounded-lg border border-gray-300 bg-white overflow-hidden">
        {/* Mention autocomplete */}
        {mentionQuery !== null && mentionResults.length > 0 && (
          <div className="border-b border-gray-200 bg-white shadow-inner">
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

        {/* Channel autocomplete */}
        {channelQuery !== null && channelResults.length > 0 && (
          <div className="border-b border-gray-200 bg-white shadow-inner">
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

        {/* ═══════════════ OBERE FORMATTING-TOOLBAR (immer sichtbar) ═══════════════ */}
        <div className="flex items-center gap-0 border-b border-gray-200 bg-gray-50 px-2 py-1.5">
          <FmtBtn title="Fett" onClick={() => wrapSelection('*', '*')}>
            <span className="font-bold text-[15px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>B</span>
          </FmtBtn>
          <FmtBtn title="Kursiv" onClick={() => wrapSelection('_', '_')}>
            <span className="italic text-[15px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>I</span>
          </FmtBtn>
          <FmtBtn title="Unterstrichen" onClick={() => wrapSelection('__', '__')}>
            <span className="underline text-[15px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>U</span>
          </FmtBtn>
          <FmtBtn title="Durchgestrichen" onClick={() => wrapSelection('~', '~')}>
            <span className="line-through text-[15px] leading-none" style={{ fontFamily: 'Georgia, serif' }}>S</span>
          </FmtBtn>

          <SepVertical />

          <FmtBtn title="Link" onClick={() => wrapSelection('[', '](url)')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </FmtBtn>
          <FmtBtn title="Nummerierte Liste" onClick={() => prependLines('1. ')}>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <text x="0" y="7" fontSize="6" fontWeight="700">1</text>
              <line x1="6" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <text x="0" y="14" fontSize="6" fontWeight="700">2</text>
              <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="6" y1="19" x2="18" y2="19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </FmtBtn>
          <FmtBtn title="Aufzählung" onClick={() => prependLines('- ')}>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <circle cx="3" cy="5" r="1.3"/>
              <line x1="7" y1="5" x2="18" y2="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="3" cy="10" r="1.3"/>
              <line x1="7" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="3" cy="15" r="1.3"/>
              <line x1="7" y1="15" x2="18" y2="15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </FmtBtn>

          <SepVertical />

          <FmtBtn title="Zitat" onClick={() => prependLines('> ')}>
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <line x1="3" y1="5" x2="5" y2="5" strokeLinecap="round"/>
              <line x1="8" y1="5" x2="17" y2="5" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="5" y2="10" strokeLinecap="round"/>
              <line x1="8" y1="10" x2="14" y2="10" strokeLinecap="round"/>
              <line x1="3" y1="15" x2="5" y2="15" strokeLinecap="round"/>
              <line x1="8" y1="15" x2="17" y2="15" strokeLinecap="round"/>
            </svg>
          </FmtBtn>
          <FmtBtn title="Code" onClick={() => wrapSelection('`', '`')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
          </FmtBtn>
          <FmtBtn title="Code-Block" onClick={() => wrapSelection('```\n', '\n```')}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h1m4 0h1m-7 4h.01M7 8h.01M19 8v8a2 2 0 01-2 2H7a2 2 0 01-2-2V8a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </FmtBtn>
        </div>

        {isRecordingVoice ? (
          <div className="px-3 py-2.5">
            <VoiceRecorder
              channelId={channelId}
              onDone={() => setIsRecordingVoice(false)}
              onCancel={() => setIsRecordingVoice(false)}
            />
          </div>
        ) : (
          <>
            {/* Textarea */}
            <div className="px-3 py-3">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => handleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholderText}
                className="w-full resize-none bg-transparent text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
                rows={1}
                style={{ minHeight: '22px', maxHeight: '200px' }}
              />
            </div>

            {/* ═══════════════ UNTERE TOOLBAR ═══════════════ */}
            <div className="flex items-center justify-between px-2 py-1.5">
              {/* Left side */}
              <div className="flex items-center gap-0">
                {/* Plus button (im Kreis) */}
                <div className="relative" ref={plusMenuRef}>
                  <button
                    onClick={() => setShowPlusMenu(!showPlusMenu)}
                    title="Mehr hinzufügen"
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                      showPlusMenu ? 'bg-gray-200' : 'hover:bg-gray-100'
                    } text-gray-700 border border-gray-300`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  {showPlusMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-white shadow-xl border border-gray-200 py-1.5 z-50">
                      <button
                        onClick={() => { fileInputRef.current?.click(); setShowPlusMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Datei hochladen
                      </button>
                      <button
                        onClick={() => { window.dispatchEvent(new CustomEvent('open-canvas', { detail: { channelId } })); setShowPlusMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        Canvas erstellen
                      </button>
                      <button
                        onClick={() => { setIsRecordingVoice(true); setShowPlusMenu(false); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3"
                      >
                        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                        Sprachnachricht aufnehmen
                      </button>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

                {/* Aa Format (decorative) */}
                <BottomBtn title="Formatierung">
                  <span className="text-[14px] font-semibold text-gray-700 underline underline-offset-2 leading-none">Aa</span>
                </BottomBtn>

                {/* Emoji */}
                <div className="relative">
                  <BottomBtn title="Emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} active={showEmojiPicker}>
                    <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </BottomBtn>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full left-0 mb-2 z-50">
                      <EmojiPicker onSelect={handleEmojiSelect} onClose={() => setShowEmojiPicker(false)} />
                    </div>
                  )}
                </div>

                {/* Mention @ */}
                <BottomBtn title="Erwähnung (@)" onClick={triggerMention}>
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </BottomBtn>

                <SepVertical />

                {/* Video */}
                <BottomBtn
                  title="Video-Meeting starten"
                  onClick={() => window.dispatchEvent(new CustomEvent('start-call', { detail: { channelId, mediaType: 'video' } }))}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </BottomBtn>

                {/* Microphone */}
                <BottomBtn
                  title="Sprachnachricht aufnehmen"
                  onClick={() => setIsRecordingVoice(true)}
                >
                  <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </BottomBtn>

                <SepVertical />

                {/* Slash command */}
                <BottomBtn title="Slash-Befehle">
                  <div className="w-[18px] h-[18px] rounded-[3px] border-[1.3px] border-current flex items-center justify-center">
                    <span className="italic font-medium text-[10px] leading-none">/</span>
                  </div>
                </BottomBtn>
              </div>

              {/* Right side: Send + dropdown */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={sendMessage}
                  disabled={!canSend}
                  className={`flex items-center justify-center rounded-md w-8 h-8 transition-colors ${
                    canSend
                      ? 'bg-[#007a5a] text-white hover:bg-[#006644]'
                      : 'bg-transparent text-gray-400 hover:bg-gray-100'
                  }`}
                  title="Senden"
                >
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M1.5 17.5L18.5 10 1.5 2.5 1.5 8.5 13.5 10 1.5 11.5 1.5 17.5z" />
                  </svg>
                </button>
                <div className="w-px h-5 bg-gray-300 mx-0.5" />
                <button title="Nachricht planen" className="flex items-center justify-center w-6 h-8 rounded hover:bg-gray-100 text-gray-500">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* --- Sub-components --- */

function SepVertical() {
  return <div className="mx-1.5 h-5 w-px bg-gray-300" />;
}

function FmtBtn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded text-gray-700 hover:bg-gray-200 transition-colors"
      title={title}
    >
      {children}
    </button>
  );
}

function BottomBtn({ title, onClick, children, active, disabled }: {
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center w-8 h-8 rounded transition-colors ${
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-700 hover:bg-gray-100'
      } disabled:opacity-50`}
      title={title}
    >
      {children}
    </button>
  );
}
