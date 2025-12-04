import { create } from 'zustand';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser } from './auth-service';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,

  setUser: (user) => set({ user, isLoading: false }),

  setLoading: (loading) => set({ isLoading: loading }),

  initializeAuth: () => {
    // Set initial user if available
    const currentUser = getCurrentUser();
    if (currentUser) {
      set({ user: currentUser, isLoading: false });
    } else {
      set({ isLoading: false });
    }

    // Subscribe to auth state changes
    onAuthStateChange((user) => {
      set({ user, isLoading: false });
    });
  },

  clearAuth: () => set({ user: null, isLoading: false }),
}));







