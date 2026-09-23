import * as THREE from 'three';

import { createGaesupRuntime, GaesupRuntimeProvider } from 'gaesup-world';
import { BuildingSystem, Grass, GrassDriver, getGrassManager, type GrassTileRenderState } from 'gaesup-world/building';

import { mountScene } from './scene';
import type { Scenario, ScenarioContext } from './types';

async function worldGrass(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  type Manager = ReturnType<typeof getGrassManager>;
  const owned = (runtime: typeof a) => (runtime as typeof a & { grassManager?: Manager }).grassManager ?? getGrassManager();
  const ma = owned(a); const mb = owned(b);
  const values: Partial<Record<'a' | 'b', GrassTileRenderState>> = {};
  const updates = { a: 0, b: 0 };
  const register = (manager: Manager, id: 'a' | 'b', x: number) => manager.register({
    width: 4, height: 1, center: new THREE.Vector3(x, 0, -8), maxInstances: 64,
    apply: value => { values[id] = { ...value, trampleCenter: value.trampleCenter.clone() }; updates[id]++; },
  });
  const tick = (manager: Manager, x: number, elapsedTime: number) => {
    const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 100);
    camera.position.set(x, 2, 0); camera.lookAt(x, 0, -8); camera.updateMatrixWorld(true);
    manager.tick({ elapsedTime, delta: 1 / 144, cameraPosition: camera.position,
      frustum: new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)) });
  };
  const metric = (id: string, count: number) => { ctx.sample(id, count, 'count', 'actual-grass-manager-two-runtimes'); ctx.assert(id, 0, count); };
  let ha: ReturnType<typeof register> | undefined; let hb: ReturnType<typeof register> | undefined;
  try {
    await a.setup(); await b.setup();
    a.weatherStore.getState().setWeather('sunny', 0); b.weatherStore.getState().setWeather('storm', 1);
    a.stateManager.getActiveState().position.set(2, 0, -8); b.stateManager.getActiveState().position.set(302, 0, -8);
    ha = register(ma, 'a', 0); hb = register(mb, 'b', 300);
    tick(ma, 0, 1);
    metric('grass-cross-world-updates', updates.b);
    tick(mb, 300, 2);
    metric('grass-weather-mismatches', Number(Math.abs((values.a?.windScale ?? -1) - 0.85) > 0.001) + Number(Math.abs((values.b?.windScale ?? -1) - 3.5) > 0.001));
    metric('grass-camera-mismatches', Number(!values.a?.visible) + Number(!values.b?.visible));
    metric('grass-trample-mismatches', Number((values.a?.trampleCenter.x ?? 0) <= 0) + Number((values.b?.trampleCenter.x ?? 0) <= 1));
    const before = updates.a;
    for (let frame = 0; frame < 144; frame++) tick(ma, 0, 3 + frame / 144);
    metric('grass-missed-frame-updates', 144 - (updates.a - before));
    const afterFrames = updates.a;
    tick(ma, 0, 3 + 143 / 144);
    metric('grass-duplicate-frame-updates', updates.a - afterFrames);
    await a.dispose();
    const afterDispose = updates.a;
    tick(ma, 0, 8);
    metric('grass-updates-after-dispose', updates.a - afterDispose);
    metric('grass-visible-after-dispose', Number(values.a?.visible === true));
    tick(mb, 300, 8);
    metric('grass-other-world-after-dispose', Number(!values.b?.visible));
    await a.setup(); tick(ma, 0, 9);
    metric('grass-restart-mismatches', Number(!values.a?.visible) + Number(ma.size() !== 1));
    ctx.host.textContent = `월드 A/B: ${ma.size()}/${mb.size()}개 등록, 바람 ${values.a?.windScale}/${values.b?.windScale}. 144개 프레임과 종료/재시작 검사.`;
  } finally {
    if (ha) ma.unregister(ha.id); if (hb) mb.unregister(hb.id);
    await a.dispose(); await b.dispose();
  }
}

