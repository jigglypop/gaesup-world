import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import * as THREE from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider, useWorldObjectStore, WorldBridge } from 'gaesup-world';
import { useSpawnFromBlueprint, WARRIOR_BLUEPRINT } from 'gaesup-world/blueprints';

import { mountScene } from './scene';
import type { Scenario, ScenarioContext } from './types';

const object = (id: string, x: number) => ({ id, type: 'test', position: new THREE.Vector3(x, 0, 0), rotation: new THREE.Euler(), scale: new THREE.Vector3(1, 1, 1) });

async function worldObjects(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const bridge = (runtime: typeof a) => runtime.worldBridge;
  const id = (runtime: typeof a) => runtime.worldId;
  const hooks: Partial<Record<'a' | 'b', ReturnType<typeof useSpawnFromBlueprint>>> = {};
  const root = createRoot(ctx.host);
  const metric = (key: string, count: number) => { ctx.sample(key, count, 'count', 'real-world-bridge-blueprint-hook-two-providers'); ctx.assert(key, 0, count); };
  function Consumer({ owner }: { owner: 'a' | 'b' }) {
    hooks[owner] = useSpawnFromBlueprint(); const count = useWorldObjectStore(state => state.objects.length);
    return <p>월드 {owner}: 객체 {count}개, 최근 생성 {hooks[owner]?.lastSpawnedEntity?.id ?? '없음'}</p>;
  }
  try {
    await a.setup(); await b.setup();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer owner="a" /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer owner="b" /></GaesupRuntimeProvider></>));
    const sa = await hooks.a!.spawnEntity(WARRIOR_BLUEPRINT.id, { position: [1, 0, 0] });
    const sb = await hooks.b!.spawnEntity(WARRIOR_BLUEPRINT.id, { position: [9, 0, 0] });
    metric('blueprint-owned-spawn-mismatches', Number(!sa) + Number(!sb));
    metric('blueprint-cross-world-leaks', Number(Boolean(sa && bridge(b).getEngine(id(b))?.system.getObject(sa.id))) + Number(Boolean(sb && bridge(a).getEngine(id(a))?.system.getObject(sb.id))));
    bridge(a).addObject(id(a), object('lab-shared', 1)); bridge(b).addObject(id(b), object('lab-shared', 9));
    metric('world-object-identity-leaks', Number(bridge(a).getEngine(id(a))?.system.getObject('lab-shared')?.position.x !== 1));
    const old = bridge(a);
    await a.dispose();
    metric('world-object-engines-after-dispose', Number(Boolean(old.getEngine(id(a)))));
    const stopped = await hooks.a!.spawnEntity(WARRIOR_BLUEPRINT.id);
    metric('blueprint-spawns-after-dispose', Number(stopped !== null));
    metric('world-object-other-world-loss', Number(!sb || !bridge(b).getEngine(id(b))?.system.getObject(sb.id)));
    await a.setup();
    const restarted = await hooks.a!.spawnEntity(WARRIOR_BLUEPRINT.id);
    metric('blueprint-restart-mismatches', Number(!restarted || !bridge(a).getEngine(id(a))?.system.getObject(restarted.id)));
  } finally {
    flushSync(() => root.unmount()); await a.dispose(); await b.dispose();
  }
}

async function worldSnapshot(ctx: ScenarioContext) {
  const bridge = new WorldBridge(); const now = Date.now;
  Date.now = () => 100000;
  try {
    bridge.register('a'); bridge.register('b');
    const initial = bridge.snapshot('a');
    bridge.addObject('a', object('one', 1));
    const after = bridge.snapshot('a');
    bridge.selectObject('a', 'one');
    const selected = bridge.snapshot('a');
    bridge.addObject('b', object('two', 2));
    const stale = Number(after?.objects.length !== 1) + Number(selected?.selectedObjectId !== 'one');
    ctx.sample('world-stale-command-snapshots', stale, 'count', 'same-millisecond-world-commands'); ctx.assert('world-stale-command-snapshots', 0, stale);
    ctx.assert('snapshot-object-separation', true, initial !== after);
    ctx.assert('snapshot-world-separation', 'two', bridge.snapshot('b')?.objects[0]?.id ?? 'missing');
    bridge.unregister('a'); bridge.register('a');
    ctx.assert('snapshot-generation-is-empty', 0, bridge.snapshot('a')?.objects.length ?? -1);
    ctx.host.textContent = `동일 밀리초의 연속 명령: 오래된 snapshot ${stale}개`;
  } finally { Date.now = now; bridge.dispose(); }
}

