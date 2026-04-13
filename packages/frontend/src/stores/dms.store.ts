import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface DmParticipant {
  userId: string;
  user?: { id: string; displayName: string; avatarUrl: string | null };
}

interface DmConversation {
  id: string;
  isGroup: boolean;
  participants: DmParticipant[];
  createdAt: string;
}

interface DmsState {
  conversations: DmConversation[];
  loading: boolean;
  fetchConversations: () => Promise<void>;
  startDm: (userIds: string[]) => Promise<DmConversation>;
}

export const useDmsStore = create<DmsState>((set) => ({
  conversations: [],
  loading: false,
  fetchConversations: async () => {
    set({ loading: true });
    try {
      const conversations = await apiFetch<DmConversation[]>('/dms');
      set({ conversations, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  startDm: async (userIds: string[]) => {
    const conversation = await apiFetch<DmConversation>('/dms', {
      method: 'POST',
      body: JSON.stringify({ userIds }),
    });
    set((s) => {
      const exists = s.conversations.some((c) => c.id === conversation.id);
      return exists ? s : { conversations: [...s.conversations, conversation] };
    });
    return conversation;
  },
}));
