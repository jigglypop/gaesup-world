import { createContext, useContext, useEffect, useId, useRef, type RefObject } from 'react';

import type { RootState } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import type { Group } from 'three';

import type { FixedStepClock } from './FixedStepClock';
import type { PhysicsPresentation, PresentationTarget } from './PhysicsPresentation';

export type WorldPhysicsClock = {
  clock: FixedStepClock;
  getState: () => RootState;
  isRunning: () => boolean;
  presentation: PhysicsPresentation;
};

export const WorldPhysicsContext = createContext<WorldPhysicsClock | null>(null);

/** Runs controls before Rapier, independent of presentation frequency. Returns false for legacy Physics. */
export function useWorldPhysicsStep(update: (state: RootState, delta: number) => void, enabled = true): boolean {
  const context = useContext(WorldPhysicsContext);
  const id = useId();
  const callback = useRef(update);
  callback.current = update;
  useEffect(() => {
    if (!context || !enabled) return;
    return context.clock.addSystem({
      id: `physics-controls:${id}`,
      phase: 'simulation',
      update: tick => {
        if (context.isRunning()) callback.current(context.getState(), tick.deltaSeconds);
      },
    });
  }, [context, enabled, id]);
  return context !== null;
}

/**
 * Attach the returned ref to a group containing visuals, beside the body's colliders. A `target` receives the
 * interpolated world position as `presentedPosition` while the visual is presented.
 */
export function useWorldPhysicsInterpolation(body: RefObject<RapierRigidBody | null>, target?: PresentationTarget): RefObject<Group> {
  const context = useContext(WorldPhysicsContext);
  const visual = useRef<Group>(null!);
  useEffect(() => {
    if (!context || !body.current || !visual.current) return;
    return context.presentation.register(body.current, visual.current, target);
  }, [body, context, target]);
  return visual;
}
