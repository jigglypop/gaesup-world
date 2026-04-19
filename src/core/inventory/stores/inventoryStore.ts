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
  return def.stackable ? Math.max(1, def.maxStack) : 1;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  size: DEFAULT_INVENTORY_SIZE,
  slots: emptySlots(DEFAULT_INVENTORY_SIZE),
  hotbar: defaultHotbar(DEFAULT_HOTBAR_SIZE),
  equippedHotbar: 0,

  add: (itemId, count = 1) => {
    if (count <= 0) return 0;
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
    const slots = get().slots.slice();
    const s = slots[slotIndex];
    if (!s || count <= 0) return false;
    if (s.count <= count) {
      slots[slotIndex] = null;
    } else {
      slots[slotIndex] = { ...s, count: s.count - count };
    }
    set({ slots });
    return true;
  },

  removeById: (itemId, count = 1) => {
    if (count <= 0) return 0;
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
    slots[from] = b;
    slots[to] = a;
    set({ slots });
  },

  clear: () => set({ slots: emptySlots(get().size) }),

  setEquippedHotbar: (index) => {
    const hotbar = get().hotbar;
    const next = ((index % hotbar.length) + hotbar.length) % hotbar.length;
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

  hydrate: (data) => {
    if (!data) return;
    const size = Array.isArray(data.slots) ? data.slots.length : DEFAULT_INVENTORY_SIZE;
    const slots: Slot[] = Array.isArray(data.slots)
      ? data.slots.map((s) => (s && typeof s === 'object' && s.itemId ? { ...s } : null))
      : emptySlots(size);
    const hotbar: number[] = Array.isArray(data.hotbar)
      ? data.hotbar.slice(0, DEFAULT_HOTBAR_SIZE)
      : defaultHotbar(DEFAULT_HOTBAR_SIZE);
    const equipped = typeof data.equippedHotbar === 'number'
      ? Math.max(0, Math.min(hotbar.length - 1, data.equippedHotbar))
      : 0;
    set({ size, slots, hotbar, equippedHotbar: equipped });
  },
}));
