'use client';
import { ChannelList } from './ChannelList';
import { useAuthStore } from '@/stores/auth.store';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-gray-50">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <div className="h-8 w-8 rounded bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">C</div>
        <span className="font-semibold text-gray-900">Chat</span>
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
