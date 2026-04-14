'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

export default function HuddlesPage() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any[]>('/users').then((data) => setUsers(data.slice(0, 10))).catch(() => {});
  }, []);

  // Suggested huddle partners (top 3 users)
  const suggestions = users.slice(0, 3);

  return (
    <div className="flex-1 bg-white">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-bold">Huddles</h1>
        <button className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50">
          + Neuer Huddle
        </button>
      </div>

      <div className="p-6">
        {/* Suggestions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {suggestions.map((u) => (
            <div key={u.id} className="rounded-xl border p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex justify-center mb-3">
                {u.avatarUrl ? (
                  <img src={u.avatarUrl} alt={u.displayName} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-300 flex items-center justify-center text-xl font-bold text-gray-600">
                    {u.displayName?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
              <p className="text-sm font-semibold">Huddle starten mit {u.displayName}?</p>
              <p className="text-xs text-gray-500 mt-1">Starte einen Audio- oder Video-Chat</p>
            </div>
          ))}
        </div>

        {/* Current huddles */}
        <h2 className="text-base font-bold mb-3">Aktuelle Huddles</h2>
        <div className="flex gap-3 mb-4">
          <button className="rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            Alle Huddles <span className="text-xs">▾</span>
          </button>
          <button className="rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            Mit <span className="text-xs">▾</span>
          </button>
          <button className="rounded-full border px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-1">
            Eingehend <span className="text-xs">▾</span>
          </button>
        </div>

        <div className="text-center py-12">
          <span className="text-4xl mb-3 block">🎧</span>
          <p className="text-sm text-gray-500">Keine aktiven Huddles. Starte einen Huddle um einen Audio- oder Video-Chat zu beginnen.</p>
        </div>
      </div>
    </div>
  );
}