async function grassRendering(ctx: ScenarioContext) {
  const a = createGaesupRuntime(); const b = createGaesupRuntime();
  type Mounted = Awaited<ReturnType<typeof mountScene>>;
  let left: Mounted | undefined; let right: Mounted | undefined;
  const meshIn = (scene: THREE.Scene) => {
    let result: THREE.Mesh<THREE.InstancedBufferGeometry> | undefined;
    scene.traverse(object => { if (object instanceof THREE.Mesh && object.geometry instanceof THREE.InstancedBufferGeometry) result = object; });
    if (!result) throw new Error('Grass mesh was not mounted');
    return result;
  };
  const metric = (id: string, errors: number) => { ctx.sample(id, errors, 'count', 'two-native-canvases-real-grass-building-driver'); ctx.assert(id, 0, errors); };
  try {
    await a.setup(); await b.setup();
    a.weatherStore.getState().setWeather('sunny', 0); b.weatherStore.getState().setWeather('storm', 1);
    a.stateManager.getActiveState().position.set(1, 0, 1); b.stateManager.getActiveState().position.set(301, 0, 1);
    const small = { ...ctx, config: { ...ctx.config, width: 440, height: 280 } };
    left = await mountScene(small, [], false, <GaesupRuntimeProvider runtime={a}><Grass width={6} instances={64} /><BuildingSystem showGrid={false} /><GrassDriver /></GaesupRuntimeProvider>);
    right = await mountScene(small, [], false, <GaesupRuntimeProvider runtime={b}><Grass width={6} instances={64} position={[300, 0, 0]} /><BuildingSystem showGrid={false} /></GaesupRuntimeProvider>);
    left.state.camera.position.set(0, 4, 9); left.state.camera.lookAt(0, 0, 0);
    right.state.camera.position.set(300, 4, 9); right.state.camera.lookAt(300, 0, 0);
    const deadline = performance.now() + 15000;
    while ((a.grassManager.size() === 0 || b.grassManager.size() === 0) && performance.now() < deadline) { await left.frame(); await right.frame(); }
    await left.frame(); await right.frame(); await left.frame();
    const ma = meshIn(left.state.scene); const mb = meshIn(right.state.scene);
    type Uniforms = { uniforms: Record<string, { value: unknown }> };
    const ua = (ma.material as THREE.Material & Uniforms).uniforms;
    const ub = (mb.material as THREE.Material & Uniforms).uniforms;
    metric('grass-render-weather-mismatches', Number(Math.abs(Number(ua['windScale']?.value) - 0.85) > 0.001) + Number(Math.abs(Number(ub['windScale']?.value) - 3.5) > 0.001));
    const instancesA = ma.geometry.getAttribute('offset').count; const instancesB = mb.geometry.getAttribute('offset').count;
    metric('grass-render-instance-mismatches', Number(ma.geometry.instanceCount !== instancesA) + Number(mb.geometry.instanceCount !== instancesB));
    metric('grass-render-trample-mismatches', Number(Math.abs((ua['trampleCenter']?.value as THREE.Vector3).x - 1) > 0.001) + Number(Math.abs((ub['trampleCenter']?.value as THREE.Vector3).x - 1) > 0.001));
    metric('grass-default-driver-missing', Number(Number(ub['time']?.value) <= 0));
    await a.dispose(); await right.frame();
    metric('grass-render-dispose-mismatches', Number(ma.visible) + Number(ma.geometry.instanceCount !== 0) + Number(!mb.visible));
    await a.setup(); await left.frame();
    metric('grass-render-restart-mismatches', Number(!ma.visible) + Number(ma.geometry.instanceCount !== instancesA));
    ctx.sample('grass-render-visible-instances', ma.geometry.instanceCount + mb.geometry.instanceCount, 'count', 'two-real-grass-meshes');
  } finally {
    left?.dispose(); right?.dispose(); await a.dispose(); await b.dispose();
  }
}

export const grassScenarios: Scenario[] = [{
  id: 'world-grass', title: '월드별 grass 관리·프레임·수명',
  description: '실제 grass manager의 카메라·날씨·밟힘 소유권과 144개 프레임, 중복 호출, 종료/재시작을 검사합니다. FPS 측정은 아닙니다.',
  version: 1, requirementIds: ['R25', 'R26'], run: worldGrass,
}, {
  id: 'grass-rendering', title: '두 월드 grass 실제 렌더링',
  description: '실제 Grass·BuildingSystem 기본 driver를 두 canvas에서 실행해 재질 값·인스턴스·종료/재시작을 확인합니다.',
  version: 1, requirementIds: ['R25'], run: grassRendering,
}];
