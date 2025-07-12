import { IStorage } from '../interfaces/IStorage';

export class MemoryStorage implements IStorage {
  private storage = new Map<string, string>();

  get<T>(key: string): T | null {
    const item = this.storage.get(key);
    if (!item) return null;
    
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, JSON.stringify(value));
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.storage.has(key);
  }

  getKeys(): string[] {
    return Array.from(this.storage.keys());
  }
} 