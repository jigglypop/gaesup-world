import { Box3, BoxGeometry, Clock, Euler, Group, Mesh, MeshBasicMaterial, PerspectiveCamera, Ray, Scene, Vector3 } from 'three';

import { CAMERA_COLLIDER_LAYER, cameraUtils, EntityStateManager, ThirdPersonController, type CameraSystemState } from 'gaesup-world';
import { WorldSystem, type WorldObject } from 'gaesup-world/runtime';

import { checkAbort, nextFrame, type Scenario, type ScenarioContext } from './types';

async function spatialScale(ctx: ScenarioContext) {
  const count = ctx.config.count;
  const world = new WorldSystem();
  const width = Math.ceil(Math.sqrt(count));
  const objects: WorldObject[] = [];
  for (let i = 0; i < count; i++) {
    const position = new Vector3((i % width) * 4, 0, Math.floor(i / width) * 4);
    const object: WorldObject = { id: `box-${i}`, position, rotation: new Euler(), scale: new Vector3(1, 1, 1), type: 'static',
      boundingBox: new Box3().setFromCenterAndSize(position, new Vector3(i % 127 ? 2 : 40, 2, 2)) };
    objects.push(object); world.addObject(object);
  }
  const ray = new Ray(); const point = new Vector3(); const displacement = new Vector3();
  try {
    for (let step = 0; step < 120; step++) {
      checkAbort(ctx.signal);
      const object = objects[(step * 97) % count]!;
      let indexedIds: string[] = []; let referenceIds: string[] = [];
      let actual: ReturnType<WorldSystem['raycast']> = null;
      let expectedId: string | undefined; let expectedDistance = Infinity;
      const measure = (name: string, action: () => void, batchSize = 32) => {
        const start = performance.now();
        for (let i = 0; i < batchSize; i++) action();
        const elapsed = (performance.now() - start) / batchSize;
        if (step >= 20) ctx.sample(name, elapsed, 'ms', `cpu-${count}-world-objects-mean-of-${batchSize}`);
      };
      displacement.set(step % 2 ? -0.1 : 0.1, 0, 0);
      object.position.add(displacement); object.boundingBox!.translate(displacement);
      measure('bounds-update', () => { world.updateObject(object.id, { position: object.position, boundingBox: object.boundingBox }); }, 1);
      const indexed = () => measure('indexed-collision', () => { indexedIds = world.checkCollisions(object.id).map(value => value.id); });
      const reference = () => measure('reference-collision', () => {
        referenceIds = objects.filter(other => other.id !== object.id && object.boundingBox!.intersectsBox(other.boundingBox!)).map(value => value.id);
      });
      if (step % 2) { reference(); indexed(); } else { indexed(); reference(); }
      ctx.assert(`collision-${step}`, referenceIds.sort().join(','), indexedIds.sort().join(','));
      ray.origin.copy(object.position); ray.origin.z -= 3; ray.direction.set(0, 0, 1);
      const indexedRay = () => measure('indexed-ray', () => { actual = world.raycast(ray.origin, ray.direction, 40); });
      const referenceRay = () => measure('reference-ray', () => {
        for (const candidate of objects) {
          if (!ray.intersectBox(candidate.boundingBox!, point)) continue;
          const distance = ray.origin.distanceTo(point);
          if (distance <= 40 && distance < expectedDistance) { expectedDistance = distance; expectedId = candidate.id; }
        }
      });
      if (step % 2) { referenceRay(); indexedRay(); } else { indexedRay(); referenceRay(); }
      const hit = actual as ReturnType<WorldSystem['raycast']>;
      ctx.assert(`ray-${step}`, expectedId ?? 'none', hit?.object.id ?? 'none');
      if (hit) ctx.assert(`distance-${step}`, true, Math.abs(hit.distance - expectedDistance) < 1e-8);
      if (step % 20 === 19) { ctx.progress(`${step + 1}/120 queries, ${count} objects`); await nextFrame(ctx.signal); }
    }
    ctx.unavailable('gpu-time', 'ms', 'cpu-spatial-query', 'CPU 질의와 정확성 기준 선형 검색의 비교입니다. FPS·GPU 시간 측정이 아닙니다.');
  } finally { world.dispose(); }
}

