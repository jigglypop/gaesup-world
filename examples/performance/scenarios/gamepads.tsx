import { useRef } from 'react';

import { Physics, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider, WorldInputSurface, useKeyboard, useInteractionKey, usePhysicsBridge, useCamera } from 'gaesup-world';

import { mountScene } from './scene';
import { nextFrame, type Scenario, type ScenarioContext } from './types';

function controlledGamepad(ctx: ScenarioContext) {
  const descriptor = Object.getOwnPropertyDescriptor(navigator, 'getGamepads'); let reads = 0;
  const pad = { id: 'performance-lab-controlled-standard', index: 1, connected: true, mapping: 'standard', axes: [0, 0, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, touched: false, value: 0 })), timestamp: 0 };
  let connected = true;
  ctx.unavailable('physical-gamepad-validation', 'count', 'usb-bluetooth-device', '브라우저 getGamepads 입력을 제어한 재현입니다. 실제 USB/Bluetooth 장치는 검증하지 않았습니다.');
  Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => { reads++; return [null, connected ? pad : null]; } });
  return { pad, reads: () => reads, button: (index: number, down: boolean) => { Object.assign(pad.buttons[index]!, { pressed: down, touched: down, value: Number(down) }); },
    connect: (value: boolean) => { connected = value; window.dispatchEvent(new Event(value ? 'gamepadconnected' : 'gamepaddisconnected')); },
    restore: () => { if (descriptor) Object.defineProperty(navigator, 'getGamepads', descriptor); else Reflect.deleteProperty(navigator, 'getGamepads'); },
  };
}
const metric = (ctx: ScenarioContext, name: string, actual: number, expected = 0) => { ctx.sample(name, actual, 'count', 'controlled-browser-gamepad-api-real-world-consumers'); ctx.assert(name, expected, actual); };

async function routing(ctx: ScenarioContext) {
  const hardware = controlledGamepad(ctx); const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host);
  let hitsA = 0; let hitsB = 0;
  const frames = async (count = 3) => { for (let i = 0; i < count; i++) await nextFrame(ctx.signal); };
  function Controls({ name }: { name: string }) { useKeyboard(); useInteractionKey(); return <WorldInputSurface data-gamepad-world={name}>월드 {name} 입력 영역</WorldInputSurface>; }
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Controls name="a" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Controls name="b" /></GaesupRuntimeProvider></>));
    for (const [runtime, onActivate] of [[a, () => { hitsA++; }], [b, () => { hitsB++; }]] as const) {
      runtime.store.getState().setMode({ controller: 'gamepad' });
      runtime.interactablesStore.getState().register({ id: 'same', kind: 'misc', label: 'same', key: 'e', position: new THREE.Vector3(), range: 2, onActivate });
      runtime.interactablesStore.getState().setCurrent({ id: 'same', label: 'same', key: 'e', distance: 0 });
    }
    const surfaceA = ctx.host.querySelector<HTMLElement>('[data-gamepad-world="a"]')!; const surfaceB = ctx.host.querySelector<HTMLElement>('[data-gamepad-world="b"]')!;
    surfaceA.focus(); hardware.connect(true); await frames();
    metric(ctx, 'gamepad-connection-misses', Number(!a.inputAdapter.getGamepad?.().connected));
    hardware.pad.axes[0] = 0.05; hardware.pad.axes[1] = 0.05; await frames();
    metric(ctx, 'gamepad-deadzone-leaks', Number((a.inputAdapter.getGamepad?.().leftStick.lengthSq() ?? 0) > 0));
    hardware.pad.axes[0] = 0.7; hardware.pad.axes[1] = 0; hardware.button(3, true); await frames();
    metric(ctx, 'gamepad-movement-misses', Number((a.inputAdapter.getGamepad?.().leftStick.x ?? 0) < 0.5));
    metric(ctx, 'gamepad-action-mismatches', Number(hitsA !== 1) + Number(hitsB !== 0));
    surfaceB.focus(); await frames(); metric(ctx, 'gamepad-focus-held-action-leaks', hitsB);
    metric(ctx, 'gamepad-old-world-held-inputs', Number((a.inputAdapter.getGamepad?.().leftStick.lengthSq() ?? 0) > 0) + Number(a.inputAdapter.getKeyboard().keyE));
    hardware.button(3, false); hardware.pad.axes[0] = 0; await frames(); hardware.button(3, true); await frames();
    metric(ctx, 'gamepad-focused-world-action-misses', Number(hitsB !== 1)); hardware.button(3, false); await frames();
    const countBefore = hardware.reads(); await frames(10); metric(ctx, 'gamepad-polls-per-frame', (hardware.reads() - countBefore) / 10, 1);
    let publications = 0; const off = b.inputAdapter.subscribe?.(() => { publications++; }); publications = 0; await frames(10); off?.();
    metric(ctx, 'gamepad-unchanged-publications', publications);
    surfaceB.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
    hardware.button(0, true); await frames(); hardware.button(0, false); await frames();
    metric(ctx, 'gamepad-keyboard-release-conflicts', Number(!b.inputAdapter.getKeyboard().space));
    surfaceB.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space', bubbles: true, cancelable: true }));
    hardware.pad.axes[1] = -1; await frames(); hardware.connect(false); await frames();
    metric(ctx, 'gamepad-disconnect-state-leaks', Number(b.inputAdapter.getGamepad?.().connected) + Number((b.inputAdapter.getGamepad?.().leftStick.lengthSq() ?? 0) > 0));
    await a.dispose(); await b.dispose(); const stopped = hardware.reads(); await frames(3);
    metric(ctx, 'gamepad-polls-after-dispose', hardware.reads() - stopped);
  } finally { flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); hardware.restore(); }
}

