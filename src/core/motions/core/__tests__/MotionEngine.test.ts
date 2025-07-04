import { MotionEngine } from '../engine/MotionEngine';
import * as THREE from 'three';
import { GameStatesType } from '@core/world/components/Rideable/types';
import { ActiveStateType } from '../types';
import { PhysicsConfigType } from '@stores/slices/physics/types';

describe('MotionEngine', () => {
  let motionEngine: MotionEngine;
  let mockActiveState: ActiveStateType;
  let mockGameStates: GameStatesType;
  let mockConfig: PhysicsConfigType;

  beforeEach(() => {
    motionEngine = new MotionEngine('character');
    mockActiveState = {
      position: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      euler: new THREE.Euler(),
      isGround: false,
    } as ActiveStateType;
    mockGameStates = {
      isMoving: false,
      isNotMoving: true,
      isRunning: false,
      isNotRunning: true,
      isOnTheGround: false,
      isJumping: false,
    } as GameStatesType;
    mockConfig = {
      maxSpeed: 10,
      jumpForce: 12,
    };
  });

  it('updatePosition은 위치를 업데이트해야 합니다.', () => {
    const newPosition = new THREE.Vector3(1, 2, 3);
    motionEngine.updatePosition(newPosition, mockActiveState);
    expect(motionEngine.getState().position).toEqual(newPosition);
    expect(mockActiveState.position).toEqual(newPosition);
  });

  it('updateVelocity는 속도와 움직임 상태를 업데이트해야 합니다.', () => {
    const newVelocity = new THREE.Vector3(1, 0, 0);
    motionEngine.updateVelocity(newVelocity, mockActiveState, mockGameStates);
    expect(motionEngine.getState().velocity).toEqual(newVelocity);
    expect(motionEngine.getState().isMoving).toBe(true);
    expect(mockActiveState.velocity).toEqual(newVelocity);
    expect(mockGameStates.isMoving).toBe(true);
  });

  it('calculateMovement는 입력에 따라 이동 벡터를 계산해야 합니다.', () => {
    const input = { forward: true, backward: false, leftward: false, rightward: true, shift: true, space: false };
    const movement = motionEngine.calculateMovement(input, mockConfig, mockGameStates, 0.016);
    expect(movement.length()).toBeGreaterThan(0);
    expect(mockGameStates.isRunning).toBe(true);
  });

  it('calculateJump는 점프 벡터를 계산해야 합니다.', () => {
    motionEngine.setGrounded(true, mockActiveState, mockGameStates);
    const jumpVector = motionEngine.calculateJump(mockConfig, mockGameStates);
    expect(jumpVector.y).toBe(mockConfig.jumpForce);
    expect(mockGameStates.isJumping).toBe(true);
  });
}); 