async function cameraRadius(ctx: ScenarioContext) {
  const scene = new Scene(); const geometry = new BoxGeometry(1, 2, 1); const material = new MeshBasicMaterial();
  const target = new Mesh(geometry, material); target.position.set(0.8, 0, 5); scene.add(target);
  const count = ctx.config.count;
  for (let i = 1; i < count; i++) {
    const mesh = new Mesh(geometry, material); mesh.position.set(10 + (i % 100) * 3, 0, Math.floor(i / 100) * 3); scene.add(mesh);
  }
  const from = new Vector3(); const to = new Vector3(0, 0, 10);
  try {
    ctx.assert('center-ray-misses', true, cameraUtils.improvedCollisionCheck(from, to, scene, 0).safe);
    const first = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5); const previous = first.position.clone();
    for (let i = 0; i < 120; i++) {
      checkAbort(ctx.signal);
      target.position.z = i % 2 ? 5 : 6;
      const started = performance.now();
      const result = cameraUtils.improvedCollisionCheck(from, to, scene, 0.5);
      const elapsed = performance.now() - started;
      if (i >= 20) ctx.sample('camera-sphere-query', elapsed, 'ms', `cpu-${count}-box-meshes`);
      ctx.assert(`side-contact-${i}`, false, result.safe);
      ctx.assert(`safe-distance-${i}`, true, Math.abs(result.position.z - (target.position.z - 0.9)) < 1e-6);
      ctx.assert(`radius-${i}`, true, Math.abs(result.position.distanceTo(result.obstacles[0]!.point) - 0.5) < 1e-6);
      if (i % 20 === 19) await nextFrame(ctx.signal);
    }
    ctx.assert('owned-previous-result', true, first.position.equals(previous));
    ctx.unavailable('gpu-time', 'ms', 'cpu-camera-query', '카메라 충돌 CPU 검사이며 렌더링 FPS를 측정하지 않습니다.');
  } finally { scene.clear(); geometry.dispose(); material.dispose(); }
}

async function cameraSmoothing(ctx: ScenarioContext) {
  const scene = new Scene(); const geometry = new BoxGeometry(1, 4, 3); const material = new MeshBasicMaterial();
  const wall = new Mesh(geometry, material); wall.position.set(0, 0, 8); scene.add(wall); scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(wall); const intersection = new Vector3(); const ray = new Ray();
  const manager = new EntityStateManager(); const controller = new ThirdPersonController();
  let overlaps = 0; let obstructed = 0;
  try {
    for (const hz of [30, 60, 144]) {
      for (const focus of [false, true]) {
        const camera = new PerspectiveCamera(); camera.position.set(4, 0, 8);
        const state: CameraSystemState = { lastUpdate: 0, config: { mode: 'thirdPerson', distance: { x: 4, y: 0, z: -8 },
          enableCollision: true, collisionMargin: 0.25, zoom: 1, fov: 75, smoothing: { position: 0.5, rotation: 0.5, fov: 0.1 },
          focus, focusTarget: { x: 0, y: 0, z: 0 }, focusDistance: Math.sqrt(80), focusLerpSpeed: -Math.log(0.5) * 60 } };
        const props = { camera, scene, activeState: manager.getActiveState(), deltaTime: 1 / hz, clock: new Clock() };
        for (let step = 0; step < 120; step++) {
          checkAbort(ctx.signal);
          state.config.distance.x = step % 60 < 30 ? 4 : -4;
          state.config.focus = step < 60 ? focus : !focus;
          controller.update(props, state);
          const overlapping = bounds.distanceToPoint(camera.position) < 0.25 - 1e-6;
          ray.set(props.activeState.position, camera.position.clone().sub(props.activeState.position).normalize());
          const hit = ray.intersectBox(bounds, intersection);
          const blocked = !!hit && hit.distanceTo(props.activeState.position) < camera.position.distanceTo(props.activeState.position) - 1e-6;
          overlaps += Number(overlapping); obstructed += Number(blocked);
          ctx.assert(`camera-frame-${hz}-${focus}-${step}`, true, !overlapping && !blocked);
          if (step % 30 === 29) await nextFrame(ctx.signal);
        }
      }
    }
    ctx.sample('camera-interpolated-overlaps', overlaps, 'count', 'public-controller-frame-position');
    ctx.sample('camera-interpolated-view-blocks', obstructed, 'count', 'public-controller-frame-position');
    ctx.unavailable('gpu-time', 'ms', 'public-controller-frame-position', '실제 controller 위치와 독립 Box3/ray 기준을 대조하는 CPU 기능 검사입니다. 렌더링 FPS 검사가 아닙니다.');
  } finally { manager.dispose(); scene.clear(); geometry.dispose(); material.dispose(); }
}

