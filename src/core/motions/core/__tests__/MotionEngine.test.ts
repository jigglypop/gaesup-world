import * as THREE from 'three';
import { MotionEngine, MotionConfig } from '../MotionEngine';

describe('MotionEngine', () => {
  let engine: MotionEngine;
  const initialConfig: Partial<MotionConfig> = {
    maxSpeed: 10,
    acceleration: 20,
    gravity: -50
  };

  beforeEach(() => {
    engine = new MotionEngine('character', initialConfig);
  });

  it('초기화 시 state, config, metrics가 올바르게 설정되어야 합니다.', () => {
    const state = engine.getState();
    const config = engine.getConfig();

    expect(state.position).toEqual(new THREE.Vector3(0, 0, 0));
    expect(state.velocity).toEqual(new THREE.Vector3(0, 0, 0));
    expect(state.isGrounded).toBe(false);
    expect(config.maxSpeed).toBe(10);
    expect(config.acceleration).toBe(20);
    expect(config.gravity).toBe(-50);
  });

  it('updatePosition은 위치를 올바르게 갱신해야 합니다.', () => {
    const newPosition = new THREE.Vector3(1, 2, 3);
    engine.updatePosition(newPosition);
    expect(engine.getState().position).toEqual(newPosition);
  });

  it('updateVelocity는 속도와 isMoving 상태를 올바르게 갱신해야 합니다.', () => {
    const newVelocity = new THREE.Vector3(5, 0, 0);
    engine.updateVelocity(newVelocity);
    const state = engine.getState();
    expect(state.velocity).toEqual(newVelocity);
    expect(state.speed).toBe(5);
    expect(state.isMoving).toBe(true);

    engine.updateVelocity(new THREE.Vector3(0, 0, 0));
    expect(engine.getState().isMoving).toBe(false);
  });

  it('calculateMovement는 입력에 따라 올바른 이동 벡터를 계산해야 합니다.', () => {
    const deltaTime = 0.1;
    const forwardMovement = engine.calculateMovement(
      { forward: true, backward: false, leftward: false, rightward: false, shift: false, space: false },
      deltaTime
    );
    expect(forwardMovement.z).toBeLessThan(0);
    
    const runMovement = engine.calculateMovement(
      { forward: true, backward: false, leftward: false, rightward: false, shift: true, space: false },
      deltaTime
    );
    expect(runMovement.z).toBe(forwardMovement.z * 2);
  });

  it('calculateJump는 grounded 상태에서만 점프 벡터를 반환해야 합니다.', () => {
    const jumpVectorGrounded = engine.calculateJump();
    expect(jumpVectorGrounded.y).toBe(0);

    engine.setGrounded(true);
    const jumpVectorNotGrounded = engine.calculateJump();
    expect(jumpVectorNotGrounded.y).toBe(initialConfig.jumpForce || 12);
  });

  it('updateConfig는 설정을 올바르게 갱신해야 합니다.', () => {
    engine.updateConfig({ maxSpeed: 20, turnSpeed: 5 });
    const config = engine.getConfig();
    expect(config.maxSpeed).toBe(20);
    expect(config.turnSpeed).toBe(5);
    expect(config.acceleration).toBe(20); 
  });

  it('reset은 모든 상태와 메트릭을 초기화해야 합니다.', () => {
    engine.updatePosition(new THREE.Vector3(10, 10, 10));
    engine.reset();
    const state = engine.getState();
    const metrics = engine.getMetrics();
    expect(state.position).toEqual(new THREE.Vector3(0, 0, 0));
    expect(metrics.totalDistance).toBe(0);
  });
}); 