import { useEffect, useId, useMemo, useRef } from 'react';

import { useFrame, useThree } from '@react-three/fiber';
import { Physics, useRapier, type PhysicsProps } from '@react-three/rapier';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import { WorldPhysicsContext, type WorldPhysicsClock } from '../../../simulation/physicsContext';
import { PhysicsPresentation } from '../../../simulation/PhysicsPresentation';
import { getTimeClock } from '../../../time/core/timeClock';
import { useTimeStoreApi } from '../../../time/stores/timeStore';

export type WorldPhysicsProps = Omit<PhysicsProps, 'timeStep' | 'updateLoop'>;

/** Rapier simulation shares the runtime's fixed clock with time, gameplay and networking. */
export function WorldPhysics({ children, paused = false, interpolate = true, ...props }: WorldPhysicsProps) {
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const timeStore = useTimeStoreApi();
  const loop = runtime?.clockLoop ?? getTimeClock(timeStore);
  const getState = useThree(state => state.get);
  const running = useRef(false);
  running.current = !paused && (!runtime || runtime.isActive());
  const context = useMemo<WorldPhysicsClock>(() => ({
    clock: loop.clock, getState, isRunning: () => running.current && (!runtime || runtime.isActive()), presentation: new PhysicsPresentation(),
  }), [loop, getState, runtime]);

  useEffect(() => {
    if (!running.current) return;
    return loop.acquire();
  }, [loop, paused, runtime, revision]);

  useFrame(() => context.presentation.present(interpolate && context.isRunning() ? loop.clock.interpolationAlpha : 1));

  return <WorldPhysicsContext.Provider value={context}>
    <Physics {...props} paused timeStep={loop.clock.deltaSeconds} interpolate={false}>
      <PhysicsStep context={context} />
      {children}
    </Physics>
  </WorldPhysicsContext.Provider>;
}

function PhysicsStep({ context }: { context: WorldPhysicsClock }) {
  const { step } = useRapier();
  const id = useId();
  useEffect(() => context.clock.addSystem({
    id: `rapier:${id}`, phase: 'physics',
    update: tick => {
      if (!context.isRunning()) return;
      context.presentation.beforeStep();
      step(tick.deltaSeconds);
      context.presentation.afterStep();
    },
  }), [context, id, step]);
  return null;
}

export { useWorldPhysicsStep, useWorldPhysicsInterpolation } from '../../../simulation/physicsContext';
