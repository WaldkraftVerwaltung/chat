import { create } from 'zustand';

interface PresenceState {
  presenceMap: Record<string, 'active' | 'away' | 'dnd'>;
  setPresence: (userId: string, presence: 'active' | 'away' | 'dnd') => void;
  setBulkPresence: (map: Record<string, string>) => void;
}

export const usePresenceStore = create<PresenceState>((set) => ({
  presenceMap: {},
  setPresence: (userId, presence) => set((s) => ({
    presenceMap: { ...s.presenceMap, [userId]: presence },
  })),
  setBulkPresence: (map) => set((s) => ({
    presenceMap: { ...s.presenceMap, ...map },
  })),
}));
