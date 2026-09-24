import * as THREE from 'three';

import { CAMERA_CONSTANTS, cameraUtils, resolveCollisionPosition } from '../camera';

const SIXTY_FPS = 1 / 60;

describe('cameraUtils 경계값', () => {
  test('스무딩 값은 누락·비정상 값을 기본 속도로, 0 이하를 정지로, 1 이상을 속도 그대로 해석한다', () => {
    expect(cameraUtils.smoothingToSpeed(undefined)).toBe(CAMERA_CONSTANTS.FRAME_RATE_LERP_SPEED);
    expect(cameraUtils.smoothingToSpeed(Number.NaN, 3)).toBe(3);
    expect(cameraUtils.smoothingToSpeed(0)).toBe(0);
    expect(cameraUtils.smoothingToSpeed(-1)).toBe(0);
    expect(cameraUtils.smoothingToSpeed(12)).toBe(12);
    expect(cameraUtils.smoothingToSpeed(0.5)).toBeCloseTo(-Math.log(0.5) / SIXTY_FPS);
  });

  test('60fps 프레임당 보간 비율은 스무딩 값과 같고 프레임 수가 달라도 같은 시간 뒤 같은 위치에 도달한다', () => {
    const speed = cameraUtils.smoothingToSpeed(0.2);
    const oneFrame = new THREE.Vector3();
    cameraUtils.frameRateIndependentLerpVector3(oneFrame, new THREE.Vector3(10, 0, 0), speed, SIXTY_FPS);
    expect(oneFrame.x).toBeCloseTo(2);

    const coarse = new THREE.Vector3();
    const fine = new THREE.Vector3();
    const target = new THREE.Vector3(10, 4, -6);
    cameraUtils.frameRateIndependentLerpVector3(coarse, target, speed, SIXTY_FPS * 2);
    cameraUtils.frameRateIndependentLerpVector3(fine, target, speed, SIXTY_FPS);
    cameraUtils.frameRateIndependentLerpVector3(fine, target, speed, SIXTY_FPS);
    expect(fine.distanceTo(coarse)).toBeLessThan(1e-9);
  });

  test('높이 경계 0도 유효한 경계로 적용한다', () => {
    expect(cameraUtils.clampPosition(new THREE.Vector3(0, -2, 0), { minY: 0 }).y).toBe(0);
    expect(cameraUtils.clampPosition(new THREE.Vector3(0, 3, 0), { maxY: 0 }).y).toBe(0);
    expect(cameraUtils.clampPosition(new THREE.Vector3(0, 3, 0)).y).toBe(3);
    expect(cameraUtils.isPositionValid(new THREE.Vector3(0, -0.1, 0), { minY: 0 })).toBe(false);
    expect(cameraUtils.isPositionValid(new THREE.Vector3(0, 0, 0), { minY: 0, maxY: 0 })).toBe(true);
  });

  test('시작점과 끝점이 같으면 충돌 검사를 하지 않고 안전한 원래 위치를 돌려준다', () => {
    const point = new THREE.Vector3(1, 2, 3);
    const result = cameraUtils.improvedCollisionCheck(point, point, new THREE.Scene());
    expect(result.safe).toBe(true);
    expect(result.position.toArray()).toEqual([1, 2, 3]);
    expect(result.obstacles).toHaveLength(0);
  });
});

describe('resolveCollisionPosition', () => {
  const from = new THREE.Vector3();
  const to = new THREE.Vector3(0, 0, 10);

  function sceneWithBoxAt(z: number): THREE.Scene {
    const scene = new THREE.Scene();
    const box = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 1), new THREE.MeshBasicMaterial());
    box.position.z = z;
    scene.add(box);
    return scene;
  }

  test('공개 충돌 검사와 같은 위치를 out에 쓴다', () => {
    const blocked = sceneWithBoxAt(3);
    const out = new THREE.Vector3();
    expect(resolveCollisionPosition(from, to, blocked, 0.5, undefined, out)).toBe(out);
    expect(out.toArray()).toEqual(cameraUtils.improvedCollisionCheck(from, to, blocked).position.toArray());
    resolveCollisionPosition(from, to, new THREE.Scene(), 0.5, undefined, out);
    expect(out.toArray()).toEqual([0, 0, 10]);
  });

  test('막혀도 장애물 점을 복제하지 않고 목표 벡터 자체를 out으로 받을 수 있다', () => {
    const scene = sceneWithBoxAt(3);
    const target = to.clone();
    const clone = jest.spyOn(THREE.Vector3.prototype, 'clone');
    try {
      cameraUtils.improvedCollisionCheck(from, to, scene);
      const ownedResultClones = clone.mock.calls.length;
      clone.mockClear();
      resolveCollisionPosition(from, target, scene, 0.5, undefined, target);
      expect(clone.mock.calls.length).toBeLessThan(ownedResultClones);
    } finally {
      clone.mockRestore();
    }
    expect(target.z).toBeCloseTo(2);
  });
});
