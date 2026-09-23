import { logger } from '../../../utils/logger';
import type { FrameScheduler } from '../FrameScheduler';

const MISSING_HOST_CHECK_MS = 1000;
const missingHostWarned = new WeakSet<FrameScheduler>();
const duplicateHostWarned = new WeakSet<FrameScheduler>();

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function warnIfHostMissing(scheduler: FrameScheduler, label: string): () => void {
  if (isProduction() || scheduler.hasHost() || missingHostWarned.has(scheduler)) return () => undefined;
  const timer = setTimeout(() => {
    if (scheduler.hasHost() || missingHostWarned.has(scheduler)) return;
    missingHostWarned.add(scheduler);
    logger.warn(
      `[FrameScheduler] "${label}" frame work is registered but no <FrameSchedulerHost /> is mounted inside <Canvas>. ` +
        'GaesupWorldContent mounts one automatically; standalone canvases must add it.',
    );
  }, MISSING_HOST_CHECK_MS);
  return () => clearTimeout(timer);
}

export function warnIfDuplicateHost(scheduler: FrameScheduler): void {
  if (isProduction() || scheduler.hostCount() < 2 || duplicateHostWarned.has(scheduler)) return;
  duplicateHostWarned.add(scheduler);
  logger.warn(
    '[FrameScheduler] More than one <FrameSchedulerHost /> is mounted for the same canvas. ' +
      'Only the first one ticks; remove the extra host.',
  );
}
