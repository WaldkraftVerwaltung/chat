'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useDmsStore } from '@/stores/dms.store';
import { useAuthStore } from '@/stores/auth.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useUnreadStore } from '@/stores/unread.store';
import { apiFetch } from '@/lib/api';

export function DmList() {
  const { conversations, fetchConversations, startDm } = useDmsStore();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const presenceMap = usePresenceStore((s) => s.presenceMap);
  const unreadByChannel = useUnreadStore((s) => s.unreadByChannel);
  const [showNewDm, setShowNewDm] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'internal' | 'external'>('all');
  const filterMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Close filter menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setShowFilterMenu(false);
      }
    }
    if (showFilterMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showFilterMenu]);

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

  function getOtherUser(conv: any) {
    const others = conv.participants?.filter((p: any) => p.userId !== currentUserId) || [];
    return others[0]?.user || null;
  }

  // Filter conversations
  let filtered = conversations;
  if (showUnreadOnly) {
    filtered = filtered.filter((c) => (unreadByChannel[c.id] || 0) > 0);
  }
  if (searchQuery) {
    filtered = filtered.filter((c) => getDmName(c).toLowerCase().includes(searchQuery.toLowerCase()));
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="relative" ref={filterMenuRef}>
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className="flex items-center gap-1 rounded hover:bg-white/10 px-1 py-0.5 transition-colors"
          >
            <span className="text-sm font-semibold text-slack-text-bright">Direktnachrichten</span>
            <span className="text-slack-text text-xs">▾</span>
          </button>

          {/* Filter dropdown */}
          {showFilterMenu && (
            <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-md bg-slack-aubergine-light shadow-lg border border-white/10 py-1">
              <div className="px-3 py-1.5 text-xs text-slack-text font-medium uppercase tracking-wider">
                Unterhaltungen filtern
              </div>
              <div className="border-t border-white/10 mt-1">
                {([
                  ['all', 'Alle'] as const,
                  ['internal', 'Nur interne Personen'] as const,
                  ['external', 'Nur externe Personen'] as const,
                ]).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setFilterType(value); setShowFilterMenu(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition-colors"
                  >
                    <span className="w-4 text-center text-xs">{filterType === value ? '✓' : ''}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Unread toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer" title="Nur ungelesene anzeigen">
            <span className="text-xs text-slack-text">Ungelesenes</span>
            <div className={`relative w-8 h-4 rounded-full transition-colors ${showUnreadOnly ? 'bg-slack-blue' : 'bg-white/20'}`}
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
              <div className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-transform ${showUnreadOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </div>
          </label>
          {/* Compose new DM */}
          <button onClick={openUserPicker} title="Neue Nachricht"
            className="p-1 rounded hover:bg-white/10 text-slack-text hover:text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 bg-white/10 rounded px-2 py-1.5">
          <svg className="w-3.5 h-3.5 text-slack-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="DM suchen" className="bg-transparent text-sm text-white placeholder-slack-text outline-none flex-1 w-full" />
        </div>
      </div>

      {/* DM list */}
      <div className="flex-1 overflow-y-auto space-y-0.5">
        {filtered.map((conv) => {
          const otherUser = getOtherUser(conv);
          const name = getDmName(conv);
          const presence = otherUser ? (presenceMap[otherUser.id] || 'away') : 'away';
          const presenceColor = { active: 'bg-green-500', away: 'bg-gray-400', dnd: 'bg-red-500' }[presence];
          const unread = unreadByChannel[conv.id] || 0;

          // Format relative time
          const lastMessageTime = (conv as any).lastMessageAt || conv.createdAt;
          const timeLabel = (() => {
            if (!lastMessageTime) return '';
            const d = new Date(lastMessageTime);
            const now = new Date();
            const diffMs = now.getTime() - d.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';
            if (diffDays === 1) return 'Gestern';
            if (diffDays < 7) return d.toLocaleDateString('de-DE', { weekday: 'short' });
            return d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
          })();
          const lastMessage = (conv as any).lastMessagePreview || '';

          return (
            <Link key={conv.id} href={`/dm/${conv.id}`}
              className={`flex items-start gap-2.5 rounded mx-1 px-2 py-2 hover:bg-slack-aubergine-light transition-colors ${unread > 0 ? 'text-white' : 'text-slack-text'}`}>
              <div className="relative flex-shrink-0 mt-0.5">
                {otherUser?.avatarUrl ? (
                  <img src={otherUser.avatarUrl} alt={name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-sm font-bold text-white">
                    {name[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-slack-aubergine ${presenceColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-sm truncate ${unread > 0 ? 'font-bold text-white' : 'font-medium'}`}>{name}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[11px] text-slack-text">{timeLabel}</span>
                    {unread > 0 && (
                      <span className="bg-slack-red text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                        {unread}
                      </span>
                    )}
                  </div>
                </div>
                {lastMessage && (
                  <p className="text-xs text-slack-text truncate mt-0.5">{lastMessage}</p>
                )}
              </div>
            </Link>
          );
        })}

        {filtered.length === 0 && (
          <p className="px-3 py-4 text-sm text-slack-text text-center">
            {showUnreadOnly ? 'Keine ungelesenen DMs' : searchQuery ? 'Keine DMs gefunden' : 'Noch keine Direktnachrichten'}
          </p>
        )}
      </div>

      {/* New DM modal */}
      {showNewDm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewDm(false)}>
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative w-80 rounded-lg bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-sm font-semibold mb-3 text-gray-900">Neue Direktnachricht</h3>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {users.map((u) => (
                <button key={u.id} onClick={() => handleStartDm(u.id)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm hover:bg-gray-100">
                  {u.avatarUrl ? (
                    <img src={u.avatarUrl} alt={u.displayName} className="h-7 w-7 rounded-full object-cover" />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
                      {u.displayName?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                  <span className="text-gray-900">{u.displayName}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
