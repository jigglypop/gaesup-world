import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ModalState {
  on: boolean;
  type: string;
  file: number;
  username: string;
  gltf_url: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: { username: string } | null;
  loading: boolean;
  modal: ModalState;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setModal: (modal: ModalState) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      loading: false,
      modal: {
        on: false,
        type: "",
        file: -1,
        username: "",
        gltf_url: "",
      },
      login: async (username, password) => {
        set({ loading: true });
        try {
          if (username === 'admin' && password === 'password') {
            set({ isLoggedIn: true, user: { username }, loading: false });
            return true;
          }
          set({ loading: false });
          return false;
        } catch (error) {
          set({ loading: false });
          return false;
        }
      },
      logout: () => {
        set({ isLoggedIn: false, user: null });
      },
      setLoading: (loading) => {
        set({ loading });
      },
      setModal: (modal) => {
        set({ modal });
      },
    }),
    {
      name: 'gaesup-admin-auth',
      partialize: (state) => ({ isLoggedIn: state.isLoggedIn, user: state.user }),
    }
  )
); 