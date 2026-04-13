import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface UnreadState {
  unreadByChannel: Record<string, number>;
  fetchUnreadCounts: () => Promise<void>;
  markChannelRead: (channelId: string) => void;
  incrementUnread: (channelId: string) => void;
}

export const useUnreadStore = create<UnreadState>((set) => ({
  unreadByChannel: {},
  fetchUnreadCounts: async () => {
    try {
      const data = await apiFetch<{ channelId: string; unreadCount: number }[]>('/channels/unread-counts');
      const map: Record<string, number> = {};
      for (const item of data) map[item.channelId] = item.unreadCount;
      set({ unreadByChannel: map });
    } catch {}
  },
  markChannelRead: (channelId) => set((s) => {
    const next = { ...s.unreadByChannel };
    delete next[channelId];
    return { unreadByChannel: next };
  }),
  incrementUnread: (channelId) => set((s) => ({
    unreadByChannel: { ...s.unreadByChannel, [channelId]: (s.unreadByChannel[channelId] || 0) + 1 },
  })),
}));
