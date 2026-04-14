'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface Edit {
  id: string;
  content: string;
  editedAt: string;
}

interface MessageEditHistoryModalProps {
  messageId: string;
  onClose: () => void;
}

export function MessageEditHistoryModal({ messageId, onClose }: MessageEditHistoryModalProps) {
  const [edits, setEdits] = useState<Edit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Edit[]>(`/messages/${messageId}/edits`)
      .then(setEdits)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [messageId]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-900">Bearbeitungs-Verlauf</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-4">Laden...</p>
          ) : edits.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Kein Bearbeitungs-Verlauf verfuegbar.</p>
          ) : (
            edits.map((edit, i) => (
              <div key={edit.id} className="rounded-lg bg-gray-50 border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500">
                    {i === 0 ? 'Neueste Version (vor letzter Bearbeitung)' : `Aeltere Version (${edits.length - i})`}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(edit.editedAt).toLocaleString('de-DE', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-wrap">{edit.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end px-6 py-4 border-t flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
            Schliessen
          </button>
        </div>
      </div>
    </div>
  );
}
