'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  emoji: string | null;
  createdAt: string;
}

interface ChannelBookmarksPanelProps {
  channelId: string;
  onClose: () => void;
}

export function ChannelBookmarksPanel({ channelId, onClose }: ChannelBookmarksPanelProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newEmoji, setNewEmoji] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    setLoading(true);
    apiFetch<Bookmark[]>(`/channels/${channelId}/bookmarks`)
      .then(setBookmarks)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [channelId]);

  async function handleAdd() {
    if (!newTitle.trim() || !newUrl.trim()) return;
    setSaving(true);
    try {
      const created = await apiFetch<Bookmark>(`/channels/${channelId}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify({ title: newTitle.trim(), url: newUrl.trim(), emoji: newEmoji.trim() || undefined }),
      });
      setBookmarks((prev) => [...prev, created]);
      setNewTitle('');
      setNewUrl('');
      setNewEmoji('');
      setShowAdd(false);
      addToast('Lesezeichen hinzugefuegt', 'success');
    } catch {
      addToast('Fehler beim Hinzufügen', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/channels/${channelId}/bookmarks/${id}`, { method: 'DELETE' });
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      addToast('Lesezeichen entfernt', 'success');
    } catch {
      addToast('Fehler beim Entfernen', 'error');
    }
  }

  return (
    <div className="flex flex-col h-full border-l bg-white w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900 text-sm">Lesezeichen</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
      </div>

      {/* Bookmarks list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="p-4 text-sm text-gray-400 text-center">Laden...</p>
        ) : bookmarks.length === 0 && !showAdd ? (
          <div className="p-6 text-center">
            <p className="text-2xl mb-2">🔖</p>
            <p className="text-sm font-medium text-gray-700 mb-1">Keine Lesezeichen</p>
            <p className="text-xs text-gray-500 mb-4">Fuege Links hinzu, die für diesen Channel wichtig sind.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookmarks.map((b) => (
              <li key={b.id} className="group flex items-center gap-3 px-4 py-3 hover:bg-gray-50">
                <span className="text-lg flex-shrink-0">{b.emoji || '🔗'}</span>
                <div className="flex-1 min-w-0">
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:underline truncate block"
                  >
                    {b.title}
                  </a>
                  <p className="text-xs text-gray-400 truncate">{b.url}</p>
                </div>
                <button
                  onClick={() => handleDelete(b.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity flex-shrink-0"
                  title="Entfernen"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        {/* Add bookmark form */}
        {showAdd && (
          <div className="p-4 border-t bg-gray-50 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="🔗"
                maxLength={2}
                className="w-12 rounded border border-gray-200 px-2 py-1.5 text-sm text-center outline-none focus:border-blue-400"
              />
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Titel"
                className="flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
                autoFocus
              />
            </div>
            <input
              type="url"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
              onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={saving || !newTitle.trim() || !newUrl.trim()}
                className="flex-1 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
              >
                {saving ? 'Hinzufügen...' : 'Hinzufügen'}
              </button>
              <button
                onClick={() => { setShowAdd(false); setNewTitle(''); setNewUrl(''); setNewEmoji(''); }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-200 rounded"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Add button */}
      {!showAdd && (
        <div className="border-t px-4 py-3">
          <button
            onClick={() => setShowAdd(true)}
            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
          >
            <span>+</span>
            <span>Lesezeichen hinzufügen</span>
          </button>
        </div>
      )}
    </div>
  );
}
