import { REVISION } from 'three';

/** three.js revisions whose private renderer internals (attributes, node library, indirect draw) GPU batching was verified against. */
export const GPU_BATCH_REVISIONS: ReadonlySet<string> = new Set(['185', '186']);

export function isGpuBatchRevision(revision: string = REVISION): boolean {
  return GPU_BATCH_REVISIONS.has(revision);
}
