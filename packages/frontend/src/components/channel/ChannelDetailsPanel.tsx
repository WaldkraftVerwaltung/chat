'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

interface ChannelDetailsPanelProps {
  channelId: string;
  channelName: string;
  topic: string | null;
  description: string | null;
  type: 'public' | 'private';
  initialTab?: 'about' | 'members';
  onClose: () => void;
}

export function ChannelDetailsPanel({ channelId, channelName, topic, description, type, initialTab, onClose }: ChannelDetailsPanelProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [pinnedMessages, setPinnedMessages] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'about' | 'members' | 'pins'>(initialTab || 'about');

  useEffect(() => {
    apiFetch<any[]>(`/channels/${channelId}/members`).then(setMembers).catch(() => {});
  }, [channelId]);

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
            className={`flex-1 px-3 py-2 text-xs font-medium ${activeTab === tab.id ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
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
          <p className="text-sm text-gray-500">Angepinnte Nachrichten erscheinen hier</p>
        )}
      </div>
    </div>
  );
}
