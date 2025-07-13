import { MotionSystem } from '../system/MotionSystem';
import * as THREE from 'three';
import { GameStatesType } from '@core/world/components/Rideable/types';
import { ActiveStateType } from '../types';
import { PhysicsConfigType } from '@stores/slices/physics/types';

describe('MotionSystem', () => {
  let motionSystem: MotionSystem;
  let mockActiveState: ActiveStateType;
  let mockGameStates: GameStatesType;
  let mockConfig: PhysicsConfigType;

  beforeEach(() => {
    motionSystem = new MotionSystem({ type: 'character' });
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
    motionSystem.updatePosition(newPosition, mockActiveState);
    expect(motionSystem.getState().position).toEqual(newPosition);
    expect(mockActiveState.position).toEqual(newPosition);
  });

  it('updateVelocity는 속도와 움직임 상태를 업데이트해야 합니다.', () => {
    const newVelocity = new THREE.Vector3(1, 0, 0);
    motionSystem.updateVelocity(newVelocity, mockActiveState, mockGameStates);
    expect(motionSystem.getState().velocity).toEqual(newVelocity);
    expect(motionSystem.getState().isMoving).toBe(true);
    expect(mockActiveState.velocity).toEqual(newVelocity);
    expect(mockGameStates.isMoving).toBe(true);
  });

  it('calculateMovement는 입력에 따라 이동 벡터를 계산해야 합니다.', () => {
    const input = { forward: true, backward: false, leftward: false, rightward: true, shift: true, space: false };
    const movement = motionSystem.calculateMovement(input, mockConfig, mockGameStates, 0.016);
    expect(movement.length()).toBeGreaterThan(0);
    expect(mockGameStates.isRunning).toBe(true);
  });

  it('calculateJump는 점프 벡터를 계산해야 합니다.', () => {
    motionSystem.setGrounded(true, mockActiveState, mockGameStates);
    const jumpVector = motionSystem.calculateJump(mockConfig, mockGameStates);
    expect(jumpVector.y).toBe(mockConfig.jumpForce);
    expect(mockGameStates.isJumping).toBe(true);
  });
}); 