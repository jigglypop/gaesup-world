import type { SaveAdapter, SaveBlob } from '../types';

const PREFIX = 'gaesup:save:';

export class LocalStorageAdapter implements SaveAdapter {
  async read(slot: string): Promise<SaveBlob | null> {
    const raw = localStorage.getItem(PREFIX + slot);
    return raw === null ? null : (JSON.parse(raw) as SaveBlob);
  }
  async write(slot: string, blob: SaveBlob): Promise<void> {
    localStorage.setItem(PREFIX + slot, JSON.stringify(blob));
  }
  async list(): Promise<string[]> {
    const out: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
    }
    return out;
  }
  async remove(slot: string): Promise<void> {
    localStorage.removeItem(PREFIX + slot);
  }
}
