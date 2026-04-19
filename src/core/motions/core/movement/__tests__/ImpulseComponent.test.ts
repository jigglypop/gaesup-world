import * as THREE from 'three';

import { EntityStateManager } from '@core/motions/core/system/EntityStateManager';
import { ImpulseComponent } from '@core/motions/core/movement/ImpulseComponent';
import { PhysicsState } from '@core/motions/types';
import { PhysicsConfigType } from '@stores/slices/physics/types';
import { InteractionSystem } from '@core/interactions/core/InteractionSystem';

jest.mock('@core/interactions/core/InteractionSystem');

type RBStub = {
  linvel: () => { x: number; y: number; z: number };
  setLinvel: jest.Mock;
  applyImpulse: jest.Mock;
  mass: () => number;
};

const buildRigidBodyRef = (): { current: RBStub } => {
  const linvel = { x: 0, y: 0, z: 0 };
  return {
    current: {
      linvel: () => linvel,
      setLinvel: jest.fn((next: { x: number; y: number; z: number }) => {
        linvel.x = next.x;
        linvel.y = next.y;
        linvel.z = next.z;
      }),
      applyImpulse: jest.fn(),
      mass: () => 1,
    },
  };
};

const buildPhysicsStateFrom = (manager: EntityStateManager): PhysicsState => ({
  modeType: 'character',
  activeState: manager.getActiveState(),
  gameStates: manager.getGameStates(),
  keyboard: { space: false, shift: false, forward: false, backward: false, leftward: false, rightward: false, keyZ: false, keyR: false, keyF: false, keyE: false, escape: false } as PhysicsState['keyboard'],
  mouse: { isLookAround: false, isActive: false, shouldRun: false, target: new THREE.Vector3(), angle: 0, buttons: { left: false, right: false, middle: false }, wheel: 0, position: new THREE.Vector2() } as PhysicsState['mouse'],
  delta: 0.016,
});

describe('ImpulseComponent와 EntityStateManager 동일 인스턴스 주입', () => {
  beforeEach(() => {
    (InteractionSystem.getInstance as jest.Mock).mockReturnValue({
      getKeyboardRef: () => ({ shift: false, space: false, forward: false, backward: false, leftward: false, rightward: false }),
      getMouseRef: () => ({ isLookAround: false, isActive: false, shouldRun: false }),
    });
  });

  test('주입한 stateManager가 점프 후 isOnTheGround false로 갱신된다', () => {
    const sharedManager = new EntityStateManager();
    sharedManager.updateGameStates({ isJumping: true, isOnTheGround: true });

    const config: PhysicsConfigType = { jumpSpeed: 15 } as PhysicsConfigType;
    const impulse = new ImpulseComponent(config, sharedManager);
    const rigidBodyRef = buildRigidBodyRef();
    const physicsState = buildPhysicsStateFrom(sharedManager);

    impulse.applyImpulse(rigidBodyRef as unknown as Parameters<typeof impulse.applyImpulse>[0], physicsState);

    expect(sharedManager.getGameStates().isOnTheGround).toBe(false);
  });

  test('stateManager 미주입 시 자체 인스턴스를 만들어 외부 상태에 영향을 주지 않는다 (하위 호환)', () => {
    const externalManager = new EntityStateManager();
    externalManager.updateGameStates({ isJumping: true, isOnTheGround: true });

    const config: PhysicsConfigType = { jumpSpeed: 15 } as PhysicsConfigType;
    const impulse = new ImpulseComponent(config);
    const rigidBodyRef = buildRigidBodyRef();
    const physicsState = buildPhysicsStateFrom(externalManager);

    impulse.applyImpulse(rigidBodyRef as unknown as Parameters<typeof impulse.applyImpulse>[0], physicsState);

    expect(externalManager.getGameStates().isOnTheGround).toBe(true);
  });
});
