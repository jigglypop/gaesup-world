import { useState } from 'react';

/** Headroom over the first count, so the first edits of a loaded world do not reallocate. */
const INITIAL_HEADROOM = 1.25;
const MIN_CAPACITY = 16;

/**
 * Instance capacity that starts with headroom, grows by 1.5x and never shrinks, so an InstancedMesh keeps its
 * identity (and its GPU batch) across edits. Growing during render avoids a frame where count exceeds the buffer.
 */
export function useInstanceCapacity(count: number): number {
  const [capacity, setCapacity] = useState(() => Math.max(MIN_CAPACITY, Math.ceil(count * INITIAL_HEADROOM)));
  if (count <= capacity) return capacity;
  const next = Math.max(count, Math.ceil(capacity * 1.5));
  setCapacity(next);
  return next;
}
