import { create } from 'zustand';

import { userType } from './types';
import { checkApi, loginApi, logoutSession, tokenAsync } from '../api/auth';
import { AdminApiError } from '../api/builder';
import { adminToken } from '../api/token';

interface ModalState {
  on: boolean;
  type: string;
  file: number;
  username: string;
  gltf_url: string;
}

export type AdminAuthStatus = 'unknown' | 'checking' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AdminAuthStatus;
  isLoggedIn: boolean;
  user: userType | null;
  loading: boolean;
  error: string | null;
  modal: ModalState;
  login: (username: string, password: string) => Promise<boolean>;
  /** Confirms the stored session with the server; client state alone never grants access. */
  verify: () => Promise<boolean>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setModal: (modal: ModalState) => void;
}

const LEGACY_PERSIST_KEY = 'gaesup-admin-auth';

function dropLegacyPersistedSession(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(LEGACY_PERSIST_KEY);
  } catch {
    // ignore
  }
}

function describeFailure(error: unknown): string {
  if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) {
    return '사용자 이름 또는 비밀번호를 확인하세요.';
  }
  return '서버에 연결할 수 없습니다.';
}

export const useAuthStore = create<AuthState>()((set, get) => {
  let generation = 0;
  dropLegacyPersistedSession();

  const signedOut = (error: string | null = null) => ({
    status: 'anonymous' as const,
    isLoggedIn: false,
    user: null,
    loading: false,
    error,
  });

  return {
    status: 'unknown',
    isLoggedIn: false,
    user: null,
    loading: false,
    error: null,
    modal: {
      on: false,
      type: "",
      file: -1,
      username: "",
      gltf_url: "",
    },
    login: async (username, password) => {
      const request = ++generation;
      set({ loading: true, error: null });
      try {
        const session = await loginApi({ username, password });
        if (request !== generation) return false;
        adminToken.set(session.token);
        set({ status: 'authenticated', isLoggedIn: true, user: session.user, loading: false, error: null });
        return true;
      } catch (error) {
        if (request !== generation) return false;
        logoutSession();
        set(signedOut(describeFailure(error)));
        return false;
      }
    },
    verify: async () => {
      const current = get().status;
      if (current === 'authenticated') return true;
      const request = ++generation;
      if (!(await tokenAsync())) {
        if (request === generation) set(signedOut());
        return false;
      }
      set({ status: 'checking', loading: true, error: null });
      try {
        const user = await checkApi();
        if (request !== generation) return false;
        set({ status: 'authenticated', isLoggedIn: true, user, loading: false, error: null });
        return true;
      } catch (error) {
        if (request !== generation) return false;
        if (error instanceof AdminApiError && (error.status === 401 || error.status === 403)) logoutSession();
        set(signedOut());
        return false;
      }
    },
    logout: () => {
      generation++;
      logoutSession();
      set(signedOut());
    },
    setLoading: (loading) => {
      set({ loading });
    },
    setModal: (modal) => {
      set({ modal });
    },
  };
});
