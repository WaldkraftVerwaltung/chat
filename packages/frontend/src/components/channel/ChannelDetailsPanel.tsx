'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ChannelDetailsPanelProps {
  channelId: string;
  channelName: string;
  topic: string | null;
  description: string | null;
  type: 'public' | 'private';
  initialTab?: 'about' | 'members' | 'pins';
  onClose: () => void;
}

export function ChannelDetailsPanel({ channelId, channelName, topic, description, type, initialTab, onClose }: ChannelDetailsPanelProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [pinsLoading, setPinsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'pins'>(initialTab || 'about');

  useEffect(() => {
    apiFetch<any[]>(`/channels/${channelId}/members`).then(setMembers).catch(() => {});
  }, [channelId]);

  useEffect(() => {
    if (activeTab !== 'pins') return;
    setPinsLoading(true);
    apiFetch<any[]>(`/channels/${channelId}/messages/pins`)
      .then(setPinnedMessages)
      .catch(() => setPinnedMessages([]))
      .finally(() => setPinsLoading(false));
  }, [activeTab, channelId]);

  const tabs = [
    { id: 'about', label: 'Info' },
    { id: 'members', label: `Mitglieder (${members.length})` },
    { id: 'pins', label: 'Pins' },
  ];

  return (
    <div className="flex h-full w-80 flex-col border-l bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-sm font-semibold">{type === 'public' ? '#' : '🔒'} {channelName}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
      </div>

      <div className="flex border-b">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === tab.id ? 'border-b-2 border-slack-blue text-slack-blue' : 'text-slack-gray-text hover:text-gray-700'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'about' && (
          <div className="space-y-4">
            {topic && <div><p className="text-xs font-medium text-gray-500 mb-1">Topic</p><p className="text-sm">{topic}</p></div>}
            {description && <div><p className="text-xs font-medium text-gray-500 mb-1">Beschreibung</p><p className="text-sm">{description}</p></div>}
            {!topic && !description && <p className="text-sm text-gray-400">Keine Informationen verfügbar</p>}
          </div>
        )}
        {activeTab === 'members' && (
          <div className="space-y-2">
            {members.map((m: any) => (
              <div key={m.userId} className="flex items-center gap-2 py-1">
                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                  {m.user?.displayName?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="text-sm">{m.user?.displayName || 'Unbekannt'}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'pins' && (
          pinsLoading ? (
            <p className="text-sm text-gray-400 text-center py-4">Laden...</p>
          ) : pinnedMessages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Keine angepinnten Nachrichten</p>
          ) : (
            <div className="space-y-3">
              {pinnedMessages.map((msg: any) => (
                <div key={msg.id} className="rounded-lg border border-gray-200 p-3 bg-gray-50">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {msg.user?.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">{msg.user?.displayName || 'Unbekannt'}</span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {new Date(msg.createdAt).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-4">{msg.content}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
