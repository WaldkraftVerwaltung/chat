'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { usePresenceStore } from '@/stores/presence.store';
import { useChannelsStore } from '@/stores/channels.store';

export default function DirectoryPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'people' | 'channels'>('people');
  const [users, setUsers] = useState<any[]>([]);
  const [allChannels, setAllChannels] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const presenceMap = usePresenceStore((s) => s.presenceMap);
  const { channels: myChannels, fetchChannels } = useChannelsStore();

  useEffect(() => {
    apiFetch<any[]>('/users').then(setUsers).catch(() => {});
    apiFetch<any[]>('/channels').then(setAllChannels).catch(() => {});
  }, []);

  const filteredUsers = search
    ? users.filter((u) => u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  const filteredChannels = search
    ? allChannels.filter((c: any) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))
    : allChannels;

  async function joinChannel(channelId: string) {
    try {
      await apiFetch(`/channels/${channelId}/join`, { method: 'POST' });
      await fetchChannels();
      router.push(`/channel/${channelId}`);
    } catch {}
  }

  function isJoined(channelId: string) {
    return myChannels.some((c) => c.id === channelId);
  }

  return (
    <div className="flex-1 bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold">Verzeichnisse</h1>
        <div className="flex gap-4 mt-3">
          <button onClick={() => { setActiveTab('people'); setSearch(''); }}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'people' ? 'border-slack-blue text-slack-blue' : 'text-gray-500 hover:text-gray-700 border-transparent'
            }`}>Personen</button>
          <button onClick={() => { setActiveTab('channels'); setSearch(''); }}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'channels' ? 'border-slack-blue text-slack-blue' : 'text-gray-500 hover:text-gray-700 border-transparent'
            }`}>Channels</button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={activeTab === 'people' ? 'Personen suchen...' : 'Channels suchen...'}
            className="w-full max-w-md rounded-lg border px-4 py-2 text-sm outline-none focus:border-slack-blue" />
        </div>

        {/* People tab */}
        {activeTab === 'people' && (
          <div className="space-y-1">
            {filteredUsers.map((u) => {
              const presence = presenceMap[u.id] || 'away';
              const presenceColor = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' }[presence];
              return (
                <div key={u.id} className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="relative">
                    {u.avatarUrl ? (
                      <img src={u.avatarUrl} alt={u.displayName} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center text-sm font-bold text-gray-600">
                        {u.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${presenceColor}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{u.displayName}</p>
                    {u.title && <p className="text-xs text-gray-500">{u.title}</p>}
                  </div>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
              );
            })}
            {filteredUsers.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Keine Personen gefunden</p>
            )}
          </div>
        )}

        {/* Channels tab */}
        {activeTab === 'channels' && (
          <div className="space-y-1">
            <p className="text-xs text-gray-500 mb-3">{filteredChannels.length} Channel{filteredChannels.length !== 1 ? 's' : ''}</p>
            {filteredChannels.map((c: any) => {
              const joined = isJoined(c.id);
              return (
                <div key={c.id}
                  className="flex items-center gap-3 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => joined ? router.push(`/channel/${c.id}`) : undefined}>
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg text-gray-500 flex-shrink-0">
                    {c.type === 'private' ? '🔒' : '#'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{c.type === 'private' ? '🔒 ' : '# '}{c.name}</p>
                      {c.isArchived && <span className="text-[10px] bg-gray-200 text-gray-600 rounded px-1.5 py-0.5">Archiviert</span>}
                    </div>
                    {c.description && <p className="text-xs text-gray-500 truncate">{c.description}</p>}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {joined ? (
                      <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        Beigetreten
                      </span>
                    ) : (
                      c.type !== 'private' && (
                        <button onClick={(e) => { e.stopPropagation(); joinChannel(c.id); }}
                          className="rounded-lg border border-slack-green text-slack-green px-3 py-1 text-xs font-medium hover:bg-green-50 transition-colors">
                          Beitreten
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
            {filteredChannels.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">Keine Channels gefunden</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
