'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

interface Draft {
  id: string;
  channelId: string | null;
  dmConversationId: string | null;
  threadParentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function DraftsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'drafts' | 'scheduled' | 'sent'>('drafts');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  useEffect(() => {
    apiFetch<Draft[]>('/drafts').then(setDrafts).catch(() => {});
    apiFetch<any[]>('/messages/scheduled').then(setScheduled).catch(() => {});
  }, []);

  function getDestinationLabel(d: Draft) {
    if (d.threadParentId) return 'Thread';
    if (d.dmConversationId) return 'Direktnachricht';
    if (d.channelId) return `#Channel`;
    return 'Kein Zielort';
  }

  function getTimeLabel(dateStr: string) {
    const d = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
    if (diffDays === 1) return 'Gestern';
    return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  }

  async function saveDraft(id: string) {
    try {
      await apiFetch(`/drafts`, {
        method: 'PUT',
        body: JSON.stringify({ channelId: drafts.find(d => d.id === id)?.channelId, content: editContent }),
      });
      setDrafts(drafts.map(d => d.id === id ? { ...d, content: editContent, updatedAt: new Date().toISOString() } : d));
      setEditingId(null);
    } catch {}
  }

  async function deleteDraft(id: string) {
    try {
      await apiFetch(`/drafts/${id}`, { method: 'DELETE' });
      setDrafts(drafts.filter(d => d.id !== id));
    } catch {}
  }

  async function sendDraft(d: Draft) {
    try {
      const target = d.channelId || d.dmConversationId;
      if (!target) return;
      await apiFetch(`/channels/${target}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: d.content, threadParentId: d.threadParentId }),
      });
      await deleteDraft(d.id);
      // Navigate to the channel/DM
      if (d.channelId) router.push(`/channel/${d.channelId}`);
      else if (d.dmConversationId) router.push(`/dm/${d.dmConversationId}`);
    } catch {}
  }

  function navigateToDraft(d: Draft) {
    if (d.channelId) router.push(`/channel/${d.channelId}`);
    else if (d.dmConversationId) router.push(`/dm/${d.dmConversationId}`);
  }

  return (
    <div className="flex-1 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-lg font-bold">Entwuerfe & Gesendet</h1>
          <div className="flex gap-4 mt-3">
            {[
              { id: 'drafts' as const, label: 'Entwuerfe', count: drafts.length },
              { id: 'scheduled' as const, label: 'Geplant', count: scheduled.length },
              { id: 'sent' as const, label: 'Gesendet', count: null },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-slack-blue text-slack-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs rounded-full px-1.5 py-0.5">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button className="flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          Bearbeiten
        </button>
      </div>

      <div className="p-6">
        {/* Info banner */}
        {activeTab === 'drafts' && showBanner && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-start gap-4">
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Alle deine ausgehenden Nachrichten</h3>
              <p className="text-sm text-gray-600 mt-1">Alles, was du sendest, als Entwurf speicherst und im Zeitplan eintraegst, ist jetzt hier zu finden.</p>
            </div>
            <button onClick={() => setShowBanner(false)} className="text-gray-400 hover:text-gray-600 text-lg flex-shrink-0">&times;</button>
          </div>
        )}

        {/* Drafts list */}
        {activeTab === 'drafts' && drafts.length === 0 && !showBanner && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-sm text-gray-500">Keine Entwuerfe vorhanden. Angefangene Nachrichten werden hier gespeichert.</p>
          </div>
        )}

        {activeTab === 'drafts' && drafts.length > 0 && (
          <div className="space-y-1">
            {drafts.map((d) => (
              <div key={d.id}
                className="group flex items-start gap-3 rounded-lg border border-gray-200 p-4 hover:shadow-sm hover:border-gray-300 transition-all cursor-pointer"
                onClick={() => editingId !== d.id && navigateToDraft(d)}>
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{getDestinationLabel(d)}</span>
                    <span className="text-xs text-gray-500">{getTimeLabel(d.updatedAt || d.createdAt)}</span>
                  </div>

                  {editingId === d.id ? (
                    <div onClick={(e) => e.stopPropagation()}>
                      <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)}
                        className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-slack-blue resize-none"
                        rows={3} autoFocus />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-sm rounded border hover:bg-gray-50">Abbrechen</button>
                        <button onClick={() => saveDraft(d.id)}
                          className="px-3 py-1 text-sm rounded bg-slack-green text-white hover:bg-slack-green-hover">Speichern</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700">{d.content}</p>
                  )}
                </div>

                {/* Action buttons (visible on hover) */}
                {editingId !== d.id && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => deleteDraft(d.id)} title="Loeschen"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <button onClick={() => { setEditingId(d.id); setEditContent(d.content); }} title="Bearbeiten"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </button>
                    <button title="Planen"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </button>
                    <button onClick={() => sendDraft(d)} title="Jetzt senden"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-slack-green">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Scheduled */}
        {activeTab === 'scheduled' && scheduled.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">🕐</span>
            <p className="text-sm text-gray-500">Keine geplanten Nachrichten.</p>
          </div>
        )}

        {/* Sent */}
        {activeTab === 'sent' && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">✉️</span>
            <p className="text-sm text-gray-500">Gesendete Nachrichten werden hier angezeigt.</p>
          </div>
        )}
      </div>
    </div>
  );
}
