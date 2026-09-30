import { isProductionEnv } from '../../../utils/env';
import { logger } from '../../../utils/logger';
import type { FrameScheduler } from '../FrameScheduler';

const duplicateHostWarned = new WeakSet<FrameScheduler>();

export function warnIfDuplicateHost(scheduler: FrameScheduler): void {
  if (isProductionEnv() || scheduler.hostCount() < 2 || duplicateHostWarned.has(scheduler)) return;
  duplicateHostWarned.add(scheduler);
  logger.warn(
    '[FrameScheduler] More than one <FrameSchedulerHost /> is mounted for the same canvas. ' +
      'Only the first one ticks; remove the extra host.',
  );
}
