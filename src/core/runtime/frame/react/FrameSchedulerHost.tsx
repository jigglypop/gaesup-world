import { useEffect, useLayoutEffect, useState } from 'react';

import { useFrame } from '@react-three/fiber';

import { getFrameTimeMs } from '../../../boilerplate/hooks/frameTime';
import { frameScheduler, POST_PHYSICS_PHASE_INDEX, type FrameScheduler } from '../FrameScheduler';
import { FRAME_PHASES } from '../types';
import { useCanvasFrameScheduler } from './canvasScheduler';
import { warnIfDuplicateHost } from './hostWarnings';
import type { FrameSchedulerHostProps } from './types';

export const FRAME_PRE_PHYSICS_PRIORITY = -100;
export const PHYSICS_STEP_PRIORITY = -50;
export const FRAME_SCHEDULER_PRIORITY = -1;

function tickOwnedPhases(
  token: object,
  scheduler: FrameScheduler,
  start: number,
  end: number,
  delta: number,
  elapsedMs: number,
): void {
  const ownsGlobal = scheduler !== frameScheduler && frameScheduler.isTickOwner(token);
  const ownsCanvas = scheduler.isTickOwner(token);
  for (let p = start; p < end; p++) {
    if (ownsGlobal) frameScheduler.tickPhase(p, delta, elapsedMs);
    if (ownsCanvas) scheduler.tickPhase(p, delta, elapsedMs);
  }
}

export function FrameSchedulerHost({ scheduler: schedulerProp, metrics = false }: FrameSchedulerHostProps) {
  const canvasScheduler = useCanvasFrameScheduler();
  const scheduler = schedulerProp ?? canvasScheduler;
  const [token] = useState(() => ({}));

  useLayoutEffect(() => {
    const detach = scheduler.attachHost(token);
    const detachGlobal = scheduler === frameScheduler ? undefined : frameScheduler.attachHost(token);
    warnIfDuplicateHost(scheduler);
    return () => {
      detachGlobal?.();
      detach();
    };
  }, [scheduler, token]);

  useEffect(() => {
    scheduler.setMetricsEnabled(metrics);
    return () => scheduler.setMetricsEnabled(false);
  }, [metrics, scheduler]);

  useFrame((state, delta) => {
    tickOwnedPhases(token, scheduler, 0, POST_PHYSICS_PHASE_INDEX, delta, getFrameTimeMs(state));
  }, FRAME_PRE_PHYSICS_PRIORITY);

  useFrame((state, delta) => {
    tickOwnedPhases(token, scheduler, POST_PHYSICS_PHASE_INDEX, FRAME_PHASES.length, delta, getFrameTimeMs(state));
  }, FRAME_SCHEDULER_PRIORITY);

  return null;
}
