import { useEffect } from 'react';

import { useInventoryStore } from '../stores/inventoryStore';

export function useInventory() {
  return useInventoryStore((s) => ({
    slots: s.slots,
    add: s.add,
    remove: s.remove,
    removeById: s.removeById,
    move: s.move,
    countOf: s.countOf,
    has: s.has,
  }));
}

export function useEquippedItem() {
  return useInventoryStore((s) => {
    const slotIndex = s.hotbar[s.equippedHotbar];
    if (slotIndex == null) return null;
    return s.slots[slotIndex] ?? null;
  });
}

export function useHotbar() {
  const hotbar = useInventoryStore((s) => s.hotbar);
  const slots = useInventoryStore((s) => s.slots);
  const equipped = useInventoryStore((s) => s.equippedHotbar);
  const setEquipped = useInventoryStore((s) => s.setEquippedHotbar);
  return {
    hotbar,
    slots: hotbar.map((i) => slots[i] ?? null),
    equipped,
    setEquipped,
  };
}

export function useHotbarKeyboard(enabled: boolean = true): void {
  const setEquipped = useInventoryStore((s) => s.setEquippedHotbar);
  const equipped = useInventoryStore((s) => s.equippedHotbar);
  const hotbar = useInventoryStore((s) => s.hotbar);
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      const num = Number(e.key);
      if (Number.isInteger(num) && num >= 1 && num <= hotbar.length) {
        setEquipped(num - 1);
        return;
      }
      if (e.key === 'q' || e.key === 'Q') setEquipped(equipped - 1);
      if (e.key === 'e' || e.key === 'E') setEquipped(equipped + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [enabled, setEquipped, equipped, hotbar.length]);
}
