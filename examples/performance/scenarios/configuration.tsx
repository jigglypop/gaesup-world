import type { ThreeEvent } from '@react-three/fiber';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

import { createGaesupRuntime, GaesupWorld, GaesupRuntimeProvider, useGaesupStore, useStateSystem, useInputBackend, useClicker } from 'gaesup-world';
import { useNavigationSystem, useClickNavigationRoute } from 'gaesup-world/navigation';

import { nextFrame, type Scenario, type ScenarioContext } from './types';

async function worldConfiguration(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const saved = useGaesupStore.getState();
  const root = createRoot(ctx.host);
  const views: Record<string, { url: string | undefined; fov: number | undefined; x: number | undefined; add: (x: number) => void }> = {};
  function Consumer({ id }: { id: string }) {
    const url = useGaesupStore(state => state.urls.characterUrl);
    const fov = useGaesupStore(state => state.cameraOption.fov);
    const x = useGaesupStore(state => state.tiles.get('shared-id')?.position[0]);
    const addTile = useGaesupStore(state => state.addTile);
    views[id] = { url, fov, x, add: value => addTile({ id: 'shared-id', position: [value, 0, 0] }) };
    return <p>월드 {id}: URL {url}, FOV {fov}, 객체 X {x}</p>;
  }
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<>
      <GaesupWorld runtime={a} urls={{ character: 'world-a.glb' }} cameraOption={{ type: 'thirdPerson', fov: 45 }}><Consumer id="A" /></GaesupWorld>
      <GaesupWorld runtime={b} urls={{ character: 'world-b.glb' }} cameraOption={{ type: 'thirdPerson', fov: 80 }}><Consumer id="B" /></GaesupWorld>
    </>));
    flushSync(() => { views['A']!.add(1); views['B']!.add(9); });
    for (let i = 0; i < 3; i++) await nextFrame(ctx.signal);
    ctx.assert('A-asset-url', 'world-a.glb', views['A']!.url ?? 'missing');
    ctx.assert('B-asset-url', 'world-b.glb', views['B']!.url ?? 'missing');
    ctx.assert('A-camera-fov', 45, views['A']!.fov ?? -1);
    ctx.assert('B-camera-fov', 80, views['B']!.fov ?? -1);
    ctx.assert('A-same-id-entity', 1, views['A']!.x ?? -1);
    ctx.assert('B-same-id-entity', 9, views['B']!.x ?? -1);
    ctx.sample('configuration-mismatches', Number(views['A']!.url !== 'world-a.glb') + Number(views['B']!.url !== 'world-b.glb')
      + Number(views['A']!.fov !== 45) + Number(views['B']!.fov !== 80), 'count', 'two-real-world-config-providers');
    ctx.sample('entity-mismatches', Number(views['A']!.x !== 1) + Number(views['B']!.x !== 9), 'count', 'same-id-different-world-position');
    await a.dispose();
    flushSync(() => views['B']!.add(12));
    ctx.assert('B-entity-after-A-dispose', 12, views['B']!.x ?? -1);
    ctx.assert('A-entity-stays-independent', 1, views['A']!.x ?? -1);
  } finally {
    flushSync(() => root.unmount()); await a.dispose(); await b.dispose();
    useGaesupStore.setState(saved, true);
  }
}

export const configurationScenarios: Scenario[] = [
  { id: 'world-configuration', title: '두 월드의 객체·카메라·URL', description: '실제 GaesupWorld 두 개에서 같은 ID의 객체와 서로 다른 카메라·에셋 설정을 검사합니다.', version: 1, requirementIds: ['R25'], run: worldConfiguration },
  { id: 'world-input-state', title: '두 월드의 입력·플레이어 상태', description: '실제 공개 훅으로 한 월드의 이동 입력과 점프 상태를 바꾸고 다른 월드의 값을 검사합니다.', version: 1, requirementIds: ['R25'], run: worldInputState },
  { id: 'world-navigation', title: '두 월드의 장애물·클릭 경로', description: '서로 다른 장애물을 가진 실제 내비게이션과 useClicker를 연결해 경로·중단·개별 종료를 확인합니다.', version: 1, requirementIds: ['R25'], run: worldNavigation },
  { id: 'world-interactions', title: '두 월드의 입력 명령·자동 이동', description: '공개 store 명령으로 서로 다른 목표로 이동하고, 한 월드 종료·재시작 후 다른 월드의 입력과 자동화가 유지되는지 검사합니다.', version: 1, requirementIds: ['R25'], run: worldInteractions },
];

