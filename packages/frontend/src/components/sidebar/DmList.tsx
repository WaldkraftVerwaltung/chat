'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { apiFetch } from '@/lib/api';

export function DmList() {
  const { conversations, fetchConversations, startDm } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [showNewDm, setShowNewDm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  async function openUserPicker() {
    const allUsers = await apiFetch<any[]>('/users');
    setUsers(allUsers.filter((u: any) => u.id !== currentUserId));
    setShowNewDm(true);
  }

  async function handleStartDm(userId: string) {
    const conv = await startDm([userId]);
    setShowNewDm(false);
    window.location.href = `/dm/${conv.id}`;
  }

  function getDmName(conv: any) {
    const others = conv.participants?.filter((p: any) => p.userId !== currentUserId) || [];
    if (others.length === 0) return 'Notizen';
    return others.map((p: any) => p.user?.displayName || 'Unbekannt').join(', ');
  }

  return (
    <div className="space-y-0.5 mt-2">
      <div className="flex items-center justify-between px-3 py-1">
        <span className="text-xs font-semibold uppercase text-gray-500">Direktnachrichten</span>
        <button onClick={openUserPicker} className="text-gray-400 hover:text-gray-600 text-lg leading-none" title="Neue DM">+</button>
      </div>

      {conversations.map((conv) => (
        <Link key={conv.id} href={`/dm/${conv.id}`}
          className="flex items-center gap-2 rounded px-3 py-1 text-sm text-gray-700 hover:bg-gray-100">
          <span className="h-2 w-2 rounded-full bg-gray-400" />
          <span className="truncate">{getDmName(conv)}</span>
        </Link>
      ))}

      {showNewDm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewDm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-80 rounded-lg bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-3">Neue Direktnachricht</h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {users.map((u) => (
                <button key={u.id} onClick={() => handleStartDm(u.id)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100">
                  <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                    {u.displayName?.[0]?.toUpperCase() || '?'}
                  </div>
                  <span>{u.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
