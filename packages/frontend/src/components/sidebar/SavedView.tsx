'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useRouter } from 'next/navigation';

type SavedStatus = 'in_progress' | 'completed' | 'archived';

const STATUS_TABS: { id: SavedStatus; label: string }[] = [
  { id: 'in_progress', label: 'In Bearbeitung' },
  { id: 'completed', label: 'Erledigt' },
  { id: 'archived', label: 'Archiviert' },
];

export function SavedView() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [activeStatus, setActiveStatus] = useState<SavedStatus>('in_progress');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch<any[]>('/saved-items')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusChange(id: string, status: SavedStatus) {
    try {
      await apiFetch(`/saved-items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setItems((prev) => prev.map((item) => item.id === id ? { ...item, status } : item));
    } catch {}
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/saved-items/${id}`, { method: 'DELETE' });
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch {}
  }

  function navigateToMessage(item: any) {
    const msg = item.message;
    if (!msg) return;
    if (msg.channelId) router.push(`/channel/${msg.channelId}?msg=${msg.id}`);
    else if (msg.dmConversationId) router.push(`/dm/${msg.dmConversationId}?msg=${msg.id}`);
  }

  const filtered = items.filter((item) => item.status === activeStatus);

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="px-3 py-2 flex-shrink-0">
        <h2 className="text-sm font-semibold text-slack-text-bright">Spaeter</h2>
      </div>

      {/* Status tabs */}
      <div className="flex border-b border-white/10 flex-shrink-0">
        {STATUS_TABS.map((tab) => {
          const count = items.filter((i) => i.status === tab.id).length;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveStatus(tab.id)}
              className={`flex-1 px-1 py-1.5 text-[10px] font-medium transition-colors ${
                activeStatus === tab.id
                  ? 'border-b-2 border-white text-white'
                  : 'text-slack-text hover:text-white'
              }`}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1 text-[9px] bg-white/20 text-white rounded-full px-1">{count}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="px-3 py-4 text-xs text-slack-text">Laden...</p>
        ) : filtered.length === 0 ? (
          <p className="px-3 py-4 text-xs text-slack-text">Keine Eintraege in dieser Kategorie.</p>
        ) : (
          filtered.map((item) => {
            const msg = item.message;
            return (
              <div key={item.id} className="group border-b border-white/5 px-3 py-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    {msg?.user && (
                      <p className="text-[11px] font-semibold text-slack-text-bright truncate">
                        {msg.user.displayName}
                      </p>
                    )}
                    <p
                      onClick={() => navigateToMessage(item)}
                      className="text-xs text-slack-text line-clamp-2 cursor-pointer hover:text-white mt-0.5"
                    >
                      {msg?.content || 'Nachricht nicht verfuegbar'}
                    </p>
                    {item.remindAt && (
                      <p className={`text-[10px] mt-0.5 flex items-center gap-1 ${
                        new Date(item.remindAt) <= new Date()
                          ? 'text-yellow-400'
                          : 'text-slack-text'
                      }`}>
                        <span>⏰</span>
                        <span>
                          {new Date(item.remindAt) <= new Date()
                            ? 'Erinnerung faellig'
                            : `Erinnerung: ${new Date(item.remindAt).toLocaleString('de-DE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
                          }
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                {/* Actions */}
                <div className="hidden group-hover:flex items-center gap-1 mt-1">
                  {activeStatus !== 'in_progress' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'in_progress')}
                      className="text-[10px] text-slack-text hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      Wieder aufnehmen
                    </button>
                  )}
                  {activeStatus !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'completed')}
                      className="text-[10px] text-slack-text hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      Erledigt
                    </button>
                  )}
                  {activeStatus !== 'archived' && (
                    <button
                      onClick={() => handleStatusChange(item.id, 'archived')}
                      className="text-[10px] text-slack-text hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
                    >
                      Archivieren
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[10px] text-red-400 hover:text-red-300 px-1.5 py-0.5 rounded hover:bg-white/10 ml-auto"
                  >
                    Entfernen
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
