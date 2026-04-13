'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { getSocket } from '@/lib/socket';

export function MessageInput({ channelId }: { channelId: string }) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeout = useRef<NodeJS.Timeout>();

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function sendMessage() {
    const text = content.trim();
    if (!text) return;
    getSocket().emit('message:send', { channelId, content: text });
    setContent('');
    textareaRef.current?.focus();
  }

  function handleInput(value: string) {
    setContent(value);
    const socket = getSocket();
    socket.emit('typing:start', { channelId });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => { socket.emit('typing:stop', { channelId }); }, 3000);
  }

  return (
    <div className="border-t bg-white px-5 py-3">
      <div className="flex items-end gap-2 rounded-lg border bg-gray-50 px-3 py-2">
        <textarea ref={textareaRef} value={content} onChange={(e) => handleInput(e.target.value)} onKeyDown={handleKeyDown}
          placeholder="Nachricht schreiben..." className="flex-1 resize-none bg-transparent text-sm outline-none" rows={1} />
        <button onClick={sendMessage} disabled={!content.trim()} className="rounded bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700 disabled:opacity-50">Senden</button>
      </div>
    </div>
  );
}
