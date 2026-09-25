import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';

import { createGaesupRuntime, createBuildingPlugin, createNPCPlugin, GaesupRuntimeProvider, useBuildingStore, useNPCStore } from 'gaesup-world';
import { BuildingNavigationObstacleDriver, BuildingRenderStateDriver, BuildingGpuMirrorDriver, BuildingGpuUploadDriver, BuildingGpuCullingDriver, BuildingIndirectDrawDriver, BuildingIndirectArgsUploadDriver, BuildingVisibilityDriver, DRAW_CLUSTER_BLOCK } from 'gaesup-world/building';

import { mountScene } from './scene';
import { nextFrame, UnsupportedScenario, type Scenario, type ScenarioContext } from './types';

async function worldDomains(ctx: ScenarioContext) {
  const identity = `domain-lab-${crypto.randomUUID()}`;
  const navigation = { cellSize: 1, worldMinX: -12, worldMinZ: -12, worldMaxX: 12, worldMaxZ: 12 };
  const make = (id: string) => createGaesupRuntime({ worldId: `${identity}:${id}`, navigation, plugins: [createBuildingPlugin(), createNPCPlugin()] });
  const a = make('a'); const b = make('b');
  const previousBuilding = useBuildingStore.getState(); const previousNPC = useNPCStore.getState();
  const root = createRoot(ctx.host);
  const views: Record<string, { block: number; npc: number }> = {};
  type BuildingService = { getState: typeof useBuildingStore.getState };
  type NPCService = { getState: typeof useNPCStore.getState };
  function Consumer({ id, runtime }: { id: string; runtime: typeof a }) {
    const block = useBuildingStore(state => state.blocks.find(entry => entry.id === 'shared-block')?.position.x ?? -99);
    const npc = useNPCStore(state => state.instances.get('shared-npc')?.position[0] ?? -99);
    views[id] = { block, npc };
    return <><p>월드 {id}: 건물 x={block}, NPC x={npc}</p><BuildingNavigationObstacleDriver navigation={runtime.navigation} /></>;
  }
  try {
    await a.setup(); await b.setup(); await Promise.all([a.navigation.init(), b.navigation.init()]);
    const buildingA = a.requireService<BuildingService>('building.store'); const buildingB = b.requireService<BuildingService>('building.store');
    const npcA = a.requireService<NPCService>('npc.store'); const npcB = b.requireService<NPCService>('npc.store');
    buildingA.getState().hydrate({ blocks: [{ id: 'shared-block', position: { x: 0, y: 0, z: 0 }, size: { x: 3, y: 2, z: 3 } }] });
    buildingB.getState().hydrate({ blocks: [{ id: 'shared-block', position: { x: 7, y: 0, z: 0 }, size: { x: 3, y: 2, z: 3 } }] });
    const npc = (x: number) => ({ id: 'shared-npc', templateId: 'lab', name: 'NPC', position: [x, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] });
    npcA.getState().addInstance(npc(1)); npcB.getState().addInstance(npc(9));
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><Consumer id="A" runtime={a} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><Consumer id="B" runtime={b} /></GaesupRuntimeProvider></>));
    await nextFrame(ctx.signal);
    ctx.assert('A-owned-building', 0, views['A']!.block); ctx.assert('B-owned-building', 7, views['B']!.block);
    ctx.assert('A-owned-NPC', 1, views['A']!.npc); ctx.assert('B-owned-NPC', 9, views['B']!.npc);
    ctx.assert('A-own-building-blocks-origin', false, a.navigation.isWalkable(0, 0));
    ctx.assert('B-origin-is-clear', true, b.navigation.isWalkable(0, 0));
    ctx.sample('building-state-leaks', Number(views['A']!.block !== 0), 'count', 'two-real-building-stores-and-hooks');
    ctx.sample('npc-state-leaks', Number(views['A']!.npc !== 1), 'count', 'two-real-npc-stores-and-hooks');
    ctx.sample('building-navigation-mismatches', Number(a.navigation.isWalkable(0, 0)) + Number(!b.navigation.isWalkable(0, 0)), 'count', 'actual-building-obstacle-driver');
    await a.save.save('main'); await b.save.save('main');
    buildingA.getState().hydrate({ blocks: [] }); npcA.getState().updateInstance('shared-npc', { position: [4, 0, 0] });
    await a.save.load('main'); await nextFrame(ctx.signal);
    const savedMismatch = Number(buildingA.getState().blocks[0]?.position.x !== 0) + Number(npcA.getState().instances.get('shared-npc')?.position[0] !== 1);
    ctx.assert('A-building-restored', 0, buildingA.getState().blocks[0]?.position.x ?? -99);
    ctx.assert('A-NPC-restored', 1, npcA.getState().instances.get('shared-npc')?.position[0] ?? -99);
    ctx.assert('B-building-survives-A-load', 7, buildingB.getState().blocks[0]?.position.x ?? -99);
    ctx.assert('B-NPC-survives-A-load', 9, npcB.getState().instances.get('shared-npc')?.position[0] ?? -99);
    ctx.sample('domain-save-mismatches', savedMismatch, 'count', 'actual-indexeddb-building-and-npc-bindings');
    await a.dispose();
    flushSync(() => npcB.getState().updateInstance('shared-npc', { position: [10, 0, 0] }));
    ctx.assert('B-NPC-updates-after-A-dispose', 10, views['B']!.npc);
  } finally {
    flushSync(() => root.unmount());
    await a.save.remove('main'); await b.save.remove('main');
    await a.dispose(); await b.dispose();
    useBuildingStore.setState(previousBuilding); useNPCStore.setState(previousNPC);
  }
}

