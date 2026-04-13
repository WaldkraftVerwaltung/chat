'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { SearchModal } from '@/components/search/SearchModal';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useUnreadStore } from '@/stores/unread.store';
import { useGlobalSocket } from '@/hooks/useSocket';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();

  useGlobalSocket();

  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }
    apiFetch<any>('/users/me').then((user) => setUser(user)).catch(() => router.replace('/login'));
    connectSocket();

    // Request browser notification permission
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission();
    }

    // Fetch initial data
    useNotificationsStore.getState().fetchUnreadCount();
    useUnreadStore.getState().fetchUnreadCounts();

    return () => { disconnectSocket(); };
  }, [isAuthenticated, router, setUser]);

  if (!isAuthenticated) return null;

  return (
    <>
      <SearchModal />
      <div className="flex h-screen">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </>
  );
}
