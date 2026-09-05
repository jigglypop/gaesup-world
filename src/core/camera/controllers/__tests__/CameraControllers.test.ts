import 'reflect-metadata';
import * as THREE from 'three';

import { BaseController } from '../BaseController';
import { FirstPersonController } from '../FirstPersonController';
import { SideScrollController } from '../SideScrollController';
import { TopDownController } from '../TopDownController';
import type { CameraCalcProps, CameraSystemConfig, CameraSystemState } from '../../core/types';
import type { ActiveStateType } from '../../../motions/core/types';

class TestController extends BaseController {
  name = 'test';
  defaultConfig: Partial<CameraSystemConfig> = {
    distance: { x: 15, y: 8, z: 15 },
    enableCollision: false,
    smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
  };

  private target = new THREE.Vector3();

  calculateTargetPosition(props: CameraCalcProps, state: CameraSystemState): THREE.Vector3 {
    const position = props.activeState.position;
    const distance = state.config.distance;
    const zoom = state.config.zoom ?? 1;
    return this.target.set(
      position.x - distance.x * zoom,
      position.y + distance.y * zoom,
      position.z - distance.z * zoom,
    );
  }
}

const createActiveState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(0, 1, 0),
  quaternion: new THREE.Quaternion(),
  isGround: true,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(0, 0, 1),
  dir: new THREE.Vector3(0, 0, 1),
  angular: new THREE.Vector3(),
});

const createConfig = (overrides: Partial<CameraSystemConfig> = {}): CameraSystemConfig => ({
  mode: 'thirdPerson',
  distance: { x: 15, y: 8, z: 15 },
  enableCollision: false,
  smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
  fov: 75,
  zoom: 1,
  ...overrides,
});

const createState = (config: CameraSystemConfig): CameraSystemState => ({
  config,
  lastUpdate: Date.now(),
});

const createProps = (): CameraCalcProps => ({
  camera: new THREE.PerspectiveCamera(75, 1, 0.1, 1000),
  scene: new THREE.Scene(),
  deltaTime: 0.016,
  activeState: createActiveState(),
  clock: new THREE.Clock(),
});

const addBlockingMesh = (scene: THREE.Scene) => {
  const blocker = new THREE.Mesh(
    new THREE.BoxGeometry(6, 6, 6),
    new THREE.MeshBasicMaterial(),
  );
  blocker.position.set(-5, 4, -5);
  blocker.geometry.computeBoundingSphere();
  scene.add(blocker);
  scene.updateMatrixWorld(true);
  return blocker;
};

const addSelfMesh = (scene: THREE.Scene) => {
  const self = new THREE.Mesh(
    new THREE.BoxGeometry(2, 3, 2),
    new THREE.MeshBasicMaterial(),
  );
  self.position.set(0, 1.5, 0);
  self.geometry.computeBoundingSphere();
  scene.add(self);
  scene.updateMatrixWorld(true);
  return self;
};

const runControllerFrames = (
  controller: BaseController,
  frameCount: number,
  deltaTime: number,
  config: CameraSystemConfig,
) => {
  const props = createProps();
  props.deltaTime = deltaTime;

  for (let i = 0; i < frameCount; i++) {
    controller.update(props, createState(config));
  }

  return props;
};

