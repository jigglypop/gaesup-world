import { useEffect } from 'react';

import { Physics, useRapier, type RapierContext } from '@react-three/rapier';
import { BoxGeometry, CapsuleGeometry, Group, Mesh, MeshStandardMaterial, Quaternion, Vector3 } from 'three';

import { createGaesupRuntime, EntityStateManager, PhysicsSystem, type PhysicsCalcProps, type PhysicsState } from 'gaesup-world';

import { entityGrounding } from './entityGrounding';
import { mountScene } from './scene';
import { checkAbort, type Scenario, type ScenarioContext } from './types';

async function locomotion(ctx: ScenarioContext) {
  let api: RapierContext | undefined;
  function Ready() { const value = useRapier(); useEffect(() => { api = value; }, [value]); return null; }
  const visuals = new Group();
  const view = await mountScene(ctx, [visuals], false, <Physics paused><Ready /></Physics>);
  const runtime = createGaesupRuntime(); await runtime.setup();
  const resources: { geometry: BoxGeometry | CapsuleGeometry; material: MeshStandardMaterial }[] = [];
  try {
    for (let i = 0; !api && i < 120; i++) await view.frame();
    if (!api) throw new Error('Rapier did not initialize');
    const R = api.rapier;
    const fixture = (height: number, floor: boolean, slope = 0, moving = false) => {
      const world = new R.World({ x: 0, y: floor ? -9.81 : 0, z: 0 }); world.timestep = 1 / 60;
      const manager = new EntityStateManager();
      const system = new PhysicsSystem({ ...runtime.store.getState().physics, normalGravityScale: 1, jumpGravityScale: 1, jumpSpeed: 5, linearDamping: 0, airDamping: 0 }, {}, manager, { inputAdapter: runtime.inputAdapter });
      const platform = floor ? world.createRigidBody((moving ? R.RigidBodyDesc.kinematicVelocityBased() : R.RigidBodyDesc.fixed())
        .setTranslation(0, height - 0.25, 0).setRotation(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), slope))) : null;
      if (platform) {
        world.createCollider(R.ColliderDesc.cuboid(4, 0.25, 4).setFriction(1), platform);
        if (moving) platform.setLinvel({ x: 0, y: 1, z: 0 }, true);
      }
      const body = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(0, floor ? height + 3 : height, 0).lockRotations());
      world.createCollider(R.ColliderDesc.capsule(0.25, 0.25).setFriction(1), body);
      const input = { keyboard: { ...runtime.inputAdapter.getKeyboard() }, mouse: { ...runtime.inputAdapter.getMouse(), target: new Vector3() } };
      const state: PhysicsState = { activeState: manager.getActiveState(), gameStates: manager.getGameStates(), keyboard: input.keyboard,
        mouse: input.mouse, automationOption: runtime.store.getState().automation, modeType: 'character', delta: 1 / 60 };
      const props: PhysicsCalcProps & { physicsWorld: RapierContext['world'] } = { rigidBodyRef: { current: body }, physicsWorld: world,
        state: view.state, delta: 1 / 60, worldContext: runtime.store.getState(), dispatch: () => {}, inputRef: { current: input },
        setKeyboardInput: patch => Object.assign(input.keyboard, patch), setMouseInput: patch => Object.assign(input.mouse, patch) };
      const tick = () => { checkAbort(ctx.signal); system.calculate(props, state); world.step(); };
      return { world, body, platform, state, props, system, tick, dispose: () => { system.dispose(); manager.dispose(); world.free(); } };
    };
    let mismatches = 0;
    const check = (id: string, expected: boolean, actual: boolean) => { ctx.assert(id, expected, actual); mismatches += Number(expected !== actual); };
    for (const [index, test] of [{ id: 'flat', height: 0, slope: 0 }, { id: 'elevated', height: 10, slope: 0 }, { id: 'slope-20deg', height: 3, slope: Math.PI / 9 }, { id: 'moving-platform', height: 0, slope: 0, moving: true }].entries()) {
      const f = fixture(test.height, true, test.slope, test.moving);
      const group = new Group(); group.position.x = (index - 1.5) * 7; visuals.add(group);
      const floorMesh = new Mesh(new BoxGeometry(8, 0.5, 8), new MeshStandardMaterial({ color: '#506879' }));
      const actorMesh = new Mesh(new CapsuleGeometry(0.25, 0.5), new MeshStandardMaterial({ color: '#6cdeaf' }));
      resources.push(floorMesh, actorMesh); group.add(floorMesh, actorMesh);
      try {
        for (let i = 0; i < 240; i++) {
          f.tick(); actorMesh.position.copy(f.body.translation());
          floorMesh.position.copy(f.platform!.translation()); floorMesh.quaternion.copy(f.platform!.rotation());
          if (i % 30 === 29) await view.frame();
        }
        f.system.calculate(f.props, f.state);
        check(`${test.id}-landed`, true, f.state.gameStates.isOnTheGround);
        if (test.id === 'flat' || test.id === 'elevated') {
          f.state.keyboard.space = true;
          f.system.calculate(f.props, f.state);
          check(`${test.id}-jump-impulse`, true, f.body.linvel().y > 4);
          for (let i = 0; i < 30; i++) f.tick();
          check(`${test.id}-airborne-after-jump`, false, f.state.gameStates.isOnTheGround);
          for (let i = 0; i < 120; i++) f.tick();
          check(`${test.id}-landed-again`, true, f.state.gameStates.isOnTheGround);
          f.state.keyboard.space = false; f.system.calculate(f.props, f.state);
          f.body.setTranslation({ x: 100, y: f.body.translation().y, z: 0 }, true);
          f.system.calculate(f.props, f.state);
          check(`${test.id}-teleported-off-support`, false, f.state.gameStates.isOnTheGround);
        }
        actorMesh.material.color.set(f.state.gameStates.isOnTheGround ? '#6cdeaf' : '#eab97d');
      } finally { f.dispose(); }
    }
    for (const height of [0.5, 10]) {
      const f = fixture(height, false);
      try { for (let i = 0; i < 8; i++) f.tick(); check(`unsupported-at-${height}`, false, f.state.gameStates.isOnTheGround); }
      finally { f.dispose(); }
    }
    ctx.sample('grounding-mismatches', mismatches, 'count', 'fixed-step-rapier-grounding');
    await view.frame();
  } finally {
    view.dispose(); resources.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); }); await runtime.dispose();
  }
}

export const locomotionScenarios: Scenario[] = [
  { id: 'locomotion', title: '접지·고지대·경사·점프', description: '실제 Rapier world를 고정 간격으로 진행하고 PhysicsSystem의 평지·고지대·경사·움직이는 발판·점프·공중 판정을 검사합니다.', version: 1, run: locomotion },
  { id: 'entity-grounding', title: '공개 캐릭터 접지·점프', description: 'PhysicsEntity → useEntity → PhysicsBridge의 실제 연결에서 고지대 착지, 접촉 정책, 점프, 입력 유지·재입력, 순간이동을 검사합니다.', version: 2, run: entityGrounding },
];