async function worldInteractions(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const legacyForward = useGaesupStore.getState().interaction.keyboard.forward;
  try {
    await a.setup(); await b.setup();
    a.store.getState().updateKeyboard({ forward: true });
    const inputLeaks = Number(b.inputAdapter.getKeyboard().forward) + Number(useGaesupStore.getState().interaction.keyboard.forward !== legacyForward);
    a.store.getState().addAutomationAction({ type: 'move', target: new THREE.Vector3(3, 0, 0) });
    b.store.getState().addAutomationAction({ type: 'move', target: new THREE.Vector3(9, 0, 0) });
    a.store.getState().startAutomation(); b.store.getState().startAutomation();
    ctx.assert('A-store-command-reaches-input', true, a.inputAdapter.getKeyboard().forward);
    ctx.assert('A-move-target', 3, a.inputAdapter.getMouse().target.x);
    ctx.assert('B-move-target', 9, b.inputAdapter.getMouse().target.x);
    await a.dispose();
    ctx.assert('A-movement-stopped-on-dispose', false, a.inputAdapter.getMouse().isActive);
    ctx.assert('B-movement-survives-A-dispose', true, b.inputAdapter.getMouse().isActive);
    ctx.assert('B-automation-survives-A-dispose', true, b.store.getState().automation.queue.isRunning);
    await a.setup();
    a.store.getState().updateKeyboard({ forward: false });
    ctx.assert('A-input-subscription-restored', false, a.store.getState().interaction.keyboard.forward);
    a.store.getState().addAutomationAction({ type: 'move', target: new THREE.Vector3(5, 0, 0) });
    a.store.getState().startAutomation();
    ctx.assert('A-movement-restarts', 5, a.inputAdapter.getMouse().target.x);
    ctx.assert('B-target-survives-A-restart', 9, b.inputAdapter.getMouse().target.x);
    ctx.sample('store-input-leaks', inputLeaks, 'count', 'public-store-commands');
    ctx.sample('automation-state-leaks', Number(b.inputAdapter.getMouse().target.x !== 9) + Number(!b.inputAdapter.getMouse().isActive), 'count', 'owned-automation-move-dispose-restart');
    ctx.host.textContent = `월드 A: 재시작 후 목표 ${a.inputAdapter.getMouse().target.x}, 월드 B: 목표 ${b.inputAdapter.getMouse().target.x} 유지. 입력 오염 ${inputLeaks}`;
  } finally { await a.dispose(); await b.dispose(); }
}

