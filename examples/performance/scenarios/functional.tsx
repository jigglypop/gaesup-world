import 'reflect-metadata';
import { Component, type ReactNode } from 'react';

import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Box3, BoxGeometry, Euler, Mesh, MeshStandardMaterial, Scene, Vector3 } from 'three';

import { getAudioEngine, cameraUtils, invalidateCollisionCache, useInventory, useTimeOfDay } from 'gaesup-world';
import { MaterialManager } from 'gaesup-world/building';
import { MessageQueue } from 'gaesup-world/network';
import { NextWorld } from 'gaesup-world/next';
import { PluginRegistry } from 'gaesup-world/plugins';
import { SaveSystem, WorldSystem, type WorldObject } from 'gaesup-world/runtime';

import { mountScene } from './scene';
import { nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';

class ProbeBoundary extends Component<{ children: ReactNode; onError: () => void }, { error: boolean }> {
  override state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  override componentDidCatch() { this.props.onError(); }
  override render() { return this.state.error ? <p>반복 렌더링 감지 — 이 재현 영역을 중지했습니다.</p> : this.props.children; }
}

async function hooks(ctx: ScenarioContext) {
  const counts = { time: 0, inventory: 0, errors: 0, warnings: 0 };
  const originalError = console.error;
  console.error = (...args: unknown[]) => {
    if (args.some((arg) => typeof arg === 'string' && arg.includes('getSnapshot'))) counts.warnings++;
    originalError(...args);
  };
  function Time() {
    if (++counts.time > 16) throw new Error('Time selector render limit');
    const value = useTimeOfDay();
    return <p>시간 훅: {value.hour}:{value.minute}</p>;
  }
  function Inventory() {
    if (++counts.inventory > 16) throw new Error('Inventory selector render limit');
    useInventory();
    return <p>인벤토리 훅 구독 중</p>;
  }
  const root = createRoot(ctx.host);
  const onError = () => { counts.errors++; };
  try {
    root.render(<><ProbeBoundary onError={onError}><Time /></ProbeBoundary><ProbeBoundary onError={onError}><Inventory /></ProbeBoundary></>);
    for (let i = 0; i < 5; i++) await nextFrame(ctx.signal);
    const before = counts.time + counts.inventory;
    for (let i = 0; i < 5; i++) await nextFrame(ctx.signal);
    ctx.assert('render-loop-errors', 0, counts.errors);
    ctx.assert('snapshot-warnings', 0, counts.warnings);
    ctx.assert('stable-extra-renders', 0, counts.time + counts.inventory - before);
    ctx.sample('time-renders', counts.time, 'count', 'guarded-hook-mount');
    ctx.sample('inventory-renders', counts.inventory, 'count', 'guarded-hook-mount');
  } finally { flushSync(() => root.unmount()); console.error = originalError; }
}

async function saveTransaction(ctx: ScenarioContext) {
  let first = 'original';
  let second = 'original';
  const system = new SaveSystem({ adapter: {
    read: async () => null, write: async () => undefined, list: async () => [], remove: async () => undefined,
  } });
  system.register({ key: 'first', serialize: () => first, hydrate: (value) => { first = String(value); } });
  system.register({ key: 'second', serialize: () => second, hydrate: (value) => {
    if (value === 'fail') throw new Error('Injected domain failure');
    second = String(value);
  } });
  let failed = false;
  try { system.hydrateBlob({ version: 1, savedAt: 0, domains: { first: 'changed', second: 'fail' } }); }
  catch { failed = true; }
  ctx.assert('restore-rejected', true, failed);
  ctx.assert('first-domain-unchanged', 'original', first);
  ctx.assert('second-domain-unchanged', 'original', second);
  ctx.sample('partially-applied-domains', Number(first !== 'original') + Number(second !== 'original'), 'count', 'failed-transaction');
  ctx.host.textContent = `실패 후 상태: first=${first}, second=${second}`;
}

function object(id: string, x: number, z: number, radius = 1): WorldObject {
  return {
    id, type: 'block', position: new Vector3(x, 0, z), rotation: new Euler(), scale: new Vector3(1, 1, 1),
    boundingBox: new Box3(new Vector3(x - radius, -radius, z - radius), new Vector3(x + radius, radius, z + radius)),
  };
}

async function spatial(ctx: ScenarioContext) {
  const system = new WorldSystem();
  system.addObject(object('far', 0, 4));
  system.addObject(object('near', 0, 2));
  const hit = system.raycast(new Vector3(), new Vector3(0, 0, 1), 10);
  ctx.assert('nearest-object', 'near', hit?.object.id ?? 'none');
  system.cleanup();
  const small = object('small', 0, 0);
  const large = object('large', 50, 0, 50);
  system.addObject(small); system.addObject(large);
  ctx.assert('reference-overlap', true, small.boundingBox!.intersectsBox(large.boundingBox!));
  const collisions = system.checkCollisions('small');
  ctx.assert('large-object-detected', 1, collisions.length);
  ctx.sample('collision-misses', Number(collisions.length !== 1), 'count', 'large-aabb-query');
  const meshes = [2, 4].map((z, i) => {
    const mesh = new Mesh(new BoxGeometry(2, 2, 2), new MeshStandardMaterial({ color: i ? '#e6a267' : '#63e0bd', wireframe: true }));
    mesh.position.z = z; return mesh;
  });
  const view = await mountScene(ctx, meshes);
  try { for (let i = 0; i < 12; i++) await view.frame(); }
  finally { view.dispose(); for (const mesh of meshes) { mesh.geometry.dispose(); mesh.material.dispose(); } system.cleanup(); }
}

async function camera(ctx: ScenarioContext) {
  const scene = new Scene();
  const mesh = new Mesh(new BoxGeometry(2, 2, 1), new MeshStandardMaterial({ color: '#e6a267' }));
  mesh.position.z = 3;
  scene.add(mesh); scene.updateMatrixWorld(true);
  const from = new Vector3(); const to = new Vector3(0, 0, 10);
  invalidateCollisionCache();
  ctx.assert('unrendered-obstacle-detected', false, cameraUtils.improvedCollisionCheck(from, to, scene).safe);
  mesh.geometry.computeBoundingSphere(); invalidateCollisionCache();
  const first = cameraUtils.improvedCollisionCheck(from, to, scene);
  const previousZ = first.position.z;
  mesh.position.z = 5; scene.updateMatrixWorld(true);
  cameraUtils.improvedCollisionCheck(from, to, scene);
  ctx.assert('returned-position-stable', previousZ, first.position.z);
  ctx.sample('previous-result-mutation', Math.abs(first.position.z - previousZ), 'count', 'camera-query-alias');
  const view = await mountScene(ctx, [scene]);
  try { for (let i = 0; i < 12; i++) await view.frame(); }
  finally { view.dispose(); mesh.geometry.dispose(); mesh.material.dispose(); invalidateCollisionCache(); }
}

async function entities(ctx: ScenarioContext) {
  let invalidCreations = 0;
  let rejectedCapacities = 0;
  for (const capacity of [0, -1, 1.5, Number.NaN]) {
    try {
      const world = new NextWorld({ capacity });
      const id = world.createEntity();
      if (!world.isAlive(id)) invalidCreations++;
    } catch { rejectedCapacities++; }
  }
  const world = new NextWorld({ capacity: 1 });
  const stale = world.createEntity(); let current = stale; let aliases = 0;
  for (let i = 0; i < 10000; i++) { world.destroyEntity(current); current = world.createEntity(); if (world.isAlive(stale)) aliases++; }
  ctx.assert('invalid-created-handles', 0, invalidCreations);
  ctx.assert('invalid-capacities-rejected', 4, rejectedCapacities);
  ctx.assert('stale-handle-revivals', 0, aliases);
  ctx.assert('alive-count', 1, world.entityCount);
  ctx.sample('stale-handle-revivals', aliases, 'count', '10000-slot-reuses');
  ctx.sample('invalid-capacities-accepted', 4 - rejectedCapacities, 'count', 'constructor-validation');
  ctx.host.textContent = `10,000회 재사용 · stale ID 재인식 ${aliases}회 · 유효하지 않은 생성 ${invalidCreations}회`;
}

function audioBlob(): Blob {
  const frames = 2205; const data = new ArrayBuffer(44 + frames * 2); const view = new DataView(data);
  const text = (offset: number, value: string) => [...value].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, data.byteLength - 8, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, 22050, true); view.setUint32(28, 44100, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  text(36, 'data'); view.setUint32(40, frames * 2, true);
  for (let i = 0; i < frames; i++) view.setInt16(44 + i * 2, Math.sin(i * 440 * Math.PI * 2 / 22050) * 500, true);
  return new Blob([data], { type: 'audio/wav' });
}

async function audio(ctx: ScenarioContext) {
  const engine = getAudioEngine();
  if (!engine.ensure()) throw new UnsupportedScenario('AudioContext 미지원');
  const context = (engine as unknown as { ctx: AudioContext }).ctx;
  void context.resume();
  for (let i = 0; i < 30 && context.state !== 'running'; i++) await nextFrame(ctx.signal);
  if (context.state !== 'running') throw new UnsupportedScenario('재생 버튼을 눌러 AudioContext를 허용해 주세요.');
  const original = context.createBufferSource;
  const active = new Set<AudioBufferSourceNode>(); const created: AudioBufferSourceNode[] = [];
  let starts = 0;
  context.createBufferSource = function () {
    const source = original.call(this); created.push(source);
    const start = source.start.bind(source); const stop = source.stop.bind(source);
    source.start = (...args: Parameters<AudioBufferSourceNode['start']>) => { start(...args); starts++; active.add(source); };
    source.stop = (...args: Parameters<AudioBufferSourceNode['stop']>) => { stop(...args); active.delete(source); };
    source.addEventListener('ended', () => active.delete(source));
    return source;
  };
  const url = URL.createObjectURL(audioBlob());
  try {
    engine.playBgm({ id: 'performance-bgm', url, volume: 0.1 });
    for (let i = 0; i < 120 && !starts; i++) await nextFrame(ctx.signal);
    ctx.assert('real-audio-started', true, starts > 0);
    engine.stopBgm();
    await nextFrame(ctx.signal);
    ctx.assert('active-sources-after-stop', 0, active.size);
    ctx.sample('active-sources-after-stop', active.size, 'count', 'url-bgm-stop');
    ctx.host.textContent = `실제 AudioBufferSource 시작 ${starts}회 · 정지 후 활성 ${active.size}개`;

    // Hold a real decode result until stopBgm has run; no simulated audio nodes.
    const lateUrl = URL.createObjectURL(audioBlob());
    const decode = context.decodeAudioData;
    let release: (() => void) | undefined;
    let decoded = false;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    context.decodeAudioData = async function (buffer) {
      const result = await decode.call(this, buffer);
      decoded = true;
      await gate;
      return result;
    };
    try {
      const before = starts;
      engine.playBgm({ id: 'performance-late-bgm', url: lateUrl, volume: 0.1 });
      for (let i = 0; i < 120 && !decoded; i++) await nextFrame(ctx.signal);
      ctx.assert('real-late-audio-decoded', true, decoded);
      engine.stopBgm();
      release!();
      for (let i = 0; i < 10; i++) await nextFrame(ctx.signal);
      ctx.assert('late-starts-after-stop', 0, starts - before);
      ctx.sample('late-starts-after-stop', starts - before, 'count', 'decode-completes-after-stop');
    } finally { release!(); context.decodeAudioData = decode; URL.revokeObjectURL(lateUrl); }
  } finally {
    engine.stopBgm(); context.createBufferSource = original;
    for (const source of created) { try { source.stop(); } catch { /* Already ended. */ } source.disconnect(); }
    URL.revokeObjectURL(url);
  }
}

async function contract(ctx: ScenarioContext) {
  const queue = new MessageQueue(2, 2, true);
  for (let i = 0; i < 3; i++) queue.enqueue({ id: String(i), from: 'a', to: 'b', type: 'chat', payload: {}, priority: 'normal', reliability: 'reliable', timestamp: i });
  ctx.assert('capacity', 2, queue.getTotalSize());
  ctx.assert('oldest-evicted', true, queue.findMessage('0') === null);
  ctx.assert('newest-retained', '1,2', queue.dequeueBatch().map((message) => message.id).join(','));
  ctx.sample('remaining-queue', queue.getTotalSize(), 'count', 'production-message-queue');
  ctx.host.textContent = '실제 MessageQueue의 전역 용량·동일 우선순위 교체·FIFO를 실행했습니다.';
}

async function materialEditor(ctx: ScenarioContext) {
  const manager = new MaterialManager();
  const first = manager.getMaterial({ id: 'lab-first', color: '#ff0000' }) as MeshStandardMaterial;
  const second = manager.getMaterial({ id: 'lab-second', color: '#ff0000' }) as MeshStandardMaterial;
  const firstMesh = new Mesh(new BoxGeometry(2, 2, 2), first);
  const secondMesh = new Mesh(firstMesh.geometry, second);
  firstMesh.position.x = -2; secondMesh.position.x = 2;
  manager.updateMaterial('lab-first', { color: '#00ff00', roughness: 0.25 });
  ctx.assert('update-by-id', '00ff00', first.color.getHexString());
  ctx.assert('other-id-unchanged', 'ff0000', second.color.getHexString());
  ctx.sample('id-update-misses', Number(first.color.getHexString() !== '00ff00'), 'count', 'material-manager-update');
  const view = await mountScene(ctx, [firstMesh, secondMesh]);
  try { for (let i = 0; i < 8; i++) await view.frame(); }
  finally { view.dispose(); firstMesh.geometry.dispose(); manager.dispose(); }
}

async function pluginDisposal(ctx: ScenarioContext) {
  const registry = new PluginRegistry();
  const disposed: string[] = [];
  for (const id of ['first', 'broken', 'last']) registry.register({
    id, name: id, version: '1.0.0',
    setup(context) { context.services.register(`${id}.service`, {}, id); },
    dispose() { disposed.push(id); if (id === 'broken') throw new Error('Injected disposal failure'); },
  });
  await registry.setupAll();
  let failed = false;
  try { await registry.disposeAll(); } catch { failed = true; }
  ctx.assert('failure-reported', true, failed);
  ctx.assert('all-disposals-attempted', 'last,broken,first', disposed.join(','));
  const remaining = registry.context.services.list().length;
  ctx.assert('remaining-owned-services', 0, remaining);
  ctx.sample('remaining-owned-services', remaining, 'count', 'failed-plugin-disposal');
  ctx.host.textContent = `해제 순서 ${disposed.join(' → ')} · 잔여 service ${remaining}개`;
}

export const functionalScenarios: Scenario[] = [
  { id: 'material-editor', title: '재질 ID 편집', description: '왼쪽 재질만 ID로 바꾸고 다른 ID의 재질이 유지되는지 확인합니다.', version: 1, run: materialEditor },
  { id: 'save-lifecycle', title: '플러그인 해제 실패', description: '중간 플러그인의 해제가 실패해도 나머지 service가 정리되는지 확인합니다. 저장 지연 검증은 별도 단계입니다.', version: 1, run: pluginDisposal },
  { id: 'state-hooks', title: '공개 훅 안정성', description: '실제 시간·인벤토리 훅의 구독과 반복 렌더링을 검사합니다.', version: 1, run: hooks },
  { id: 'save-transaction', title: '저장 복원 원자성', description: '두 번째 도메인에서 오류를 발생시킨 뒤 전체 상태를 확인합니다.', version: 1, run: saveTransaction },
  { id: 'spatial-query', title: '최근접·큰 물체 충돌', description: '등록 순서가 다른 두 물체와 중심이 먼 큰 AABB를 조회합니다.', version: 1, run: spatial },
  { id: 'camera-obstacles', title: '카메라 장애물', description: '아직 렌더링되지 않은 메시와 연속 충돌 질의의 결과를 확인합니다.', version: 1, run: camera },
  { id: 'entity-lifecycle', title: '엔티티 ID 수명', description: '잘못된 용량 거부와 10,000회 슬롯 재사용을 검사합니다.', version: 2, run: entities },
  { id: 'audio-lifecycle', title: 'BGM 정지·지연 로드', description: '실제 음원 정지와 정지 이후 늦게 완료된 decode를 검사합니다.', version: 2, run: audio },
  { id: 'test-contract', title: '운영 큐 계약', description: '테스트용 복제 클래스 없이 실제 MessageQueue를 사용합니다.', version: 1, run: contract },
];
