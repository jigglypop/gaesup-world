import type { SaveAdapter, SaveBlob } from '../types';

/** Isolates every named slot, including explicitly supplied slot names, within one persistent world. */
export class NamespacedSaveAdapter implements SaveAdapter {
  private readonly prefix: string;
  constructor(private readonly adapter: SaveAdapter, namespace: string) {
    if (!namespace.trim()) throw new TypeError('Save namespace must not be empty');
    this.prefix = `world:${encodeURIComponent(namespace)}:`;
  }
  read(slot: string): Promise<SaveBlob | null> { return this.adapter.read(this.prefix + slot); }
  write(slot: string, blob: SaveBlob): Promise<void> { return this.adapter.write(this.prefix + slot, blob); }
  remove(slot: string): Promise<void> { return this.adapter.remove(this.prefix + slot); }
  async list(): Promise<string[]> {
    return (await this.adapter.list()).filter(slot => slot.startsWith(this.prefix)).map(slot => slot.slice(this.prefix.length));
  }
}
