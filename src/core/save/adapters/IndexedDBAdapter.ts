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
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        try {
          const tx = db.transaction(STORE, mode);
          tx.onabort = () => {
            db.close();
            reject(tx.error ?? new Error('Save transaction aborted'));
          };
          const request = fn(tx.objectStore(STORE));
          tx.oncomplete = () => {
            db.close();
            resolve(request.result);
          };
        } catch (error) {
          db.close();
          reject(error);
        }
      }),
  );
}

export class IndexedDBAdapter implements SaveAdapter {
  async read(slot: string): Promise<SaveBlob | null> {
    const v = await withStore<SaveBlob | undefined>('readonly', (s) => s.get(slot));
    return v ?? null;
  }
  async write(slot: string, blob: SaveBlob): Promise<void> {
    await withStore<IDBValidKey>('readwrite', (s) => s.put(blob, slot));
  }
  async list(): Promise<string[]> {
    const v = await withStore<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
    return v.map(String);
  }
  async remove(slot: string): Promise<void> {
    await withStore<undefined>('readwrite', (s) => s.delete(slot));
  }
}
