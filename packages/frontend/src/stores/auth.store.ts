import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: { id: string; email: string; displayName: string; avatarUrl: string | null; role?: string } | null;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: typeof window !== 'undefined' && !!localStorage.getItem('accessToken'),
  user: null,
  login: (tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    set({ isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ isAuthenticated: false, user: null });
  },
  setUser: (user) => set({ user }),
}));
