import { create } from 'zustand';

import { getItemRegistry } from '../../items/registry/ItemRegistry';
import type { ItemId } from '../../items/types';
import {
  DEFAULT_HOTBAR_SIZE,
  DEFAULT_INVENTORY_SIZE,
  type InventorySerialized,
  type Slot,
} from '../types';

type InventoryState = {
  size: number;
  slots: Slot[];
  hotbar: number[];
  equippedHotbar: number;

  add: (itemId: ItemId, count?: number) => number;
  remove: (slotIndex: number, count?: number) => boolean;
  removeById: (itemId: ItemId, count?: number) => number;
  move: (from: number, to: number) => void;
  clear: () => void;

  setEquippedHotbar: (index: number) => void;
  getEquipped: () => Slot;
  getHotbarSlot: (hotbarIndex: number) => Slot;

  countOf: (itemId: ItemId) => number;
  has: (itemId: ItemId, count?: number) => boolean;

  serialize: () => InventorySerialized;
  hydrate: (data: InventorySerialized | null | undefined) => void;
  prepareHydrate: (data: InventorySerialized | null | undefined) => () => void;
};

function emptySlots(size: number): Slot[] {
  return Array.from({ length: size }, () => null);
}

function defaultHotbar(size: number): number[] {
  return Array.from({ length: size }, (_, i) => i);
}

function maxStackOf(itemId: ItemId): number {
  const def = getItemRegistry().get(itemId);
  if (!def) return 1;
  return def.stackable && Number.isSafeInteger(def.maxStack) ? Math.max(1, def.maxStack) : 1;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  size: DEFAULT_INVENTORY_SIZE,
  slots: emptySlots(DEFAULT_INVENTORY_SIZE),
  hotbar: defaultHotbar(DEFAULT_HOTBAR_SIZE),
  equippedHotbar: 0,

  add: (itemId, count = 1) => {
    if (count <= 0) return 0;
    if (!Number.isSafeInteger(count) || !itemId.trim()) return count;
    const max = maxStackOf(itemId);
    const slots = get().slots.slice();
    let remaining = count;

    if (max > 1) {
      for (let i = 0; i < slots.length && remaining > 0; i++) {
        const s = slots[i];
        if (s && s.itemId === itemId && s.count < max) {
          const space = max - s.count;
          const move = Math.min(space, remaining);
          slots[i] = { ...s, count: s.count + move };
          remaining -= move;
        }
      }
    }

    for (let i = 0; i < slots.length && remaining > 0; i++) {
      if (slots[i] === null) {
        const move = Math.min(max, remaining);
        slots[i] = { itemId, count: move };
        remaining -= move;
      }
    }

    set({ slots });
    return remaining;
  },

  remove: (slotIndex, count = 1) => {
    if (!Number.isSafeInteger(count) || count <= 0 || !Number.isSafeInteger(slotIndex)) return false;
    const slots = get().slots.slice();
    const s = slots[slotIndex];
    if (!s) return false;
    if (s.count <= count) {
      slots[slotIndex] = null;
    } else {
      slots[slotIndex] = { ...s, count: s.count - count };
    }
    set({ slots });
    return true;
  },

  removeById: (itemId, count = 1) => {
    if (!Number.isSafeInteger(count) || count <= 0) return 0;
    const slots = get().slots.slice();
    let remaining = count;
    for (let i = 0; i < slots.length && remaining > 0; i++) {
      const s = slots[i];
      if (!s || s.itemId !== itemId) continue;
      const move = Math.min(s.count, remaining);
      if (s.count <= move) slots[i] = null;
      else slots[i] = { ...s, count: s.count - move };
      remaining -= move;
    }
    set({ slots });
    return count - remaining;
  },

  move: (from, to) => {
    if (from === to || !Number.isInteger(from) || !Number.isInteger(to)) return;
    const slots = get().slots.slice();
    if (from < 0 || to < 0 || from >= slots.length || to >= slots.length) return;
    const a = slots[from];
    const b = slots[to];
    if (a && b && a.itemId === b.itemId) {
      const max = maxStackOf(a.itemId);
      if (max > 1) {
        const space = max - b.count;
        if (space > 0) {
          const move = Math.min(space, a.count);
          slots[to] = { ...b, count: b.count + move };
          if (a.count - move <= 0) slots[from] = null;
          else slots[from] = { ...a, count: a.count - move };
          set({ slots });
          return;
        }
      }
    }
    slots[from] = b ?? null;
    slots[to] = a ?? null;
    set({ slots });
  },

  clear: () => set({ slots: emptySlots(get().size) }),

  setEquippedHotbar: (index) => {
    if (!Number.isSafeInteger(index)) return;
    const hotbar = get().hotbar;
    const next = hotbar.length ? ((index % hotbar.length) + hotbar.length) % hotbar.length : 0;
    set({ equippedHotbar: next });
  },

  getEquipped: () => {
    const { hotbar, slots, equippedHotbar } = get();
    const slotIndex = hotbar[equippedHotbar];
    if (slotIndex == null || slotIndex < 0 || slotIndex >= slots.length) return null;
    return slots[slotIndex] ?? null;
  },

  getHotbarSlot: (hotbarIndex) => {
    const { hotbar, slots } = get();
    const slotIndex = hotbar[hotbarIndex];
    if (slotIndex == null) return null;
    return slots[slotIndex] ?? null;
  },

  countOf: (itemId) => {
    let n = 0;
    for (const s of get().slots) if (s && s.itemId === itemId) n += s.count;
    return n;
  },

  has: (itemId, count = 1) => get().countOf(itemId) >= count,

  serialize: (): InventorySerialized => {
    const { slots, hotbar, equippedHotbar } = get();
    return {
      version: 1,
      slots: slots.map((s) => (s ? { ...s } : null)),
      hotbar: [...hotbar],
      equippedHotbar,
    };
  },

  prepareHydrate: (data) => {
    if (data === null || data === undefined) return () => {};
    if (typeof data !== 'object' || data.version !== 1 ||
      !Array.isArray(data.slots) || !Array.isArray(data.hotbar) ||
      !Number.isInteger(data.equippedHotbar)) throw new TypeError('Invalid inventory snapshot');
    const size = data.slots.length;
    const slots: Slot[] = Array.from(data.slots, (slot) => {
      if (slot === null) return null;
      if (!slot || typeof slot !== 'object' || typeof slot.itemId !== 'string' || !slot.itemId.trim() ||
        !Number.isSafeInteger(slot.count) || slot.count <= 0 ||
        (slot.durability !== undefined && (typeof slot.durability !== 'number' ||
          !Number.isFinite(slot.durability) || slot.durability < 0))) {
        throw new TypeError('Invalid inventory slot');
      }
      return { ...slot };
    });
    const hotbar = Array.from(data.hotbar, (index) => {
      if (!Number.isInteger(index) || index < 0 || index >= size) throw new TypeError('Invalid inventory hotbar');
      return index;
    }).slice(0, DEFAULT_HOTBAR_SIZE);
    const equippedHotbar = Math.max(0, Math.min(Math.max(0, hotbar.length - 1), data.equippedHotbar));
    return () => set({ size, slots, hotbar, equippedHotbar });
  },
  hydrate: (data) => get().prepareHydrate(data)(),
}));
