import type { InputAdapter } from '../../input/core';
import { logger } from '../../utils/logger';

const heldKeys = new WeakMap<InputAdapter, Map<string, number>>();

export function createKeyboardOwnership(backend: InputAdapter) {
  const sources = new Map<string, string>();
  const counts = heldKeys.get(backend) ?? new Map<string, number>();
  heldKeys.set(backend, counts);

  const set = (source: string, key: string, down: boolean) => {
    if (down) {
      if (sources.has(source)) return;
      const wasHeld = counts.has(key);
      sources.set(source, key);
      counts.set(key, (counts.get(key) ?? 0) + 1);
      if (!wasHeld) backend.updateKeyboard({ [key]: true });
    } else {
      const ownedKey = sources.get(source);
      if (ownedKey === undefined) return;
      const count = counts.get(ownedKey) ?? 0;
      sources.delete(source);
      if (count <= 1) {
        counts.delete(ownedKey);
        backend.updateKeyboard({ [ownedKey]: false });
      } else {
        counts.set(ownedKey, count - 1);
      }
    }
  };

  return {
    set,
    isHeld: (key: string) => counts.has(key),
    release: () => {
      const released = new Set<string>();
      for (const key of sources.values()) {
        const count = counts.get(key) ?? 0;
        if (count <= 1) { counts.delete(key); released.add(key); } else counts.set(key, count - 1);
      }
      sources.clear();
      for (const key of released) if (!counts.has(key)) {
        try { backend.updateKeyboard({ [key]: false }); }
        catch (error) { logger.error('Keyboard ownership release failed', error instanceof Error ? error : String(error)); }
      }
    },
  };
}
