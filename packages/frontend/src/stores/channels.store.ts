import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface Channel { id: string; name: string; type: 'public' | 'private'; topic: string | null; description: string | null; isArchived: boolean; isDefault: boolean; }

function getStarredFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('starredChannels') || '[]'); } catch { return []; }
}

function getRecentFromStorage(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('recentChannels') || '[]'); } catch { return []; }
}

interface ChannelsState {
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  starredChannelIds: string[];
  recentChannelIds: string[];
  fetchChannels: () => Promise<void>;
  setActiveChannel: (id: string) => void;
  toggleStar: (channelId: string) => void;
}

export const useChannelsStore = create<ChannelsState>((set, get) => ({
  channels: [],
  activeChannelId: null,
  loading: false,
  starredChannelIds: getStarredFromStorage(),
  recentChannelIds: getRecentFromStorage(),
  fetchChannels: async () => {
    set({ loading: true });
    try { const channels = await apiFetch<Channel[]>('/channels'); set({ channels, loading: false }); }
    catch { set({ loading: false }); }
  },
  setActiveChannel: (id) => {
    set((s) => {
      const recent = [id, ...s.recentChannelIds.filter((r) => r !== id)].slice(0, 10);
      if (typeof window !== 'undefined') {
        localStorage.setItem('recentChannels', JSON.stringify(recent));
      }
      return { activeChannelId: id, recentChannelIds: recent };
    });
  },
  toggleStar: (channelId) => {
    set((s) => {
      const isStarred = s.starredChannelIds.includes(channelId);
      const next = isStarred
        ? s.starredChannelIds.filter((id) => id !== channelId)
        : [...s.starredChannelIds, channelId];
      if (typeof window !== 'undefined') {
        localStorage.setItem('starredChannels', JSON.stringify(next));
      }
      return { starredChannelIds: next };
    });
  },
}));
