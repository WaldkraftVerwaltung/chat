'use client';
import { ChannelList } from './ChannelList';
import { useAuthStore } from '@/stores/auth.store';
import { useSearchStore } from '@/stores/search.store';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">C</div>
        <span className="font-semibold text-gray-900">Chat</span>
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
        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold">{user?.displayName?.[0]?.toUpperCase() || '?'}</div>
        <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{user?.displayName}</p></div>
        <button onClick={logout} className="text-xs text-gray-500 hover:text-gray-700" title="Abmelden">Logout</button>
      </div>
    </aside>
  );
}
