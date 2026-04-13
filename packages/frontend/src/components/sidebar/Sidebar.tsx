'use client';
import { ChannelList } from './ChannelList';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchStore } from '@/stores/search.store';
import { useNotificationsStore } from '@/stores/notifications.store';
import { usePresenceStore } from '@/stores/presence.store';

function PresenceDot({ presence }: { presence: 'active' | 'away' | 'dnd' | undefined }) {
  if (!presence || presence === 'away') {
    return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-gray-400 border-2 border-white" title="Abwesend" />;
  }
  if (presence === 'dnd') {
    return (
      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center" title="Nicht stören">
        <span className="text-white text-[6px] font-bold leading-none">z</span>
      </span>
    );
  }
  return <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-white" title="Aktiv" />;
}

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const presenceMap = usePresenceStore((s) => s.presenceMap);
  const myPresence = user?.id ? presenceMap[user.id] : undefined;

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">C</div>
        <span className="font-semibold text-gray-900 flex-1">Chat</span>
        <div className="relative">
          <button
            onClick={() => useNotificationsStore.getState().markAllAsRead()}
            className="relative rounded p-1 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Benachrichtigungen"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 rounded-full bg-red-500 px-1 py-0.5 text-[9px] text-white font-bold min-w-[16px] text-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="px-3 py-2 border-b">
        <button
          onClick={() => useSearchStore.getState().open()}
          className="flex w-full items-center gap-2 rounded-md bg-white border border-gray-200 px-3 py-1.5 text-sm text-gray-400 hover:border-gray-300 hover:text-gray-600 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="flex-1 text-left">Suchen</span>
          <kbd className="rounded border bg-gray-100 px-1.5 py-0.5 text-xs">⌘K</kbd>
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2"><ChannelList /></nav>
      <div className="border-t px-4 py-3 flex items-center gap-2">
        <div className="relative h-8 w-8 flex-shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">
            {user?.displayName?.[0]?.toUpperCase() || '?'}
          </div>
          <PresenceDot presence={myPresence} />
        </div>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.displayName}</p></div>
        <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-700" title="Abmelden">Logout</button>
      </div>
    </aside>
  );
}
