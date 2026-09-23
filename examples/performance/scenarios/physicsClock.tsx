import { createRef } from 'react';

import { RigidBody, useBeforePhysicsStep, type RapierRigidBody } from '@react-three/rapier';
import { Vector3, type Group } from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider, PhysicsEntity, WorldPhysics, useWorldPhysicsInterpolation } from 'gaesup-world';

import { mountScene } from './scene';
import { checkAbort, type Scenario, type ScenarioContext } from './types';

async function physicsClock(ctx: ScenarioContext) {
  let reference: number[] | undefined;
  for (const rate of [30, 60, 144]) {
    const runtime = createGaesupRuntime();
    const actor = createRef<RapierRigidBody>();
    const probe = createRef<RapierRigidBody>();
    let visual: Group | null = null;
    let previousX = 0;
    let steps = 0;
    function Probe() {
      const ref = useWorldPhysicsInterpolation(probe);
      useBeforePhysicsStep(() => { steps++; previousX = probe.current?.translation().x ?? 0; });
      return <RigidBody ref={probe} gravityScale={0} position={[0, 13, 0]} linearVelocity={[1, 0, 0]}>
        <group ref={value => { ref.current = value!; visual = value; }}><mesh><boxGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color="#e0c85b" /></mesh></group>
      </RigidBody>;
    }
    let view: Awaited<ReturnType<typeof mountScene>> | undefined;
    try {
      await runtime.setup(); runtime.clockLoop.suspend();
      runtime.stateManager.getActiveState().position.set(0, 10, 0);
      runtime.store.getState().setPhysics({ normalGravityScale: 1, jumpGravityScale: 1, jumpSpeed: 5, linearDamping: 0, airDamping: 0 });
      view = await mountScene(ctx, [], false, <GaesupRuntimeProvider runtime={runtime}><WorldPhysics>
        <Probe />
        <RigidBody type="fixed" position={[0, 9.75, 0]}><mesh><boxGeometry args={[80, 0.5, 80]} /><meshStandardMaterial color="#506879" /></mesh></RigidBody>
        <PhysicsEntity ref={actor} name="clock-player" url="" isActive componentType="character" colliderSize={{ height: 1, radius: 0.25 }}>
          <mesh position={[0, 0.5, 0]}><capsuleGeometry args={[0.25, 0.5]} /><meshStandardMaterial color="#6cdeaf" /></mesh>
        </PhysicsEntity>
      </WorldPhysics></GaesupRuntimeProvider>);
      for (let i = 0; i < 120 && !actor.current; i++) await view.frame();
      if (!actor.current) throw new Error('WorldPhysics entity did not initialize');
      view.state.setFrameloop('never');
      view.state.camera.position.set(12, 20, 22); view.state.camera.lookAt(0, 10, 0);
      const clock = runtime.clockLoop.clock;
      clock.stepTicks(240);
      ctx.assert(`clock-landing/${rate}`, true, runtime.stateManager.getGameStates().isOnTheGround);
      const startTick = clock.tick; const startSteps = steps;
      let jumped = false;
      const off = clock.addSystem({ id: 'scripted-input', phase: 'commands', update: tick => {
        const at = tick.tick - startTick;
        runtime.inputAdapter.updateKeyboard({ forward: at < 100, space: at >= 30 && at < 40 });
      } });
      const trace: number[] = [];
      let interpolationError = 0;
      const visiblePosition = new Vector3();
      const capture = clock.addSystem({ id: 'capture', phase: 'postSimulation', update: () => {
        const p = actor.current!.translation(); trace.push(p.x, p.y, p.z);
        if (p.y > 10.3) jumped = true;
      } });
      for (let frame = 1; frame <= rate * 3; frame++) {
        checkAbort(ctx.signal); clock.advance(1 / rate); view.state.advance(frame / rate, false);
        const actual = probe.current!.translation().x;
        (visual as Group | null)?.getWorldPosition(visiblePosition);
        interpolationError = Math.max(interpolationError, Math.abs(visiblePosition.x - (previousX + (actual - previousX) * clock.interpolationAlpha)));
      }
      off(); capture();
      ctx.assert(`clock-steps/${rate}`, 180, steps - startSteps);
      ctx.assert(`clock-ticks/${rate}`, 180, clock.tick - startTick);
      ctx.assert(`clock-jump/${rate}`, true, jumped);
      const p = actor.current.translation();
      ctx.assert(`clock-motion/${rate}`, true, Math.hypot(p.x, p.z) > 1);
      ctx.assert(`clock-land-after-jump/${rate}`, true, runtime.stateManager.getGameStates().isOnTheGround);
      ctx.sample(`physics-interpolation-error-${rate}`, interpolationError, 'world', 'rendered-child-world-position-versus-fixed-tick-interpolation');
      ctx.assert(`clock-visual-interpolation/${rate}`, true, interpolationError < 0.00001);
      const error = reference ? Math.max(...trace.map((value, index) => Math.abs(value - reference![index]!))) : 0;
      ctx.sample(`physics-display-rate-error-${rate}`, error, 'world', 'same-fixed-input-all-tick-positions-real-rapier');
      ctx.assert(`clock-identical-trace/${rate}`, true, !reference || (trace.length === reference.length && error < 0.00001));
      reference ??= trace;
      await runtime.dispose();
      const stopped = steps; clock.stepTicks(10);
      ctx.assert(`clock-no-steps-after-dispose/${rate}`, stopped, steps);
      view.dispose(); view = undefined;
      // R3F defers disposal of its nested renderer root after the DOM Canvas unmount.
      for (let i = 0; i < 30 && clock.systemCount !== 1; i++) await new Promise(resolve => setTimeout(resolve, 25));
      ctx.assert(`clock-no-leases-after-unmount/${rate}`, 0, runtime.clockLoop.consumerCount);
      ctx.assert(`clock-no-systems-after-unmount/${rate}`, 1, clock.systemCount);
    } finally { view?.dispose(); await runtime.dispose(); }
  }
}

export const physicsClockScenarios: Scenario[] = [{
  id: 'world-physics-clock', title: '월드 clock 실제 물리·입력', version: 1, requirementIds: ['R26', 'R03'],
  description: '공개 WorldPhysics와 PhysicsEntity의 180 tick 전체 위치를 30·60·144Hz에서 비교하고 이동·점프·착지·종료를 검사합니다.', run: physicsClock,
}];