async function worldNavigation(ctx: ScenarioContext) {
  const navigation = { cellSize: 1, worldMinX: -10, worldMinZ: -10, worldMaxX: 10, worldMaxZ: 10 };
  const a = createGaesupRuntime({ navigation }); const b = createGaesupRuntime({ navigation });
  const root = createRoot(ctx.host);
  const views: Record<string, { navigation: ReturnType<typeof useNavigationSystem>; route: ReturnType<typeof useClickNavigationRoute>; clicker: ReturnType<typeof useClicker> }> = {};
  function Consumer({ id }: { id: string }) {
    views[id] = { navigation: useNavigationSystem(), route: useClickNavigationRoute(), clicker: useClicker({ agentRadius: 0.2 }) };
    return <p>월드 {id}: 독립 내비게이션</p>;
  }
  const pathText = (id: string) => views[id]!.route.getClickNavigationRoute().map(point => point.toArray().join(',')).join(';');
  try {
    await a.setup(); await b.setup(); await Promise.all([a.navigation.init(), b.navigation.init()]);
    a.stateManager.getActiveState().position.set(-5, 0.5, 0);
    b.stateManager.getActiveState().position.set(-5, 0.5, 0);
    a.navigation.setBlocked(0, 0, 3, 4);
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>));
    ctx.assert('A-hook-uses-owned-navigation', true, views['A']!.navigation === a.navigation);
    ctx.assert('B-hook-uses-owned-navigation', true, views['B']!.navigation === b.navigation);
    ctx.assert('A-blocked-center', false, views['A']!.navigation.isWalkable(0, 0));
    ctx.assert('B-clear-center', true, views['B']!.navigation.isWalkable(0, 0));
    views['A']!.clicker.onClick({ point: new THREE.Vector3(5, 0, 0) } as ThreeEvent<MouseEvent>);
    await nextFrame(ctx.signal);
    const aPath = pathText('A');
    views['B']!.clicker.onClick({ point: new THREE.Vector3(5, 0, 0) } as ThreeEvent<MouseEvent>);
    await nextFrame(ctx.signal);
    const bPath = pathText('B');
    ctx.assert('A-has-detour', true, views['A']!.route.getClickNavigationRoute().length > 1);
    ctx.assert('B-direct-path', 1, views['B']!.route.getClickNavigationRoute().length);
    ctx.assert('A-path-survives-B-click', aPath, pathText('A'));
    views['A']!.clicker.stopClicker();
    ctx.assert('A-stop-keeps-B-route', bPath, pathText('B'));
    await a.dispose();
    ctx.assert('A-dispose-keeps-B-route', bPath, pathText('B'));
    ctx.assert('B-input-remains-active', true, b.inputAdapter.getMouse().isActive);
    ctx.assert('B-query-after-A-dispose', true, b.navigation.findPath(-5, 0, 5, 0).length > 0);
    ctx.sample('navigation-state-leaks', Number(!b.navigation.isWalkable(0, 0)), 'count', 'two-owned-navigation-grids');
    ctx.sample('route-state-leaks', Number(pathText('B') !== bPath) + Number(!bPath), 'count', 'real-useClicker-stop-and-dispose');
    ctx.sample('A-detour-waypoints', aPath.split(';').filter(Boolean).length, 'count', 'real-useClicker');
    ctx.sample('B-direct-waypoints', b.clickNavigation.getClickNavigationRoute().length, 'count', 'real-useClicker');
  } finally { flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); }
}

async function worldInputState(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); const root = createRoot(ctx.host);
  const views: Record<string, { state: ReturnType<typeof useStateSystem>; input: ReturnType<typeof useInputBackend> }> = {};
  function Consumer({ id }: { id: string }) {
    const state = useStateSystem(); const input = useInputBackend(); views[id] = { state, input };
    return <p>월드 {id}: 점프 {String(state.gameStates.isJumping)}</p>;
  }
  let originalJump = false; let originalForward = false;
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" /></GaesupRuntimeProvider></>));
    originalJump = views['A']!.state.gameStates.isJumping; originalForward = views['A']!.input.getKeyboard().forward;
    flushSync(() => {
      views['B']!.state.updateGameStates({ isJumping: false }); views['B']!.input.updateKeyboard({ forward: false });
      views['A']!.state.updateGameStates({ isJumping: true }); views['A']!.input.updateKeyboard({ forward: true });
    });
    ctx.assert('A-jumping', true, views['A']!.state.gameStates.isJumping);
    ctx.assert('B-not-jumping', false, views['B']!.state.gameStates.isJumping);
    ctx.assert('A-forward', true, views['A']!.input.getKeyboard().forward);
    ctx.assert('B-not-forward', false, views['B']!.input.getKeyboard().forward);
    ctx.sample('actor-state-leaks', Number(views['B']!.state.gameStates.isJumping), 'count', 'two-public-state-system-hooks');
    ctx.sample('input-state-leaks', Number(views['B']!.input.getKeyboard().forward), 'count', 'two-public-input-backends');
  } finally {
    if (views['A']) flushSync(() => { views['A']!.state.updateGameStates({ isJumping: originalJump }); views['A']!.input.updateKeyboard({ forward: originalForward }); });
    flushSync(() => root.unmount()); await a.dispose(); await b.dispose();
  }
}
