import { useEffect } from 'react';

import { useFrame } from '@react-three/fiber';

import { frameScheduler } from '../FrameScheduler';
import type { FrameSchedulerHostProps } from './types';

export const FRAME_SCHEDULER_PRIORITY = -1;

export function FrameSchedulerHost({ scheduler = frameScheduler, metrics = false }: FrameSchedulerHostProps) {
  useEffect(() => {
    scheduler.setMetricsEnabled(metrics);
    return () => scheduler.setMetricsEnabled(false);
  }, [metrics, scheduler]);

  useFrame((_, delta) => {
    scheduler.tick(delta, performance.now());
  }, FRAME_SCHEDULER_PRIORITY);

  return null;
}
