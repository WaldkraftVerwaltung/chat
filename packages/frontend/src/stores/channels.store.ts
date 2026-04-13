import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface Channel { id: string; name: string; type: 'public' | 'private'; topic: string | null; description: string | null; isArchived: boolean; isDefault: boolean; }

interface ChannelsState {
  channels: Channel[];
  activeChannelId: string | null;
  loading: boolean;
  fetchChannels: () => Promise<void>;
  setActiveChannel: (id: string) => void;
}

export const useChannelsStore = create<ChannelsState>((set) => ({
  channels: [],
  activeChannelId: null,
  loading: false,
  fetchChannels: async () => {
    set({ loading: true });
    try { const channels = await apiFetch<Channel[]>('/channels'); set({ channels, loading: false }); }
    catch { set({ loading: false }); }
  },
  setActiveChannel: (id) => set({ activeChannelId: id }),
}));
