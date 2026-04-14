'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { usePresenceStore } from '@/stores/presence.store';

export default function DirectoryPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const presenceMap = usePresenceStore((s) => s.presenceMap);

  useEffect(() => {
    apiFetch<any[]>('/users').then(setUsers).catch(() => {});
  }, []);

  const filtered = search
    ? users.filter((u) => u.displayName?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <div className="flex-1 bg-white">
      <div className="border-b px-6 py-4">
        <h1 className="text-lg font-bold">Verzeichnisse</h1>
        <div className="flex gap-4 mt-3">
          <button className="pb-2 text-sm font-medium border-b-2 border-slack-blue text-slack-blue">Personen</button>
          <button className="pb-2 text-sm font-medium text-gray-500 hover:text-gray-700 border-b-2 border-transparent">Channels</button>
        </div>
      </div>
      <div className="p-6">
        <div className="mb-4">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Personen suchen..."
            className="w-full max-w-md rounded-lg border px-4 py-2 text-sm outline-none focus:border-slack-blue" />
        </div>
        <div className="space-y-1">
          {filtered.map((u) => {
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
        </div>
      </div>
    </div>
  );
}
