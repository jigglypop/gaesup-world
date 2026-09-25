import { isAmount, isId, isRecord } from '../../utils/guards';
import { logger } from '../../utils/logger';
import type { ItemDef, ItemId } from '../types';

const isOptionalAmount = (value: unknown) => value === undefined || isAmount(value);

/** The fields that inventory stacking and shop prices compute with. */
function isItemDef(value: unknown): value is ItemDef {
  return isRecord<ItemDef>(value) && isId(value.id)
    && typeof value.name === 'string' && typeof value.icon === 'string'
    && typeof value.stackable === 'boolean'
    && Number.isSafeInteger(value.maxStack) && (value.maxStack as number) >= 1
    && isOptionalAmount(value.buyPrice) && isOptionalAmount(value.sellPrice) && isOptionalAmount(value.durability);
}

class Registry {
  private items = new Map<ItemId, ItemDef>();

  register(def: ItemDef): void {
    if (!isItemDef(def)) {
      logger.warn(`Ignored invalid item definition: ${String((def as { id?: unknown } | null)?.id)}`);
      return;
    }
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
