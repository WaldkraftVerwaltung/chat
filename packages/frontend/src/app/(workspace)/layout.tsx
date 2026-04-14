'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { useAuthStore } from '@/stores/auth.store';
import { connectSocket, disconnectSocket } from '@/lib/socket';
import { apiFetch } from '@/lib/api';
import { SearchModal } from '@/components/search/SearchModal';
import { useNotificationsStore } from '@/stores/notifications.store';
import { useUnreadStore } from '@/stores/unread.store';
import { useGlobalSocket } from '@/hooks/useSocket';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { ToastProvider } from '@/components/ui/Toast';
import { ResizeHandle } from '@/components/ui/ResizeHandle';

const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 400;
const SIDEBAR_DEFAULT = 260;

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, setUser } = useAuthStore();
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT);

  useGlobalSocket();
  useKeyboardShortcuts();

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

  const handleSidebarResize = useCallback((delta: number) => {
    setSidebarWidth((w) => Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, w + delta)));
  }, []);

  if (!isAuthenticated) return null;

  return (
    <ToastProvider>
      <SearchModal />
      <div className="flex h-screen">
        {/* NavRail (56px) + Sidebar content ({sidebarWidth}px) are rendered inside Sidebar */}
        <Sidebar sidebarWidth={sidebarWidth} />
        <ResizeHandle onResize={handleSidebarResize} />
        <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
