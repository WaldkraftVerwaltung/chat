'use client';
import { useState, useRef, KeyboardEvent, useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { EmojiPicker } from './EmojiPicker';

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

export function MessageInput({ channelId, threadParentId }: { channelId: string; threadParentId?: string }) {
  const [content, setContent] = useState('');
  const [pendingFile, setPendingFile] = useState<{ id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
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

  function sendMessage() {
    const text = content.trim();
    if (!text && !pendingFile) return;
    getSocket().emit('message:send', { channelId, content: text || ' ', fileIds: pendingFile ? [pendingFile.id] : [], threadParentId });
    setContent('');
    setPendingFile(null);
    textareaRef.current?.focus();
    clearTimeout(draftTimeout.current);
    apiFetch('/drafts', {
      method: 'PUT',
      body: JSON.stringify({ channelId, threadParentId: threadParentId || undefined, content: '' }),
    }).catch(() => {});
  }

  function handleInput(value: string) {
    setContent(value);
    const socket = getSocket();
    socket.emit('typing:start', { channelId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => { socket.emit('typing:stop', { channelId }); }, 3000);
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

  const canSend = !uploading && (content.trim().length > 0 || !!pendingFile);

  return (
    <div className="border-t bg-white px-5 py-3">
      {/* File preview */}
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded border bg-gray-50 px-3 py-1.5 text-sm">
          <span className="truncate text-gray-700 max-w-[300px]">{pendingFile.originalFilename}</span>
          <button onClick={() => setPendingFile(null)} className="ml-auto text-gray-400 hover:text-gray-600" title="Entfernen">&#x2715;</button>
        </div>
      )}

      {/* Formatting toolbar */}
      {showFormatBar && (
        <div className="mb-1 flex items-center gap-0.5 rounded-t-lg border border-b-0 bg-gray-50 px-2 py-1">
          <FmtBtn label="B" title="Fett (*text*)" onClick={() => wrapSelection('*', '*')} className="font-bold" />
          <FmtBtn label="I" title="Kursiv (_text_)" onClick={() => wrapSelection('_', '_')} className="italic" />
          <FmtBtn label="S" title="Durchgestrichen (~text~)" onClick={() => wrapSelection('~', '~')} className="line-through" />
          <FmtBtn label="&lt;/&gt;" title="Code" onClick={() => wrapSelection('`', '`')} className="font-mono text-xs" />
          <div className="w-px h-5 bg-gray-300 mx-1" />
          <FmtBtn label="&quot;&quot;" title="Blockzitat (> text)" onClick={() => prependLines('> ')} />
          <FmtBtn label="1." title="Nummerierte Liste" onClick={() => prependLines('1. ')} />
          <FmtBtn label="*" title="Aufzaehlung" onClick={() => prependLines('* ')} />
          <FmtBtn label="Link" title="Link einfuegen" onClick={() => wrapSelection('[', '](url)')} />
        </div>
      )}

      <div className={`flex flex-col rounded-lg border bg-gray-50 ${showFormatBar ? 'rounded-t-none border-t' : ''}`}>
        {/* Mention autocomplete dropdown */}
        {mentionQuery !== null && mentionResults.length > 0 && (
          <div className="border-b bg-white rounded-t-lg shadow-inner">
            {mentionResults.slice(0, 8).map((member, i) => (
              <button
                key={member.id}
                onClick={() => insertMention(member)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                  i === selectedMentionIndex ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">@{member.displayName}</span>
              </button>
            ))}
          </div>
        )}

        {/* Channel autocomplete dropdown */}
        {channelQuery !== null && channelResults.length > 0 && (
          <div className="border-b bg-white rounded-t-lg shadow-inner">
            {channelResults.slice(0, 8).map((ch, i) => (
              <button
                key={ch.id}
                onClick={() => insertChannelRef(ch)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm ${
                  i === selectedMentionIndex ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="font-medium">#{ch.name}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 px-3 py-2">
          {/* File attach */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 disabled:opacity-50"
            title="Datei anhaengen"
          >
            {uploading ? (
              <span className="text-xs">...</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
            )}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nachricht schreiben..."
            className="flex-1 resize-none bg-transparent text-sm outline-none"
            rows={1}
          />

          {/* Formatting toggle */}
          <button
            onClick={() => setShowFormatBar(!showFormatBar)}
            className={`rounded p-1 text-sm font-semibold transition-colors ${
              showFormatBar ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200'
            }`}
            title="Formatierung"
          >
            Aa
          </button>

          {/* Emoji button */}
          <div className="relative">
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              title="Emoji"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2 z-50">
                <EmojiPicker
                  onSelect={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
          </div>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={!canSend}
            className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            Senden
          </button>
        </div>
      </div>
    </div>
  );
}

function FmtBtn({ label, title, onClick, className = '' }: { label: string; title: string; onClick: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-0.5 text-sm text-gray-600 hover:bg-gray-200 transition-colors ${className}`}
      title={title}
    >
      {label}
    </button>
  );
}
