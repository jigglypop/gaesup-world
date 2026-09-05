import type { ItemDef, ItemId } from '../types';

class Registry {
  private items = new Map<ItemId, ItemDef>();

  register(def: ItemDef): void {
    if (this.items.has(def.id)) return;
    this.items.set(def.id, Object.freeze({ ...def }));
  }

  registerAll(defs: ItemDef[]): void {
    for (const d of defs) this.register(d);
  }

  get(id: ItemId): ItemDef | undefined { return this.items.get(id); }

  require(id: ItemId): ItemDef {
    const v = this.items.get(id);
    if (!v) throw new Error(`Unknown ItemId: ${id}`);
    return v;
  }

  all(): ItemDef[] { return Array.from(this.items.values()); }

  has(id: ItemId): boolean { return this.items.has(id); }

  clear(): void { this.items.clear(); }
}

let _instance: Registry | null = null;

export function getItemRegistry(): Registry {
  if (!_instance) _instance = new Registry();
  return _instance;
}

export type ItemRegistry = Registry;
