import { createContext, useContext, useEffect, useLayoutEffect } from 'react';

import { context as fiberContext, type RootState, type RootStore } from '@react-three/fiber';

import { getFrameTimeMs } from '../../../boilerplate/hooks/frameTime';
import { FrameScheduler, frameScheduler, POST_PHYSICS_PHASE_INDEX } from '../FrameScheduler';
import { FRAME_PHASES } from '../types';
import { FRAME_PRE_PHYSICS_PRIORITY, FRAME_SCHEDULER_PRIORITY } from './priorities';

type ImplicitHost = { refs: number; release: () => void };

const NO_CANVAS_CONTEXT = createContext<RootStore | null>(null);
const canvasSchedulers = new WeakMap<object, FrameScheduler>();
const implicitHosts = new WeakMap<FrameScheduler, ImplicitHost>();

export const useFrameRegistrationEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useCanvasFrameScheduler(): FrameScheduler {
  const store = useRootStore();
  if (!store) return frameScheduler;
  let scheduler = canvasSchedulers.get(store);
  if (!scheduler) {
    scheduler = new FrameScheduler();
    canvasSchedulers.set(store, scheduler);
  }
  return scheduler;
}

export function useRootStore(): RootStore | null {
  return useContext<RootStore | null>(fiberContext ?? NO_CANVAS_CONTEXT);
}

function subscribeImplicitHost(scheduler: FrameScheduler, store: RootStore): () => void {
  const { subscribe } = store.getState().internal;
  const tickRange = (start: number, end: number) => ({
    current: (state: RootState, delta: number) => {
      if (scheduler.hasHost()) return;
      const elapsedMs = getFrameTimeMs(state);
      for (let phase = start; phase < end; phase++) scheduler.tickPhase(phase, delta, elapsedMs);
    },
  });
  const releasePre = subscribe(tickRange(0, POST_PHYSICS_PHASE_INDEX), FRAME_PRE_PHYSICS_PRIORITY, store);
  const releasePost = subscribe(tickRange(POST_PHYSICS_PHASE_INDEX, FRAME_PHASES.length), FRAME_SCHEDULER_PRIORITY, store);
  return () => {
    releasePre();
    releasePost();
  };
}

export function retainImplicitFrameHost(scheduler: FrameScheduler, store: RootStore | null): () => void {
  if (!store || scheduler === frameScheduler) return () => undefined;
  let host = implicitHosts.get(scheduler);
  if (!host) {
    host = { refs: 0, release: subscribeImplicitHost(scheduler, store) };
    implicitHosts.set(scheduler, host);
  }
  const retained = host;
  retained.refs++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    retained.refs--;
    if (retained.refs > 0) return;
    retained.release();
    implicitHosts.delete(scheduler);
  };
}
