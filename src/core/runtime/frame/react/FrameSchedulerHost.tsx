import { useEffect, useLayoutEffect, useState } from 'react';

import { useFrame } from '@react-three/fiber';

import { getFrameTimeMs } from '../../../boilerplate/hooks/frameTime';
import { useGaesupRuntime } from '../../runtimeContext';
import { frameScheduler, POST_PHYSICS_PHASE_INDEX, type FrameScheduler } from '../FrameScheduler';
import { FRAME_PHASES } from '../types';
import { useCanvasFrameScheduler } from './canvasScheduler';
import { warnIfDuplicateHost } from './hostWarnings';
import { FRAME_PRE_PHYSICS_PRIORITY, FRAME_SCHEDULER_PRIORITY } from './priorities';
import type { FrameSchedulerHostProps } from './types';

export { FRAME_PRE_PHYSICS_PRIORITY, FRAME_SCHEDULER_PRIORITY, PHYSICS_STEP_PRIORITY } from './priorities';

/** Longest frame the engine phases advance by at once; a longer gap (a hidden tab, a stall) is dropped. */
const MAX_FRAME_DELTA = 1;

/** A canvas delta the engine can use: time never runs backwards and a stall does not replay seconds at once. */
export function engineFrameDelta(delta: number): number {
  return delta > 0 ? Math.min(delta, MAX_FRAME_DELTA) : 0;
}

function tickOwnedPhases(
  token: object,
  scheduler: FrameScheduler,
  start: number,
  end: number,
  rawDelta: number,
  elapsedMs: number,
): void {
  const delta = engineFrameDelta(rawDelta);
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
  const runtime = useGaesupRuntime();

  // Frames are counted where the scheduler already numbers them, so reading the stat costs nothing per frame.
  useLayoutEffect(() => runtime?.stats.source('frames', () => scheduler.getFrame()), [runtime, scheduler]);

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
