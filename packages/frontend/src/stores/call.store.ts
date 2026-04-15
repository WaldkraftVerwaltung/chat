'use client';

import { create } from 'zustand';

export type CallMediaType = 'video' | 'audio';

export interface IncomingCall {
  channelId: string;
  room: string;
  initiatorId: string;
  initiatorName?: string;
  initiatorAvatarUrl?: string | null;
  mediaType: CallMediaType;
  ringingAt: string;
}

export interface ActiveCall {
  channelId: string;
  room: string;
  token: string;
  url: string;
  mediaType: CallMediaType;
  startedAt: string;
}

interface CallState {
  incoming: IncomingCall | null;
  active: ActiveCall | null;
  /** Channels that have an ongoing call (set via socket events). */
  activeCallChannels: Set<string>;

  setIncoming: (c: IncomingCall | null) => void;
  clearIncoming: (channelId?: string) => void;
  setActive: (c: ActiveCall | null) => void;
  endActive: () => void;
  markChannelCallActive: (channelId: string) => void;
  markChannelCallEnded: (channelId: string) => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  incoming: null,
  active: null,
  activeCallChannels: new Set<string>(),

  setIncoming: (c) => {
    if (c) {
      // Also mark the channel as having an active call
      const channels = new Set(get().activeCallChannels);
      channels.add(c.channelId);
      set({ incoming: c, activeCallChannels: channels });
    } else {
      set({ incoming: c });
    }
  },
  clearIncoming: (channelId) => {
    const cur = get().incoming;
    if (!cur) return;
    if (channelId && cur.channelId !== channelId) return;
    set({ incoming: null });
  },
  setActive: (c) => {
    if (c) {
      const channels = new Set(get().activeCallChannels);
      channels.add(c.channelId);
      set({ active: c, incoming: null, activeCallChannels: channels });
    } else {
      set({ active: c, incoming: null });
    }
  },
  endActive: () => {
    const cur = get().active;
    if (cur) {
      const channels = new Set(get().activeCallChannels);
      channels.delete(cur.channelId);
      set({ active: null, activeCallChannels: channels });
    } else {
      set({ active: null });
    }
  },
  markChannelCallActive: (channelId) => {
    const channels = new Set(get().activeCallChannels);
    channels.add(channelId);
    set({ activeCallChannels: channels });
  },
  markChannelCallEnded: (channelId) => {
    const channels = new Set(get().activeCallChannels);
    channels.delete(channelId);
    set({ activeCallChannels: channels });
  },
}));