export const domainScenarios: Scenario[] = [
  { id: 'world-domains', title: '두 월드의 건물·NPC·실제 저장', description: '같은 ID를 가진 건물과 NPC를 두 Provider·저장 플러그인·장애물 driver에 연결하고 실제 IndexedDB 저장과 개별 종료를 확인합니다.', version: 1, run: worldDomains },
  { id: 'world-render-state', title: '두 월드의 GPU 버퍼·컬링 수명', description: '실제 건물 render/mirror/upload/culling driver를 한 WebGPU renderer에서 실행하고 월드 종료·재시작 후 버퍼와 가시 객체 수를 비교합니다.', version: 1, run: worldRenderState },
  { id: 'world-obstacle-registry', title: '장애물 등록·교체·해제', description: '동일 source ID의 장애물을 월드별로 등록하고, 교체 전 구독 해제가 새 장애물을 지우지 않는지 실제 driver로 검사합니다.', version: 1, run: worldObstacleRegistry },
];

async function worldObstacleRegistry(ctx: ScenarioContext) {
  const navigation = { cellSize: 1, worldMinX: -8, worldMinZ: -8, worldMaxX: 8, worldMaxZ: 8 };
  const a = createGaesupRuntime({ navigation }); const b = createGaesupRuntime({ navigation });
  const root = createRoot(ctx.host);
  try {
    await a.setup(); await b.setup(); await a.navigation.init(); await b.navigation.init();
    flushSync(() => root.render(<><GaesupRuntimeProvider runtime={a}><BuildingNavigationObstacleDriver navigation={a.navigation} /></GaesupRuntimeProvider><GaesupRuntimeProvider runtime={b}><BuildingNavigationObstacleDriver navigation={b.navigation} /></GaesupRuntimeProvider></>));
    const entries = [{ id: 'same', x: 0, z: 0, width: 2, depth: 2 }];
    const oldCleanup = a.navigationObstacles.registerNavigationObstacles('same-source', entries);
    entries[0]!.x = 7;
    await nextFrame(ctx.signal);
    ctx.assert('A-registration-blocks-origin', false, a.navigation.isWalkable(0, 0));
    ctx.assert('B-origin-remains-clear', true, b.navigation.isWalkable(0, 0));
    const crossWorldLeaks = Number(!b.navigation.isWalkable(0, 0));
    const cleanup = a.navigationObstacles.registerNavigationObstacles('same-source', [{ id: 'same', x: -4, z: 0, width: 2, depth: 2 }]);
    const cleanupB = b.navigationObstacles.registerNavigationObstacles('same-source', [{ id: 'same', x: 4, z: 0, width: 2, depth: 2 }]);
    oldCleanup(); await nextFrame(ctx.signal);
    const staleLosses = Number(a.navigation.isWalkable(-4, 0));
    ctx.assert('new-A-registration-survives-old-cleanup', false, a.navigation.isWalkable(-4, 0));
    ctx.assert('A-old-obstacle-cleared', true, a.navigation.isWalkable(0, 0));
    cleanup(); await nextFrame(ctx.signal);
    ctx.assert('A-unregister-updates-grid', true, a.navigation.isWalkable(-4, 0));
    ctx.assert('B-registration-survives-A-cleanup', false, b.navigation.isWalkable(4, 0));
    const removalMisses = Number(!a.navigation.isWalkable(-4, 0)) + Number(b.navigation.isWalkable(4, 0));
    cleanupB();
    ctx.sample('registry-cross-world-leaks', crossWorldLeaks, 'count', 'owned-registry-and-building-driver');
    ctx.sample('stale-unregister-losses', staleLosses, 'count', 'same-source-id-replacement');
    ctx.sample('reactive-removal-misses', removalMisses, 'count', 'registry-notification-rebuilds-grid');
    ctx.host.textContent = '장애물 교체·해제 검사 완료';
  } finally { flushSync(() => root.unmount()); await a.dispose(); await b.dispose(); }
}

