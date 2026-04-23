import type { SaveAdapter, SaveBlob } from '../types';

const DB_NAME = 'gaesup-save';
const DB_VERSION = 1;
const STORE = 'slots';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T> | Promise<T>,
): Promise<T> {
  return openDb().then((db) =>
    new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const result = fn(store);
      if (result instanceof Promise) {
        result.then(resolve, reject);
        return;
      }
      result.onsuccess = () => resolve(result.result as T);
      result.onerror = () => reject(result.error);
    }),
  );
}

export class IndexedDBAdapter implements SaveAdapter {
  async read(slot: string): Promise<SaveBlob | null> {
    try {
      const v = await withStore<SaveBlob | undefined>('readonly', (s) => s.get(slot));
      return v ?? null;
    } catch {
      return null;
    }
  }
  async write(slot: string, blob: SaveBlob): Promise<void> {
    await withStore<IDBValidKey>('readwrite', (s) => s.put(blob, slot));
  }
  async list(): Promise<string[]> {
    try {
      const v = await withStore<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
      return v.map(String);
    } catch {
      return [];
    }
  }
  async remove(slot: string): Promise<void> {
    try {
      await withStore<undefined>('readwrite', (s) => s.delete(slot));
    } catch {
      void 0;
    }
  }
}