async function cameraColliders(ctx: ScenarioContext) {
  const scene = new Scene(); const geometry = new BoxGeometry(1, 4, 3); const material = new MeshBasicMaterial();
  const wall = new Mesh(geometry, material); wall.position.set(0, 0, 8); wall.layers.enable(CAMERA_COLLIDER_LAYER); scene.add(wall);
  const count = ctx.config.count;
  for (let i = 0; i < count; i++) {
    const holder = new Group(); holder.position.set(20 + (i % 100) * 3, 0, Math.floor(i / 100) * 3);
    holder.add(new Mesh(geometry, material)); scene.add(holder);
  }
  const manager = new EntityStateManager();
  const lanes = (['scene', 'colliders'] as const).map((collisionTargets) => {
    const camera = new PerspectiveCamera(); camera.position.set(4, 0, 8);
    const state: CameraSystemState = { lastUpdate: 0, config: { mode: 'thirdPerson', distance: { x: 4, y: 0, z: -8 },
      enableCollision: true, collisionMargin: 0.25, collisionTargets, zoom: 1, fov: 75, smoothing: { position: 0.5, rotation: 0.5, fov: 0.1 } } };
    return { collisionTargets, camera, state, controller: new ThirdPersonController(),
      props: { camera, scene, activeState: manager.getActiveState(), deltaTime: 1 / 60, clock: new Clock() } };
  });
  try {
    for (let step = 0; step < 120; step++) {
      checkAbort(ctx.signal);
      for (const lane of step % 2 ? [...lanes].reverse() : lanes) {
        lane.state.config.distance.x = step % 60 < 30 ? 4 : -4;
        const started = performance.now();
        lane.controller.update(lane.props, lane.state);
        if (step >= 20) ctx.sample(`camera-${lane.collisionTargets}-targets-update`, performance.now() - started, 'ms', `cpu-${count}-off-path-meshes`);
      }
      ctx.assert(`same-frame-position-${step}`, true, lanes[0]!.camera.position.distanceTo(lanes[1]!.camera.position) < 1e-9);
      if (step % 30 === 29) await nextFrame(ctx.signal);
    }
    ctx.unavailable('gpu-time', 'ms', 'cpu-camera-query', 'collider 모드와 장면 모드의 controller CPU 비용 비교이며 렌더링 FPS를 측정하지 않습니다.');
  } finally { manager.dispose(); scene.clear(); geometry.dispose(); material.dispose(); }
}

export const spatialScenarios: Scenario[] = [
  { id: 'spatial-scale', title: '월드 경계 검색 규모', description: '실제 WorldSystem의 이동·충돌·최근접 광선을 선형 검색 기준과 비교합니다. 질의 32회 묶음 평균으로 타이머 해상도를 보완합니다.', version: 2, requirementIds: ['R04'], run: spatialScale },
  { id: 'camera-radius', title: '카메라 반경과 규모', description: '중심 광선이 빗나가는 장애물의 구 충돌과 반환값 소유권·장면 규모 비용을 검사합니다.', version: 1, requirementIds: ['R05'], run: cameraRadius },
  { id: 'camera-smoothing', title: '카메라 보간·포커스 충돌', description: '공개 ThirdPersonController의 실제 프레임 위치를 30/60/144Hz와 포커스 전환에서 검사합니다.', version: 2, requirementIds: ['R05'], run: cameraSmoothing },
  { id: 'camera-colliders', title: '카메라 collider 대상 비용', description: 'collisionTargets colliders와 scene 모드가 같은 프레임 위치를 내는지 확인하고 경로 밖 메시 규모에 따른 controller 비용을 비교합니다.', version: 1, requirementIds: ['R05'], run: cameraColliders },
];