async function worldRenderState(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  function Drivers({ runtime }: { runtime: typeof a }) {
    return <GaesupRuntimeProvider runtime={runtime}><BuildingRenderStateDriver /><BuildingGpuMirrorDriver /><BuildingGpuUploadDriver /><BuildingGpuCullingDriver /><BuildingIndirectDrawDriver /><BuildingIndirectArgsUploadDriver /><BuildingVisibilityDriver /></GaesupRuntimeProvider>;
  }
  let view: Awaited<ReturnType<typeof mountScene>> | undefined;
  let device: { pushErrorScope: (filter: 'validation') => void; popErrorScope: () => Promise<{ message: string } | null>; queue: { onSubmittedWorkDone: () => Promise<void> } } | undefined;
  let scopeOpen = false;
  try {
    await a.setup(); await b.setup();
    a.buildingStore.getState().hydrate({ blocks: [{ id: 'same-block', position: { x: -2, y: 0, z: 0 } }] });
    b.buildingStore.getState().hydrate({ blocks: [{ id: 'same-block', position: { x: 2, y: 0, z: 0 } }, { id: 'extra', position: { x: 4, y: 0, z: 0 } }] });
    view = await mountScene(ctx, [], false, <><Drivers runtime={a} /><Drivers runtime={b} /></>);
    device = (view.state.gl as unknown as { backend?: { device?: typeof device } }).backend?.device;
    if (!device) throw new UnsupportedScenario('이 시나리오는 실제 WebGPU device가 필요합니다.');
    device.pushErrorScope('validation'); scopeOpen = true;
    const until = async (predicate: () => boolean) => { for (let i = 0; i < 180 && !predicate(); i++) await view!.frame(); };
    await until(() => a.buildingCullingStore.getState().active && b.buildingCullingStore.getState().active);
    const bufferA = a.buildingRenderStore.getState().uploadResources.spatialBuffer;
    const bufferB = b.buildingRenderStore.getState().uploadResources.spatialBuffer;
    if (!bufferA || !bufferB) throw new UnsupportedScenario('이 시나리오는 실제 WebGPU storage buffer가 필요합니다.');
    ctx.assert('storage-buffers-distinct', true, bufferA !== bufferB);
    ctx.assert('A-snapshot-count', 1, a.buildingRenderStore.getState().snapshot.ids.length);
    ctx.assert('B-snapshot-count', 2, b.buildingRenderStore.getState().snapshot.ids.length);
    ctx.assert('A-visible-block-count', 1, a.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] ?? -1);
    ctx.assert('B-visible-block-count', 2, b.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] ?? -1);
    await a.dispose(); for (let i = 0; i < 3; i++) await view.frame();
    ctx.assert('A-buffer-released', true, a.buildingRenderStore.getState().uploadResources.spatialBuffer === null);
    ctx.assert('B-buffer-survives-A-dispose', true, b.buildingRenderStore.getState().uploadResources.spatialBuffer === bufferB);
    ctx.assert('B-culling-survives-A-dispose', 2, b.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] ?? -1);
    await a.setup();
    await until(() => a.buildingCullingStore.getState().active);
    ctx.assert('A-buffer-recreated', true, a.buildingRenderStore.getState().uploadResources.spatialBuffer !== null && a.buildingRenderStore.getState().uploadResources.spatialBuffer !== bufferA);
    ctx.assert('A-culling-restored', 1, a.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] ?? -1);
    ctx.assert('B-buffer-survives-A-restart', true, b.buildingRenderStore.getState().uploadResources.spatialBuffer === bufferB);
    ctx.sample('render-owner-mismatches', Number(bufferA === bufferB) + Number(b.buildingRenderStore.getState().uploadResources.spatialBuffer !== bufferB), 'count', 'actual-webgpu-building-drivers');
    ctx.sample('culling-count-mismatches', Number(a.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] !== 1) + Number(b.buildingCullingStore.getState().clusterCounts[DRAW_CLUSTER_BLOCK] !== 2), 'count', 'native-webgpu-readback-after-restart');
    ctx.sample('live-owned-spatial-buffers', new Set([a, b].map(runtime => runtime.buildingRenderStore.getState().uploadResources.spatialBuffer).filter(Boolean)).size, 'count', 'two-worlds-after-restart');
    await device.queue.onSubmittedWorkDone();
    const validationError = await device.popErrorScope(); scopeOpen = false;
    ctx.assert('GPU-validation-errors', 0, Number(validationError !== null));
    ctx.sample('gpu-validation-errors', Number(validationError !== null), 'count', 'native-device-validation-error-scope');
    if (validationError) throw new Error(validationError.message);
  } finally { if (scopeOpen) await device?.popErrorScope(); await view?.dispose(); await a.dispose(); await b.dispose(); }
}
