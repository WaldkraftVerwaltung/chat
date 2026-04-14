'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function DraftsPage() {
  const [activeTab, setActiveTab] = useState<'drafts' | 'scheduled' | 'sent'>('drafts');
  const [drafts, setDrafts] = useState<any[]>([]);
  const [scheduled, setScheduled] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/drafts').then(setDrafts).catch(() => {});
    apiFetch<any[]>('/messages/scheduled').then(setScheduled).catch(() => {});
  }, []);

  return (
    <div className="flex-1 bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold">Entwuerfe & Gesendet</h1>
        <div className="flex gap-4 mt-3">
          {[
            { id: 'drafts', label: 'Entwuerfe', count: drafts.length },
            { id: 'scheduled', label: 'Geplant', count: scheduled.length },
            { id: 'sent', label: 'Gesendet', count: null },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id ? 'border-slack-blue text-slack-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {tab.label}
              {tab.count !== null && tab.count > 0 && (
                <span className="ml-1.5 bg-gray-200 text-gray-600 text-xs rounded-full px-1.5">{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        {activeTab === 'drafts' && drafts.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">📝</span>
            <p className="text-sm text-gray-500">Keine Entwuerfe vorhanden. Angefangene Nachrichten werden hier gespeichert.</p>
          </div>
        )}
        {activeTab === 'scheduled' && scheduled.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">🕐</span>
            <p className="text-sm text-gray-500">Keine geplanten Nachrichten.</p>
          </div>
        )}
        {activeTab === 'sent' && (
          <div className="text-center py-12">
            <span className="text-4xl mb-3 block">✉️</span>
            <p className="text-sm text-gray-500">Gesendete Nachrichten werden hier angezeigt.</p>
          </div>
        )}
        {activeTab === 'drafts' && drafts.length > 0 && (
          <div className="space-y-2">
            {drafts.map((d: any) => (
              <div key={d.id} className="rounded-lg border p-4 hover:shadow-sm">
                <p className="text-sm text-gray-800 truncate">{d.content}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(d.updatedAt || d.createdAt).toLocaleString('de-DE')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
