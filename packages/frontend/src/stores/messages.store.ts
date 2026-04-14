import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface Message {
  id: string; channelId: string; userId: string; content: string;
  isEdited: boolean; isDeleted: boolean; isPinned: boolean;
  threadParentId: string | null; createdAt: string;
  user?: { id: string; displayName: string; avatarUrl: string | null };
  reactions?: { emoji: string; count: number; userIds: string[] }[];
  files?: { id: string; originalFilename: string; mimeType: string; sizeBytes: number; thumbnailKey: string | null }[];
}

interface MessagesState {
  messagesByChannel: Record<string, Message[]>;
  loading: boolean;
  loadingMore: boolean;
  fetchMessages: (channelId: string, before?: string) => Promise<void>;
  addMessage: (channelId: string, message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (channelId: string, messageId: string) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messagesByChannel: {},
  loading: false,
  loadingMore: false,
  fetchMessages: async (channelId, before?: string) => {
    if (before) {
      set({ loadingMore: true });
      try {
        const older = await apiFetch<Message[]>(`/channels/${channelId}/messages?limit=50&before=${encodeURIComponent(before)}`);
        set((s) => {
          const existing = s.messagesByChannel[channelId] || [];
          // Deduplicate: only prepend messages not already present
          const existingIds = new Set(existing.map((m) => m.id));
          const newOlder = older.filter((m) => !existingIds.has(m.id));
          return {
            messagesByChannel: { ...s.messagesByChannel, [channelId]: [...newOlder, ...existing] },
            loadingMore: false,
          };
        });
      } catch { set({ loadingMore: false }); }
    } else {
      set({ loading: true });
      try {
        const messages = await apiFetch<Message[]>(`/channels/${channelId}/messages?limit=50`);
        set((s) => ({ messagesByChannel: { ...s.messagesByChannel, [channelId]: messages }, loading: false }));
      } catch { set({ loading: false }); }
    }
  },
  addMessage: (channelId, message) => set((s) => {
    const existing = s.messagesByChannel[channelId] || [];
    if (existing.some((m) => m.id === message.id)) return s;
    return { messagesByChannel: { ...s.messagesByChannel, [channelId]: [...existing, message] } };
  }),
  updateMessage: (messageId, updates) => set((s) => {
    const newMap = { ...s.messagesByChannel };
    for (const chId of Object.keys(newMap)) {
      newMap[chId] = newMap[chId].map((m) => m.id === messageId ? { ...m, ...updates } : m);
    }
    return { messagesByChannel: newMap };
  }),
  removeMessage: (channelId, messageId) => set((s) => ({
    messagesByChannel: {
      ...s.messagesByChannel,
      [channelId]: (s.messagesByChannel[channelId] || []).filter((m) => m.id !== messageId),
    },
  })),
}));
