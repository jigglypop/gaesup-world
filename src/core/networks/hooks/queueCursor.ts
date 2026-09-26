import type { NetworkMessage } from '../types';

/** Where a reader stopped in a node's message queue; a null tail reads the whole queue again. */
export type QueueCursor = { tailId: string | null };

const NONE: readonly NetworkMessage[] = [];

/** The messages appended to a node queue since the cursor's tail; advances the cursor. */
export function takeNewMessages(queue: readonly NetworkMessage[], cursor: QueueCursor): readonly NetworkMessage[] {
  const tailId = queue[queue.length - 1]?.id ?? null;
  if (tailId === null || tailId === cursor.tailId) return NONE;
  let start = 0;
  if (cursor.tailId) {
    for (let i = queue.length - 1; i >= 0; i--) {
      if (queue[i]?.id === cursor.tailId) {
        start = i + 1;
        break;
      }
    }
  }
  cursor.tailId = tailId;
  return queue.slice(start);
}
