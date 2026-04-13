'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChannelList } from './ChannelList';
import { DmList } from './DmList';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchStore } from '@/stores/search.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { usePresenceStore } from '@/stores/presence.store';
import { apiFetch } from '@/lib/api';
import { Avatar } from '@/components/ui/Avatar';
import { StatusDialog } from './StatusDialog';

function PresenceDot({ presence }: { presence: 'active' | 'away' | 'dnd' | undefined }) {
  if (!presence || presence === 'away') {
    return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-slack-text border-2 border-slack-aubergine" title="Abwesend" />;
  }
  if (presence === 'dnd') {
    return (
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-slack-red border-2 border-slack-aubergine flex items-center justify-center" title="Nicht stören">
        <span className="text-white text-[6px] font-bold leading-none">z</span>
      </span>
    );
  }
  return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-slack-aubergine" title="Aktiv" />;
}

const DND_OPTIONS = [
  { label: '30 Min', minutes: 30 },
  { label: '1 Std', minutes: 60 },
  { label: '2 Std', minutes: 120 },
  { label: 'Bis morgen', minutes: null },
  { label: 'Aus', minutes: -1 },
];

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const presenceMap = usePresenceStore((s) => s.presenceMap);
  const myPresence = user?.id ? presenceMap[user.id] : undefined;

  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndOpen, setDndOpen] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const dndRef = useRef<HTMLDivElement>(null);

  // Close DND dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dndRef.current && !dndRef.current.contains(e.target as Node)) {
        setDndOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function handleDndSelect(minutes: number | null) {
    setDndOpen(false);
    if (minutes === -1) {
      // Turn off DND
      setDndEnabled(false);
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ dndEnabled: false, dndUntil: null }),
      });
    } else {
      // Enable DND
      let dndUntil: Date;
      if (minutes === null) {
        // Until tomorrow 9am
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0);
        dndUntil = tomorrow;
      } else {
        dndUntil = new Date(Date.now() + minutes * 60 * 1000);
      }
      setDndEnabled(true);
      await apiFetch('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ dndEnabled: true, dndUntil: dndUntil.toISOString() }),
      });
    }
  }

  return (
    <aside className="flex h-screen w-64 flex-col bg-slack-aubergine">
      <div className="flex items-center gap-2 border-b border-slack-aubergine-light px-4 py-3">
        <div className="h-8 w-8 rounded bg-slack-green flex items-center justify-center text-white text-sm font-bold">C</div>
        <span className="font-semibold text-slack-text-bright flex-1">Chat</span>
        <div className="relative">
          <button
            onClick={() => useNotificationsStore.getState().markAllAsRead()}
            className="relative rounded p-1 text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors"
            title="Benachrichtigungen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-slack-red px-1 py-0.5 text-[9px] text-white font-bold min-w-[16px] text-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="px-3 py-2 border-b border-slack-aubergine-light">
        <button
          onClick={() => useSearchStore.getState().open()}
          className="flex w-full items-center gap-2 rounded-md bg-slack-aubergine-light border border-slack-hover px-3 py-1.5 text-sm text-slack-text hover:bg-slack-hover hover:text-slack-text-bright transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left">Suchen</span>
          <kbd className="rounded border border-slack-hover bg-slack-hover px-1.5 py-0.5 text-xs text-slack-text">⌘K</kbd>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ChannelList />
        <DmList />
        {user?.role && ['primary_owner', 'owner', 'admin'].includes(user.role) && (
          <div className="px-3 pt-2 pb-1">
            <Link href="/admin" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-slack-text hover:bg-slack-aubergine-light hover:text-slack-text-bright transition-colors">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Administration
            </Link>
          </div>
        )}
      </nav>
      <StatusDialog isOpen={showStatusDialog} onClose={() => setShowStatusDialog(false)} />
      <div className="border-t border-slack-aubergine-light px-4 py-3 flex items-center gap-2">
        <div className="relative flex-shrink-0">
          <Avatar name={user?.displayName || '?'} avatarUrl={(user as any)?.avatarUrl} size="sm" presence={myPresence} />
        </div>
        <button
          onClick={() => setShowStatusDialog(true)}
          className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
          title="Status setzen"
        >
          <p className="text-sm font-medium truncate flex items-center gap-1 text-slack-text-bright">
            {(user as any)?.statusEmoji && <span>{(user as any).statusEmoji}</span>}
            {user?.displayName}
            {dndEnabled && (
              <span className="text-[10px] text-slack-red font-bold" title="Nicht stören aktiv">z</span>
            )}
          </p>
          {(user as any)?.statusText && (
            <p className="text-xs text-slack-text truncate">{(user as any).statusText}</p>
          )}
        </button>

        {/* DND toggle */}
        <div ref={dndRef} className="relative">
          <button
            onClick={() => setDndOpen((o) => !o)}
            className={`rounded p-1 text-sm transition-colors ${dndEnabled ? 'text-slack-red hover:bg-slack-aubergine-light' : 'text-slack-text hover:text-slack-text-bright hover:bg-slack-aubergine-light'}`}
            title="Nicht stören"
          >
            {dndEnabled ? (
              <span className="font-bold text-xs">z</span>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
          {dndOpen && (
            <div className="absolute bottom-full right-0 mb-1 w-36 rounded-lg border border-slack-border bg-white shadow-lg py-1 z-10">
              {DND_OPTIONS.map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => handleDndSelect(opt.minutes)}
                  className="flex w-full items-center px-3 py-1.5 text-xs text-gray-700 hover:bg-slack-msg-hover"
                >
                  {opt.minutes === -1 && dndEnabled && <span className="mr-1 text-slack-green">&#10003;</span>}
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button onClick={logout} className="text-xs text-slack-text hover:text-slack-text-bright" title="Abmelden">Logout</button>
      </div>
    </aside>
  );
}
