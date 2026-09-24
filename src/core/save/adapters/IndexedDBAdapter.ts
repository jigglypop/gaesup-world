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

export class IndexedDBAdapter implements SaveAdapter {
  // One connection serves every operation; it reopens after a failure, another tab's upgrade or a storage reset.
  private connection: Promise<IDBDatabase> | undefined;

  async read(slot: string): Promise<SaveBlob | null> {
    const v = await this.withStore<SaveBlob | undefined>('readonly', (s) => s.get(slot));
    return v ?? null;
  }
  async write(slot: string, blob: SaveBlob): Promise<void> {
    await this.withStore<IDBValidKey>('readwrite', (s) => s.put(blob, slot));
  }
  async list(): Promise<string[]> {
    const v = await this.withStore<IDBValidKey[]>('readonly', (s) => s.getAllKeys());
    return v.map(String);
  }
  async remove(slot: string): Promise<void> {
    await this.withStore<undefined>('readwrite', (s) => s.delete(slot));
  }

  private connect(): Promise<IDBDatabase> {
    const connection = this.connection ??= openDb().then((db) => {
      db.onversionchange = () => {
        this.forget(connection);
        db.close();
      };
      db.onclose = () => this.forget(connection);
      return db;
    }, (error: unknown) => {
      this.forget(connection);
      throw error;
    });
    return connection;
  }

  private forget(connection: Promise<IDBDatabase>): void {
    if (this.connection === connection) this.connection = undefined;
  }

  private async withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const connection = this.connect();
    const db = await connection;
    return new Promise<T>((resolve, reject) => {
      try {
        const tx = db.transaction(STORE, mode);
        tx.onabort = () => reject(tx.error ?? new Error('Save transaction aborted'));
        const request = fn(tx.objectStore(STORE));
        tx.oncomplete = () => resolve(request.result);
      } catch (error) {
        // A closing connection cannot start transactions; the next operation reopens.
        this.forget(connection);
        reject(error);
      }
    });
  }
}
