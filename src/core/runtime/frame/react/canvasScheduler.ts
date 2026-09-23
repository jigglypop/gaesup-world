import { createContext, useContext, useEffect, useLayoutEffect } from 'react';

import { context as fiberContext } from '@react-three/fiber';

import { FrameScheduler, frameScheduler } from '../FrameScheduler';

const NO_CANVAS_CONTEXT = createContext<object | null>(null);
const canvasSchedulers = new WeakMap<object, FrameScheduler>();

export const useFrameRegistrationEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

export function useCanvasFrameScheduler(): FrameScheduler {
  const store: object | null = useContext(fiberContext ?? NO_CANVAS_CONTEXT);
  if (!store) return frameScheduler;
  let scheduler = canvasSchedulers.get(store);
  if (!scheduler) {
    scheduler = new FrameScheduler();
    canvasSchedulers.set(store, scheduler);
  }
  return scheduler;
}