describe('BaseController', () => {
  it('smoothing.position 값이 클수록 목표 위치에 더 빨리 접근해야 합니다', () => {
    const controller = new TestController();
    const slowProps = createProps();
    const fastProps = createProps();

    controller.update(slowProps, createState(createConfig({
      smoothing: { position: 0.02, rotation: 0.1, fov: 0.1 },
    })));
    controller.update(fastProps, createState(createConfig({
      smoothing: { position: 0.2, rotation: 0.1, fov: 0.1 },
    })));

    expect(fastProps.camera.position.length()).toBeGreaterThan(slowProps.camera.position.length());
  });

  it('enableCollision이 켜져 있으면 장애물 앞 위치로 보정해야 합니다', () => {
    const controller = new TestController();
    const blockedProps = createProps();
    const clearProps = createProps();
    addBlockingMesh(blockedProps.scene);
    addBlockingMesh(clearProps.scene);

    controller.update(blockedProps, createState(createConfig({
      enableCollision: true,
      collisionMargin: 0.5,
    })));
    controller.update(clearProps, createState(createConfig({
      enableCollision: false,
    })));

    expect(blockedProps.camera.position.length()).toBeLessThan(clearProps.camera.position.length());
  });

  it('카메라 충돌은 타깃 바로 근처의 자기 모델을 장애물로 보지 않아야 합니다', () => {
    const controller = new TestController();
    const selfProps = createProps();
    const clearProps = createProps();
    addSelfMesh(selfProps.scene);

    controller.update(selfProps, createState(createConfig({
      enableCollision: true,
      collisionMargin: 0.5,
    })));
    controller.update(clearProps, createState(createConfig({
      enableCollision: false,
    })));

    expect(selfProps.camera.position.length()).toBeCloseTo(clearProps.camera.position.length(), 5);
  });

  it('같은 scene에 장애물이 나중에 추가되어도 충돌 후보를 다시 확인해야 합니다', () => {
    const controller = new TestController();
    const clearProps = createProps();
    const blockedProps = createProps();
    blockedProps.scene = clearProps.scene;

    controller.update(clearProps, createState(createConfig({
      enableCollision: true,
      collisionMargin: 0.5,
    })));

    addBlockingMesh(blockedProps.scene);
    controller.update(blockedProps, createState(createConfig({
      enableCollision: true,
      collisionMargin: 0.5,
    })));

    expect(blockedProps.camera.position.length()).toBeLessThan(clearProps.camera.position.length());
  });

  it('focus 진입 시 기본 컨트롤러 방향을 현재 카메라 위치보다 우선해야 합니다', () => {
    const controller = new TestController();
    const props = createProps();
    props.camera.position.copy(props.activeState.position);

    controller.update(props, createState(createConfig({
      focus: true,
      focusTarget: { x: 0, y: 1, z: 0 },
      focusDistance: 10,
      focusLerpSpeed: 10,
    })));

    expect(props.camera.position.x).toBeLessThan(0);
    expect(props.camera.position.z).toBeLessThan(0);
  });

  it('FOV 보간은 프레임 수보다 경과 시간에 맞춰 진행되어야 합니다', () => {
    const config = createConfig({
      fov: 45,
      smoothing: { position: 0.1, rotation: 0.1, fov: 0.1 },
    });
    const sixtyFpsProps = runControllerFrames(new TestController(), 60, 1 / 60, config);
    const thirtyFpsProps = runControllerFrames(new TestController(), 30, 1 / 30, config);

    expect((sixtyFpsProps.camera as THREE.PerspectiveCamera).fov).toBeCloseTo(
      (thirtyFpsProps.camera as THREE.PerspectiveCamera).fov,
      1,
    );
  });
});

describe('TopDownController', () => {
  it('오비트가 없으면 플레이어 바로 위를 목표 위치로 사용해야 합니다', () => {
    const controller = new TopDownController();
    const props = createProps();
    const target = controller.calculateTargetPosition(props, createState(createConfig({
      mode: 'topDown',
      distance: { x: 0, y: 30, z: 0 },
    })));

    expect(target.x).toBeCloseTo(0);
    expect(target.y).toBeCloseTo(31);
    expect(target.z).toBeCloseTo(0);
  });

  it('오비트 pitch/yaw가 있으면 수직 topDown 위치에서 벗어나야 합니다', () => {
    const controller = new TopDownController();
    const props = createProps();
    const target = controller.calculateTargetPosition(props, createState(createConfig({
      mode: 'topDown',
      distance: { x: 0, y: 30, z: 0 },
      orbitPitch: 0.45,
      orbitYaw: 0.7,
    })));

    expect(Math.abs(target.x)).toBeGreaterThan(0);
    expect(Math.abs(target.z)).toBeGreaterThan(0);
    expect(target.y).toBeGreaterThan(1);
  });
});

describe('FirstPersonController', () => {
  it('카메라를 플레이어 위치보다 위와 전방에 둬 모델 내부 시야를 피해야 합니다', () => {
    const controller = new FirstPersonController();
    const props = createProps();
    const target = controller.calculateTargetPosition(props, createState(createConfig({
      mode: 'firstPerson',
      distance: { x: 0, y: 2.0, z: 0.45 },
    })));

    expect(target.y).toBeGreaterThan(props.activeState.position.y);
    expect(target.z).toBeLessThan(props.activeState.position.z);
  });

  it('lookAt은 보정된 눈 위치 기준 전방을 바라봐야 합니다', () => {
    const controller = new FirstPersonController();
    const props = createProps();
    const state = createState(createConfig({
      mode: 'firstPerson',
      distance: { x: 0, y: 2.0, z: 0.45 },
    }));
    const target = controller.calculateTargetPosition(props, state);
    const lookAt = controller.calculateLookAt(props, state);

    expect(lookAt.y).toBeCloseTo(target.y);
    expect(lookAt.z).toBeLessThan(target.z);
  });
});

describe('SideScrollController', () => {
  it('플레이어 x/y를 따라가고 z는 플레이어 기준 뒤쪽 오프셋을 사용해야 합니다', () => {
    const controller = new SideScrollController();
    const props = createProps();
    props.activeState.position.set(3, 1, 7);
    const target = controller.calculateTargetPosition(props, createState(createConfig({
      mode: 'sideScroll',
      distance: { x: 0, y: 5, z: 18 },
    })));

    expect(target.x).toBeCloseTo(3);
    expect(target.y).toBeCloseTo(6);
    expect(target.z).toBeCloseTo(25);
  });
});
