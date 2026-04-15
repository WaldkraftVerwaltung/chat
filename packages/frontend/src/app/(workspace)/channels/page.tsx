'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useChannelsStore } from '@/stores/channels.store';

interface BrowseChannel {
  id: string;
  name: string;
  type: 'public' | 'private';
  topic: string | null;
  description: string | null;
  isDefault: boolean;
  memberCount: number;
  isMember: boolean;
}

export default function ChannelBrowserPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<BrowseChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const fetchChannels = useChannelsStore((s) => s.fetchChannels);

  const load = useCallback((q = '') => {
    setLoading(true);
    const qs = q ? `?search=${encodeURIComponent(q)}` : '';
    apiFetch<BrowseChannel[]>(`/channels/browse${qs}`)
      .then(setChannels)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  async function handleJoin(channel: BrowseChannel) {
    if (joiningId) return;
    setJoiningId(channel.id);
    try {
      await apiFetch(`/channels/${channel.id}/join`, { method: 'POST' });
      setChannels((prev) =>
        prev.map((c) => c.id === channel.id ? { ...c, isMember: true, memberCount: c.memberCount + 1 } : c)
      );
      await fetchChannels();
      router.push(`/channel/${channel.id}`);
    } catch {
      // ignore
    } finally {
      setJoiningId(null);
    }
  }

  return (
    <div className="flex flex-1 flex-col bg-white">
      {/* Header */}
      <div className="border-b px-8 py-5">
        <h1 className="text-xl font-bold text-gray-900">Channel-Browser</h1>
        <p className="text-sm text-gray-500 mt-0.5">Alle öffentlichen Channels durchsuchen und beitreten</p>
        <div className="mt-4 relative max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Channels suchen..."
            className="w-full rounded-lg border border-gray-300 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">Laden...</div>
        ) : channels.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">#</div>
            <p className="text-gray-500 text-sm">
              {search ? `Keine Channels für "${search}" gefunden` : 'Keine Channels vorhanden'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b">
              <tr className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <th className="px-8 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Beschreibung</th>
                <th className="px-4 py-3 text-center">Mitglieder</th>
                <th className="px-8 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {channels.map((ch) => (
                <tr key={ch.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-bold">#</span>
                      <span className="font-semibold text-gray-900">{ch.name}</span>
                      {ch.isDefault && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Standard</span>
                      )}
                    </div>
                    {ch.topic && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-5 truncate max-w-xs">{ch.topic}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs">
                    <p className="truncate">{ch.description || '—'}</p>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-500">
                    {ch.memberCount}
                  </td>
                  <td className="px-8 py-3 text-right">
                    {ch.isMember ? (
                      <button
                        onClick={() => router.push(`/channel/${ch.id}`)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Öffnen
                      </button>
                    ) : (
                      <button
                        onClick={() => handleJoin(ch)}
                        disabled={joiningId === ch.id}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {joiningId === ch.id ? '...' : 'Beitreten'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && channels.length > 0 && (
        <div className="border-t px-8 py-2 text-xs text-gray-400">
          {channels.length} Channel{channels.length !== 1 ? 's' : ''} gefunden
        </div>
      )}
    </div>
  );
}
