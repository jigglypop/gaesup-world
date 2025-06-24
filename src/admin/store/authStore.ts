import { create } from 'zustand';

interface AuthState {
  isLoggedIn: boolean;
  user: { username: string } | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  login: async (username, password) => {
    // In a real app, you'd make an API call here.
    // For now, we'll use a hardcoded username and password.
    if (username === 'admin' && password === 'password') {
      set({ isLoggedIn: true, user: { username } });
      return true;
    }
    return false;
  },
  logout: () => {
    set({ isLoggedIn: false, user: null });
  },
})); 