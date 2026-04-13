import { create } from 'zustand';
import { apiFetch } from '@/lib/api';

interface SearchResult {
  id: string;
  content: string;
  channelId: string | null;
  userId: string;
  userName: string;
  channelName: string | null;
  createdAt: number;
  _formatted?: { content: string };
}

interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  isOpen: boolean;
  totalHits: number;
  setQuery: (q: string) => void;
  search: () => Promise<void>;
  open: () => void;
  close: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  results: [],
  loading: false,
  isOpen: false,
  totalHits: 0,

  setQuery: (q) => set({ query: q }),

  search: async () => {
    const q = get().query.trim();
    if (!q) { set({ results: [], totalHits: 0 }); return; }
    set({ loading: true });
    try {
      const data = await apiFetch<{ hits: SearchResult[]; estimatedTotalHits: number }>(`/search?q=${encodeURIComponent(q)}`);
      set({ results: data.hits, totalHits: data.estimatedTotalHits, loading: false });
    } catch { set({ loading: false }); }
  },

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false, query: '', results: [] }),
}));
