'use client';
import { useState, FormEvent } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

const PRESETS = [
  { emoji: '📅', text: 'Im Meeting' },
  { emoji: '🚗', text: 'Unterwegs' },
  { emoji: '🤒', text: 'Krank' },
  { emoji: '🌴', text: 'Im Urlaub' },
  { emoji: '🏠', text: 'Remote' },
];

type ExpiryOption =
  | 'never'
  | '30m'
  | '1h'
  | '4h'
  | 'today'
  | 'week'
  | 'custom';

function calcExpiry(option: ExpiryOption): Date | null {
  const now = new Date();
  switch (option) {
    case 'never':
      return null;
    case '30m':
      return new Date(now.getTime() + 30 * 60 * 1000);
    case '1h':
      return new Date(now.getTime() + 60 * 60 * 1000);
    case '4h':
      return new Date(now.getTime() + 4 * 60 * 60 * 1000);
    case 'today': {
      const eod = new Date(now);
      eod.setHours(23, 59, 59, 999);
      return eod;
    }
    case 'week': {
      const eow = new Date(now);
      // End of this Sunday (or next Sunday if today is Monday etc.)
      const dayOfWeek = eow.getDay(); // 0=Sun
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
      eow.setDate(eow.getDate() + daysUntilSunday);
      eow.setHours(23, 59, 59, 999);
      return eow;
    }
    default:
      return null;
  }
}

interface StatusDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StatusDialog({ isOpen, onClose }: StatusDialogProps) {
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);
  const [emoji, setEmoji] = useState('');
  const [text, setText] = useState('');
  const [expiry, setExpiry] = useState<ExpiryOption>('today');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function setStatus(statusEmoji: string, statusText: string, expiryOption?: ExpiryOption) {
    setLoading(true);
    try {
      const resolvedExpiry = expiryOption ?? expiry;
      const statusExpiry = calcExpiry(resolvedExpiry);
      const updated = await apiFetch<any>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          statusEmoji,
          statusText,
          ...(statusExpiry ? { statusExpiry: statusExpiry.toISOString() } : { statusExpiry: null }),
        }),
      });
      setUser({ ...user!, ...updated });
      onClose();
    } catch {} finally { setLoading(false); }
  }

  async function clearStatus() {
    await setStatus('', '', 'never');
  }

  function handlePreset(preset: typeof PRESETS[0]) {
    setEmoji(preset.emoji);
    setText(preset.text);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30" />
      <div
        className="relative w-full max-w-sm rounded-lg bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Status einstellen</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            aria-label="Schliessen"
          >
            &times;
          </button>
        </div>

        <div className="p-5">
          {/* Input row */}
          <div className="flex items-center border rounded-md overflow-hidden mb-4 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <button
              type="button"
              className="px-3 py-2 text-xl hover:bg-gray-100 transition-colors flex-shrink-0"
              title="Emoji auswaehlen"
              onClick={() => {/* emoji picker placeholder */}}
            >
              {emoji || '😀'}
            </button>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Was machst du gerade?"
              className="flex-1 py-2 text-sm outline-none"
            />
            {(emoji || text) && (
              <button
                type="button"
                onClick={() => { setEmoji(''); setText(''); }}
                className="px-3 py-2 text-gray-400 hover:text-gray-600 flex-shrink-0"
                title="Zuruecksetzen"
              >
                ⊗
              </button>
            )}
          </div>

          {/* Presets */}
          <div className="space-y-0.5 mb-5">
            {PRESETS.map((p) => (
              <button
                key={p.text}
                onClick={() => handlePreset(p)}
                className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
              >
                <span className="text-base">{p.emoji}</span>
                <span className="text-gray-800">{p.text}</span>
              </button>
            ))}
          </div>

          {/* Expiry section */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
              Status entfernen nach...
            </label>
            <select
              value={expiry}
              onChange={(e) => setExpiry(e.target.value as ExpiryOption)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="never">Nicht loeschen</option>
              <option value="30m">30 Minuten</option>
              <option value="1h">1 Stunde</option>
              <option value="4h">4 Stunden</option>
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="custom">Datum und Zeit auswaehlen</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t">
          <button
            onClick={clearStatus}
            className="text-sm text-red-600 hover:underline font-medium"
          >
            Status loeschen
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Abbrechen
            </button>
            <button
              onClick={() => setStatus(emoji, text)}
              disabled={loading}
              className="rounded-md bg-slack-green px-4 py-1.5 text-sm text-white hover:bg-slack-green-hover disabled:opacity-60"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