async function motion(ctx: ScenarioContext) {
  const hardware = controlledGamepad(ctx); const runtime = createGaesupRuntime(); let scene: Awaited<ReturnType<typeof mountScene>> | undefined;
  let body: RapierRigidBody | null = null; let readYaw = () => 0;
  function Actor() {
    const { world } = useRapier();
    const ref = useRef<RapierRigidBody>(null!); usePhysicsBridge({ entityId: 'gamepad-player', rigidBodyRef: ref, physicsWorld: world }); const { system } = useCamera(); readYaw = () => system?.getState().config.orbitYaw ?? 0;
    return <RigidBody ref={value => { ref.current = value!; body = value; }} colliders="cuboid" enabledRotations={[false, false, false]} gravityScale={0} position={[0, 1, 0]}>
      <mesh><boxGeometry /><meshStandardMaterial color="#4fc7bd" /></mesh>
    </RigidBody>;
  }
  const frames = async (count = 6) => { for (let i = 0; i < count; i++) await scene!.frame(); };
  try {
    await runtime.setup(); runtime.store.getState().setMode({ controller: 'gamepad' });
    scene = await mountScene(ctx, [], false, <GaesupRuntimeProvider runtime={runtime}><Physics gravity={[0, 0, 0]}><Actor /></Physics></GaesupRuntimeProvider>);
    runtime.inputScope.activate(); hardware.connect(true); await frames();
    hardware.pad.axes[1] = -0.575; await frames();
    const low = (body as RapierRigidBody | null)?.linvel(); const lowSpeed = low ? Math.hypot(low.x, low.z) : 0;
    hardware.pad.axes[1] = -1; await frames();
    const high = (body as RapierRigidBody | null)?.linvel(); const highSpeed = high ? Math.hypot(high.x, high.z) : 0;
    metric(ctx, 'gamepad-analog-motion-misses', Number(lowSpeed <= 0.05) + Number(highSpeed <= lowSpeed * 1.5));
    ctx.sample('gamepad-half-stick-speed', lowSpeed, 'world/s', 'controlled-gamepad-real-rapier-player'); ctx.sample('gamepad-full-stick-speed', highSpeed, 'world/s', 'controlled-gamepad-real-rapier-player');
    hardware.pad.axes[1] = 0; await frames(); const cameraBefore = scene.state.camera.position.clone(); const yawBefore = readYaw();
    hardware.pad.axes[2] = 1; await frames(20); metric(ctx, 'gamepad-camera-orbit-misses', Number(scene.state.camera.position.distanceTo(cameraBefore) < 0.05 || Math.abs(readYaw() - yawBefore) < 0.01));
    hardware.pad.axes[2] = 0; await runtime.dispose(); const stopped = runtime.inputAdapter.getGamepad?.();
    metric(ctx, 'gamepad-motion-dispose-leaks', Number(stopped?.connected) + Number((stopped?.leftStick.lengthSq() ?? 0) > 0));
  } finally { scene?.dispose(); await runtime.dispose(); hardware.restore(); }
}

export const gamepadScenarios: Scenario[] = [
  { id: 'hardware-gamepad-routing', title: '게임패드 폴링·월드 포커스', description: 'getGamepads 스냅샷을 제어해 표준 매핑·포커스·중복 폴링·키보드 혼합·연결 해제를 검사합니다. 실제 USB/Bluetooth 장치 검사는 아닙니다.', version: 1, run: routing },
  { id: 'gamepad-motion-scene', title: '게임패드 실제 물리·카메라', description: '제어된 게임패드 입력을 실제 PhysicsBridge·Rapier·카메라에 전달하고 아날로그 속도와 시점 이동을 측정합니다.', version: 1, run: motion },
];