async function worldViewPicking(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  const hooks: Partial<Record<'a' | 'b', ReturnType<typeof useSpawnFromBlueprint>>> = {};
  function Consumer({ owner }: { owner: 'a' | 'b' }) { hooks[owner] = useSpawnFromBlueprint(); return null; }
  const plane = (x: number) => { const mesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), new THREE.MeshBasicMaterial({ color: x === 10 ? '#83bb91' : '#4c88be' })); mesh.position.x = x; return mesh; };
  const pa = plane(10); const pb = plane(30);
  type Mounted = Awaited<ReturnType<typeof mountScene>>;
  let left: Mounted | undefined; let right: Mounted | undefined;
  const releases: Array<() => void> = [];
  const camera = (mounted: Mounted, x: number) => {
    const value = mounted.state.camera as THREE.PerspectiveCamera;
    value.position.set(x, 0, 5); value.lookAt(x, 0, 0); value.fov = 90; value.updateProjectionMatrix();
    return value;
  };
  const metric = (key: string, count: number) => { ctx.sample(key, count, 'count', 'native-canvases-real-raycast-world-view-ports'); ctx.assert(key, 0, count); };
  try {
    await a.setup(); await b.setup(); const small = { ...ctx, config: { ...ctx.config, width: 300, height: 300 } };
    left = await mountScene(small, [pa], false, <GaesupRuntimeProvider runtime={a}><Consumer owner="a" /></GaesupRuntimeProvider>);
    right = await mountScene(small, [pb], false, <GaesupRuntimeProvider runtime={b}><Consumer owner="b" /></GaesupRuntimeProvider>);
    releases.push(a.worldViews.register({ camera: camera(left, 10), scene: left.state.scene, surface: left.state.gl.domElement, pointer: { x: 0.4, y: 0 } }));
    releases.push(b.worldViews.register({ camera: camera(right, 30), scene: right.state.scene, surface: right.state.gl.domElement, pointer: { x: -0.4, y: 0 } }));
    await left.frame(); await right.frame();
    const sa = await hooks.a!.spawnAtCursor(WARRIOR_BLUEPRINT.id); const sb = await hooks.b!.spawnAtCursor(WARRIOR_BLUEPRINT.id);
    metric('world-cursor-position-mismatches', Number(Math.abs((sa?.position[0] ?? 0) - 12) > 0.001) + Number(Math.abs((sb?.position[0] ?? 0) - 28) > 0.001));
    const overlay = document.createElement('button'); overlay.textContent = 'A 보조 시점'; ctx.host.append(overlay);
    const alternate = { camera: right.state.camera, scene: right.state.scene, surface: overlay };
    releases.push(a.worldViews.register(alternate));
    left.state.gl.domElement.dispatchEvent(new Event('pointerdown'));
    const focused = await hooks.a!.spawnAtCursor(WARRIOR_BLUEPRINT.id);
    metric('world-focused-view-mismatches', Number(Math.abs((focused?.position[0] ?? 0) - 12) > 0.001));
    overlay.remove();
    await a.dispose(); metric('world-views-after-dispose', Number(a.worldViews.current() !== null));
    metric('world-other-view-after-dispose', Number(b.worldViews.current() === null));
    await a.setup(); const restarted = await hooks.a!.spawnAtCursor(WARRIOR_BLUEPRINT.id);
    metric('world-view-restart-mismatches', Number(Math.abs((restarted?.position[0] ?? 0) - 12) > 0.001));
    ctx.assert('world-A-picked-X', 12, Math.round((sa?.position[0] ?? 0) * 1e6) / 1e6);
    ctx.assert('world-B-picked-X', 28, Math.round((sb?.position[0] ?? 0) * 1e6) / 1e6);
  } finally {
    releases.forEach(release => release()); left?.dispose(); right?.dispose();
    pa.geometry.dispose(); pa.material.dispose(); pb.geometry.dispose(); pb.material.dispose();
    await a.dispose(); await b.dispose();
  }
}

export const worldObjectScenarios: Scenario[] = [
  { id: 'world-objects', title: '월드 객체·블루프린트 소유권', description: '두 Provider의 실제 블루프린트 생성과 같은 객체 ID, 종료/재시작을 검사합니다.', version: 1, requirementIds: ['R25'], run: worldObjects },
  { id: 'world-snapshot', title: '월드 명령 직후 snapshot', description: '같은 밀리초의 생성·선택 명령이 snapshot에 즉시 반영되는지 검사합니다.', version: 1, requirementIds: ['R25', 'R27'], run: worldSnapshot },
  { id: 'world-view-picking', title: '월드 카메라·커서 생성', description: '두 실제 canvas의 카메라·커서로 생성 좌표를 계산하고 같은 월드의 활성 화면 전환과 종료/재시작을 검사합니다.', version: 1, requirementIds: ['R25', 'R13'], run: worldViewPicking },
];
