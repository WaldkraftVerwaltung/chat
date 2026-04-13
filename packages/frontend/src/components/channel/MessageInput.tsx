'use client';
import { useState, useRef, KeyboardEvent, useEffect, useCallback } from 'react';
import { getSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function MessageInput({ channelId, threadParentId }: { channelId: string; threadParentId?: string }) {
  const [content, setContent] = useState('');
  const [pendingFile, setPendingFile] = useState<{ id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null } | null>(null);
  const [uploading, setUploading] = useState(false);
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

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function sendMessage() {
    const text = content.trim();
    if (!text && !pendingFile) return;
    getSocket().emit('message:send', { channelId, content: text || ' ', fileIds: pendingFile ? [pendingFile.id] : [], threadParentId });
    setContent('');
    setPendingFile(null);
    textareaRef.current?.focus();
    // Clear draft after sending
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

  const canSend = !uploading && (content.trim().length > 0 || !!pendingFile);

  return (
    <div className="border-t bg-white px-5 py-3">
      {pendingFile && (
        <div className="mb-2 flex items-center gap-2 rounded border bg-gray-50 px-3 py-1.5 text-sm">
          <span className="truncate text-gray-700 max-w-[300px]">{pendingFile.originalFilename}</span>
          <button onClick={() => setPendingFile(null)} className="ml-auto text-gray-400 hover:text-gray-600" title="Entfernen">&#x2715;</button>
        </div>
      )}
      <div className="flex items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
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
        <textarea ref={textareaRef} value={content} onChange={(e) => handleInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben..." className="flex-1 resize-none bg-transparent text-sm outline-none" rows={1} />
        <button onClick={sendMessage} disabled={!canSend} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">Senden</button>
      </div>
    </div>
  );
}
