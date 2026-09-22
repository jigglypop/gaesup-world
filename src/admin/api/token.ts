const TOKEN_KEY = 'gaesup-admin-token';
const LEGACY_TOKEN_KEY = 'token';

let memoryToken: string | null = null;

function sessionStore(): Storage | null {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
}

/**
 * Session-scoped bearer token. The server remains the authority: a stored token only
 * enables a verification request, it never marks the client as authenticated by itself.
 */
export const adminToken = {
  get(): string | null {
    if (memoryToken) return memoryToken;
    try {
      memoryToken = sessionStore()?.getItem(TOKEN_KEY) ?? null;
    } catch {
      memoryToken = null;
    }
    return memoryToken;
  },
  set(token: string): void {
    memoryToken = token;
    try {
      sessionStore()?.setItem(TOKEN_KEY, token);
    } catch {
      // Storage can be unavailable (private mode, quota); the in-memory token still works.
    }
  },
  clear(): void {
    memoryToken = null;
    try {
      sessionStore()?.removeItem(TOKEN_KEY);
      if (typeof localStorage !== 'undefined') localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch {
      // ignore
    }
  },
};
