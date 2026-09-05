import 'reflect-metadata';
import * as THREE from 'three';

import { MotionService } from '../MotionService';
import type { GameStatesType } from '@core/world/components/Rideable/types';

describe('MotionService', () => {
  let service: MotionService;

  beforeEach(() => {
    service = new MotionService();
  });

  describe('calculateMovementForce', () => {
    it('이동 방향과 속도에 따른 힘을 계산해야 합니다', () => {
      const movement = new THREE.Vector3(0, 0, 1);
      const currentVelocity = new THREE.Vector3(0, 0, 0);
      const config = { maxSpeed: 10, acceleration: 5 };

      const force = service.calculateMovementForce(movement, currentVelocity, config);
      expect(force.z).toBeGreaterThan(0);
    });

    it('movement가 zero이면 감속 방향 힘을 반환해야 합니다', () => {
      const movement = new THREE.Vector3(0, 0, 0);
      const currentVelocity = new THREE.Vector3(5, 0, 0);
      const config = { maxSpeed: 10, acceleration: 5 };

      const force = service.calculateMovementForce(movement, currentVelocity, config);
      expect(force.x).toBeLessThan(0);
    });

    it('out 파라미터로 할당 없이 결과를 받을 수 있어야 합니다', () => {
      const out = new THREE.Vector3();
      const movement = new THREE.Vector3(1, 0, 0);
      const currentVelocity = new THREE.Vector3(0, 0, 0);
      const config = { maxSpeed: 10, acceleration: 5 };

      const result = service.calculateMovementForce(movement, currentVelocity, config, out);
      expect(result).toBe(out);
      expect(out.length()).toBeGreaterThan(0);
    });

    it('입력 벡터를 mutate하지 않아야 합니다', () => {
      const movement = new THREE.Vector3(3, 0, 4);
      const originalLength = movement.length();
      const config = { maxSpeed: 10, acceleration: 5 };

      service.calculateMovementForce(movement, new THREE.Vector3(), config);
      expect(movement.length()).toBeCloseTo(originalLength, 5);
    });
  });

  describe('calculateJumpForce', () => {
    it('지면에 있을 때 점프 힘을 반환해야 합니다', () => {
      const result = service.calculateJumpForce(true, 12);
      expect(result.y).toBe(12);
      expect(result.x).toBe(0);
      expect(result.z).toBe(0);
    });

    it('공중에 있을 때 zero를 반환해야 합니다', () => {
      const result = service.calculateJumpForce(false, 12);
      expect(result.length()).toBe(0);
    });

    it('isJumping 상태이면 1.5배 점프해야 합니다', () => {
      const gameStates = { isJumping: true } as GameStatesType;
      const result = service.calculateJumpForce(true, 10, gameStates);
      expect(result.y).toBe(15);
    });

    it('out 파라미터로 할당 없이 결과를 받을 수 있어야 합니다', () => {
      const out = new THREE.Vector3();
      const result = service.calculateJumpForce(true, 10, undefined, out);
      expect(result).toBe(out);
    });
  });

  describe('calculateGroundState', () => {
    it('지면 가까이 + 수직 속도 작으면 true', () => {
      const pos = new THREE.Vector3(0, 0.05, 0);
      const vel = new THREE.Vector3(1, 0.05, 0);
      expect(service.calculateGroundState(pos, vel)).toBe(true);
    });

    it('높이 있으면 false', () => {
      const pos = new THREE.Vector3(0, 5, 0);
      const vel = new THREE.Vector3(0, 0, 0);
      expect(service.calculateGroundState(pos, vel)).toBe(false);
    });

    it('수직 속도 크면 false', () => {
      const pos = new THREE.Vector3(0, 0.05, 0);
      const vel = new THREE.Vector3(0, 5, 0);
      expect(service.calculateGroundState(pos, vel)).toBe(false);
    });
  });

  describe('calculateSpeed', () => {
    it('xz 평면에서의 속도를 계산해야 합니다', () => {
      const vel = new THREE.Vector3(3, 100, 4);
      expect(service.calculateSpeed(vel)).toBeCloseTo(5, 5);
    });

    it('zero 벡터면 0을 반환해야 합니다', () => {
      expect(service.calculateSpeed(new THREE.Vector3())).toBe(0);
    });
  });

  describe('calculateDirection', () => {
    it('두 점 사이의 정규화된 방향을 반환해야 합니다', () => {
      const from = new THREE.Vector3(0, 0, 0);
      const to = new THREE.Vector3(10, 0, 0);
      const dir = service.calculateDirection(from, to);
      expect(dir.x).toBeCloseTo(1, 5);
      expect(dir.length()).toBeCloseTo(1, 5);
    });

    it('out 파라미터를 지원해야 합니다', () => {
      const out = new THREE.Vector3();
      const result = service.calculateDirection(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 5),
        out,
      );
      expect(result).toBe(out);
    });
  });

  describe('applyDamping', () => {
    it('속도에 damping을 적용해야 합니다', () => {
      const vel = new THREE.Vector3(10, 0, 0);
      const result = service.applyDamping(vel, 0.5);
      expect(result.x).toBeCloseTo(5, 5);
    });

    it('기본 damping은 0.95', () => {
      const vel = new THREE.Vector3(10, 0, 0);
      const result = service.applyDamping(vel);
      expect(result.x).toBeCloseTo(9.5, 5);
    });
  });

  describe('limitVelocity', () => {
    it('maxSpeed를 초과하면 제한해야 합니다', () => {
      const vel = new THREE.Vector3(100, 5, 0);
      service.limitVelocity(vel, 10);
      expect(service.calculateSpeed(vel)).toBeCloseTo(10, 3);
    });

    it('maxSpeed 이하면 변경하지 않아야 합니다', () => {
      const vel = new THREE.Vector3(3, 0, 4);
      service.limitVelocity(vel, 100);
      expect(vel.x).toBeCloseTo(3, 5);
      expect(vel.z).toBeCloseTo(4, 5);
    });

    it('y 성분은 변경하지 않아야 합니다', () => {
      const vel = new THREE.Vector3(100, 50, 0);
      service.limitVelocity(vel, 10);
      expect(vel.y).toBe(50);
    });
  });

  describe('calculateRotationToTarget', () => {
    it('양의 x 방향 타겟의 각도를 계산해야 합니다', () => {
      const current = new THREE.Vector3(0, 0, 0);
      const target = new THREE.Vector3(1, 0, 0);
      const angle = service.calculateRotationToTarget(current, target);
      expect(angle).toBeCloseTo(Math.PI / 2, 3);
    });

    it('양의 z 방향 타겟의 각도는 0', () => {
      const current = new THREE.Vector3(0, 0, 0);
      const target = new THREE.Vector3(0, 0, 1);
      const angle = service.calculateRotationToTarget(current, target);
      expect(angle).toBeCloseTo(0, 3);
    });
  });

  describe('smoothRotation', () => {
    it('현재 각도에서 목표 각도를 향해 보간해야 합니다', () => {
      const result = service.smoothRotation(0, Math.PI, 0.5);
      expect(result).toBeCloseTo(Math.PI * 0.5, 3);
    });

    it('PI 경계를 넘는 회전을 올바르게 처리해야 합니다', () => {
      const result = service.smoothRotation(Math.PI * 0.9, -Math.PI * 0.9, 0.5);
      const expected = Math.PI * 0.9 + (Math.PI * 0.2) * 0.5;
      expect(result).toBeCloseTo(expected, 2);
    });
  });

  describe('getDefaultConfig', () => {
    it('기본 설정을 반환해야 합니다', () => {
      const config = service.getDefaultConfig();
      expect(config.maxSpeed).toBe(10);
      expect(config.acceleration).toBe(5);
      expect(config.jumpForce).toBe(12);
    });
  });
});
