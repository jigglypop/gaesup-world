import { useState } from 'react';

/**
 * Instance capacity that grows by 1.5x and never shrinks, so an InstancedMesh keeps its identity (and its GPU
 * batch) across edits. Growing during render avoids a frame where count exceeds the buffer.
 */
export function useInstanceCapacity(count: number): number {
  const [capacity, setCapacity] = useState(() => Math.max(1, count));
  if (count <= capacity) return capacity;
  const next = Math.max(count, Math.ceil(capacity * 1.5));
  setCapacity(next);
  return next;
}
