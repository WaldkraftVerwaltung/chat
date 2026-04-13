'use client';
import { useState, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const PRESETS = [
  { emoji: '📅', text: 'Im Meeting', duration: '1h' },
  { emoji: '🚗', text: 'Unterwegs', duration: '30m' },
  { emoji: '🤒', text: 'Krank', duration: 'today' },
  { emoji: '🌴', text: 'Im Urlaub', duration: 'week' },
  { emoji: '🏠', text: 'Remote', duration: 'today' },
];

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatusDialog({ isOpen, onClose }: StatusDialogProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [emoji, setEmoji] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function setStatus(statusEmoji: string, statusText: string) {
    setLoading(true);
    try {
      const updated = await apiFetch<any>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ statusEmoji, statusText }),
      });
      setUser({ ...user!, ...updated });
      onClose();
    } catch {} finally { setLoading(false); }
  }

  async function clearStatus() {
    await setStatus('', '');
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative w-full max-w-sm rounded-lg bg-white p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4">Status setzen</h2>

        <div className="flex gap-2 mb-4">
          <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="😀" className="w-12 rounded border px-2 py-2 text-center text-lg" maxLength={2} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Was machst du gerade?" className="flex-1 rounded border px-3 py-2 text-sm" />
        </div>

        <div className="space-y-1 mb-4">
          {PRESETS.map((p) => (
            <button key={p.text} onClick={() => setStatus(p.emoji, p.text)}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100">
              <span>{p.emoji}</span><span>{p.text}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button onClick={clearStatus} className="text-sm text-red-600 hover:underline">Status loeschen</button>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100">Abbrechen</button>
            <button onClick={() => setStatus(emoji, text)} disabled={loading} className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Speichern</button>
          </div>
        </div>
      </div>
    </div>
  );
}
