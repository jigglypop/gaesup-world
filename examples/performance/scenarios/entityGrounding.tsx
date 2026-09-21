import { createRef, useEffect } from 'react';

import { Physics, RigidBody, useRapier, type RapierContext, type RapierRigidBody } from '@react-three/rapier';

import { createGaesupRuntime, GaesupRuntimeProvider, PhysicsEntity } from 'gaesup-world';

import { mountScene } from './scene';
import { checkAbort, type ScenarioContext } from './types';

/** The public entity must wire its own physics world through useEntity and the bridge. */
export async function entityGrounding(ctx: ScenarioContext) {
  const runtime = createGaesupRuntime();
  const actor = createRef<RapierRigidBody>();
  let api: RapierContext | undefined;
  let supportEnabled = true;
  let view: Awaited<ReturnType<typeof mountScene>> | undefined;
  function Ready() { const value = useRapier(); useEffect(() => { api = value; }, [value]); return null; }
  let misses = 0;
  const check = (id: string, actual: boolean) => { ctx.assert(id, true, actual); misses += Number(!actual); };
  try {
    await runtime.setup();
    runtime.store.getState().setPhysics({ normalGravityScale: 1, jumpGravityScale: 1, jumpSpeed: 5, linearDamping: 0, airDamping: 0 });
    runtime.stateManager.getActiveState().position.set(0, 10, 0);
    view = await mountScene(ctx, [], false, <GaesupRuntimeProvider runtime={runtime}>
      <Physics paused timeStep={1 / 60}>
        <Ready />
        <RigidBody type="fixed" position={[0, 9.75, 0]}>
          <mesh><boxGeometry args={[8, 0.5, 8]} /><meshStandardMaterial color="#506879" /></mesh>
        </RigidBody>
        <PhysicsEntity ref={actor} name="grounding-player" url="" isActive componentType="character" colliderSize={{ height: 1, radius: 0.25 }} groundContactFilter={() => supportEnabled}>
          <mesh position={[0, 0.5, 0]}><capsuleGeometry args={[0.25, 0.5]} /><meshStandardMaterial color="#6cdeaf" /></mesh>
        </PhysicsEntity>
      </Physics>
    </GaesupRuntimeProvider>);
    view.state.camera.position.set(7, 15, 12); view.state.camera.lookAt(0, 10.5, 0);
    for (let i = 0; i < 120 && (!api || !actor.current); i++) await view.frame();
    if (!api || !actor.current) throw new Error('Public PhysicsEntity did not initialize');
    const frames = async (count: number) => {
      for (let i = 0; i < count; i++) { checkAbort(ctx.signal); api!.step(1 / 60); await view!.frame(); }
    };
    const grounded = () => runtime.stateManager.getGameStates().isOnTheGround;
    await frames(240);
    check('public-entity-elevated-landing', grounded() && Math.abs(actor.current.translation().y - 10) < 0.05);
    check('public-entity-active-ground-state', runtime.stateManager.getActiveState().isGround);
    supportEnabled = false; await view.frame();
    check('public-entity-custom-support-filter', !grounded());
    supportEnabled = true; await view.frame();
    check('public-entity-support-filter-restored', grounded());
    runtime.inputAdapter.updateKeyboard({ space: true });
    await view.frame();
    check('public-entity-jump', actor.current.linvel().y > 4);
    check('public-entity-takeoff-clears-both-ground-states', !grounded() && !runtime.stateManager.getActiveState().isGround);
    await frames(30);
    check('public-entity-airborne', !grounded() && actor.current.translation().y > 10.3);
    await frames(120);
    check('public-entity-held-jump-does-not-repeat', grounded() && Math.abs(actor.current.linvel().y) < 0.2);
    runtime.inputAdapter.updateKeyboard({ space: false }); await view.frame();
    runtime.inputAdapter.updateKeyboard({ space: true }); await view.frame();
    check('public-entity-released-jump-can-retrigger', actor.current.linvel().y > 4);
    runtime.inputAdapter.updateKeyboard({ space: false }); await frames(150);
    actor.current.setTranslation({ x: 20, y: 10, z: 0 }, true);
    await view.frame();
    check('public-entity-teleport-clears-stale-support', !grounded());
    actor.current.setTranslation({ x: 0, y: 12, z: 0 }, true); actor.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
    await frames(120);
    check('public-entity-return-to-platform', grounded());
    ctx.sample('entity-grounding-mismatches', misses, 'count', 'public-entity-bridge-real-rapier');
  } finally { view?.dispose(); await runtime.dispose(); }
}
