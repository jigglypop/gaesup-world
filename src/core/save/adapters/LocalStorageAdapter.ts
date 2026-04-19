import type { SaveAdapter, SaveBlob } from '../types';

const PREFIX = 'gaesup:save:';

function safe<T>(fn: () => T, fallback: T): T {
  try { return fn(); } catch { return fallback; }
}

export class LocalStorageAdapter implements SaveAdapter {
  async read(slot: string): Promise<SaveBlob | null> {
    if (typeof localStorage === 'undefined') return null;
    return safe(() => {
      const raw = localStorage.getItem(PREFIX + slot);
      return raw ? (JSON.parse(raw) as SaveBlob) : null;
    }, null);
  }
  async write(slot: string, blob: SaveBlob): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    safe(() => localStorage.setItem(PREFIX + slot, JSON.stringify(blob)), undefined);
  }
  async list(): Promise<string[]> {
    if (typeof localStorage === 'undefined') return [];
    return safe(() => {
      const out: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
      }
      return out;
    }, []);
  }
  async remove(slot: string): Promise<void> {
    if (typeof localStorage === 'undefined') return;
    safe(() => localStorage.removeItem(PREFIX + slot), undefined);
  }
}
