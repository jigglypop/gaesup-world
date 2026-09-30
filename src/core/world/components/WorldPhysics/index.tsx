import { useEffect, useId, useMemo, useRef } from 'react';

import { useThree } from '@react-three/fiber';
import { Physics, useRapier, type PhysicsProps } from '@react-three/rapier';

import { useEngineFrame } from '../../../runtime/frame';
import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../../runtime/runtimeContext';
import type { ClockFrameDriver } from '../../../simulation/AnimationClockLoop';
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
  const frameloop = useThree(state => state.frameloop);
  const running = useRef(false);
  const driver = useRef<ClockFrameDriver | null>(null);
  running.current = !paused && (!runtime || runtime.isActive());
  const context = useMemo<WorldPhysicsClock>(() => ({
    clock: loop.clock, getState, isRunning: () => running.current && (!runtime || runtime.isActive()), presentation: new PhysicsPresentation(),
  }), [loop, getState, runtime]);

  useEffect(() => {
    if (!running.current) return;
    return loop.acquire();
  }, [loop, paused, runtime, revision]);

  // A canvas that renders every frame advances the fixed clock itself: input and controls, then fixed ticks at the
  // end of prePhysics, then presentation first in postPhysics, so cameras and effects see this frame's poses.
  // Demand-rendered canvases keep the loop's own animation frame so simulation time never waits for a render.
  useEffect(() => {
    if (frameloop !== 'always') return;
    const attached = loop.attachDriver();
    driver.current = attached;
    return () => {
      attached.release();
      if (driver.current === attached) driver.current = null;
    };
  }, [loop, frameloop]);
  useEngineFrame('prePhysics', delta => driver.current?.advance(delta), { order: Number.MAX_SAFE_INTEGER, label: 'physics:advance' });
  useEngineFrame('postPhysics', () => context.presentation.present(interpolate && context.isRunning() ? loop.clock.interpolationAlpha : 1),
    { order: Number.MIN_SAFE_INTEGER, label: 'physics:present' });

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
