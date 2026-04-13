import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface ThreadsState {
  activeThreadId: string | null;
  replies: Record<string, any[]>;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  fetchReplies: (messageId: string) => Promise<void>;
  addReply: (parentId: string, reply: any) => void;
}

export const useThreadsStore = create<ThreadsState>((set) => ({
  activeThreadId: null,
  replies: {},
  openThread: (messageId) => set({ activeThreadId: messageId }),
  closeThread: () => set({ activeThreadId: null }),
  fetchReplies: async (messageId) => {
    const replies = await apiFetch<any[]>(`/messages/${messageId}/thread`);
    set((s) => ({ replies: { ...s.replies, [messageId]: replies } }));
  },
  addReply: (parentId, reply) => set((s) => {
    const existing = s.replies[parentId] || [];
    if (existing.some((r: any) => r.id === reply.id)) return s;
    return { replies: { ...s.replies, [parentId]: [...existing, reply] } };
  }),
}));
