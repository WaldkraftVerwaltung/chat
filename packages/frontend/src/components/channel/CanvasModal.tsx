'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

/**
 * Canvas-Dialog: Erstellt ein Canvas-Dokument (als spezielle Nachricht im Kanal gespeichert).
 * Hört auf `window.dispatchEvent('open-canvas', { channelId })`.
 */
export function CanvasModal() {
  const [open, setOpen] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    function handleOpenCanvas(e: Event) {
      const detail = (e as CustomEvent).detail as { channelId: string };
      if (!detail?.channelId) return;
      setChannelId(detail.channelId);
      setTitle('');
      setContent('');
      setOpen(true);
    }
    window.addEventListener('open-canvas', handleOpenCanvas as EventListener);
    return () => window.removeEventListener('open-canvas', handleOpenCanvas as EventListener);
  }, []);

  async function handleSave() {
    if (!channelId || !title.trim()) {
      addToast('Bitte einen Titel eingeben', 'error');
      return;
    }
    setSaving(true);
    try {
      const canvasBody = `📋 **Canvas: ${title}**\n\n${content || '_Leeres Canvas_'}`;
      await apiFetch(`/channels/${channelId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: canvasBody }),
      });
      addToast('Canvas erstellt', 'success');
      setOpen(false);
    } catch (err: any) {
      addToast('Canvas konnte nicht erstellt werden', 'error');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={() => !saving && setOpen(false)}>
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Canvas erstellen</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            disabled={saving}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Unbenanntes Canvas"
            className="w-full text-2xl font-bold text-gray-900 outline-none placeholder:text-gray-300 mb-4"
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Hier Notizen, Ideen, Dokumentation schreiben..."
            rows={14}
            className="w-full text-sm text-gray-700 outline-none placeholder:text-gray-400 resize-none leading-relaxed"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t bg-gray-50 rounded-b-xl">
          <span className="text-xs text-gray-500">
            Das Canvas wird als Nachricht im Kanal geteilt.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(false)}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-md disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#007a5a] hover:bg-[#006644] rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Speichern...' : 'Erstellen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
