import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface NotificationItem {
  id: string;
  type: string;
  summary: string | null;
  channelId: string | null;
  actorId: string | null;
  actor?: { displayName: string };
  channel?: { name: string };
  isRead: boolean;
  createdAt: string;
}

interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  fetch: () => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  markAsRead: (ids: string[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (n: NotificationItem) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  fetch: async () => {
    const notifications = await apiFetch<NotificationItem[]>('/notifications');
    set({ notifications });
  },
  fetchUnreadCount: async () => {
    const count = await apiFetch<number>('/notifications/count');
    set({ unreadCount: count });
  },
  markAsRead: async (ids) => {
    await apiFetch('/notifications/mark-read', { method: 'POST', body: JSON.stringify({ ids }) });
    set((s) => ({
      notifications: s.notifications.map((n) => ids.includes(n.id) ? { ...n, isRead: true } : n),
      unreadCount: Math.max(0, s.unreadCount - ids.length),
    }));
  },
  markAllAsRead: async () => {
    await apiFetch('/notifications/mark-all-read', { method: 'POST' });
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, isRead: true })), unreadCount: 0 }));
  },
  addNotification: (n) => set((s) => ({
    notifications: [n, ...s.notifications],
    unreadCount: s.unreadCount + 1,
  })),
}));
