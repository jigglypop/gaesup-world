import * as THREE from 'three';

import { DirectionComponent } from '@core/motions/core/movement/DirectionComponent';
import type { ActiveStateType } from '@core/motions/core/types';
import type { PhysicsCalcProps, PhysicsState } from '@core/motions/types';
import { threeObjectPool } from '@utils/objectPool';

const createActiveState = (): ActiveStateType => ({
  euler: new THREE.Euler(),
  position: new THREE.Vector3(),
  quaternion: new THREE.Quaternion(),
  isGround: false,
  velocity: new THREE.Vector3(),
  direction: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  angular: new THREE.Vector3(),
});

describe('DirectionComponent with Object Pooling', () => {
  let component: DirectionComponent;
  
  beforeEach(() => {
    component = new DirectionComponent();
    threeObjectPool.clear();
  });
  
  afterEach(() => {
    component.dispose();
    threeObjectPool.clear();
  });
  
  describe('객체 풀링 성능', () => {
    it('applyAirplaneRotation이 객체 풀을 사용해야 함', () => {
      const innerGroup = new THREE.Group();
      const maxAngle = { x: 1, y: 1, z: 1 };
      const activeState = createActiveState();

      component['applyAirplaneRotation'](innerGroup, 1, 1, maxAngle, activeState);
      
      const finalStats = threeObjectPool.getStats();
      
      expect(finalStats.euler.inUse).toBe(0);
      expect(finalStats.quaternion.inUse).toBe(0);
    });
    
    it('handleMouseDirection이 메모리 누수 없이 작동해야 함', () => {
      const activeState = createActiveState();
      const mouse: PhysicsState['mouse'] = {
        target: new THREE.Vector3(10, 0, 10),
        angle: Math.PI / 4,
        isActive: true,
        shouldRun: false,
      };
      const calcProp = {
        rigidBodyRef: {
          current: {
            translation: () => ({ x: 0, y: 0, z: 0 }),
          },
        },
        setMouseInput: jest.fn(),
      } as unknown as PhysicsCalcProps;

      component['handleMouseDirection'](activeState, mouse, {}, calcProp);

      const finalStats = threeObjectPool.getStats();
      expect(finalStats.vector3.inUse).toBe(0);
    });
  });
  
  describe('동일한 결과 보장', () => {
    it('객체 풀 사용 전후 결과가 동일해야 함', () => {
      const maxAngle = { x: 1, y: 1, z: 1 };

      const referenceGroup = new THREE.Group();
      const referenceState = createActiveState();
      new DirectionComponent()['applyAirplaneRotation'](referenceGroup, 1, 1, maxAngle, referenceState);

      // Dirty the reused scratch objects before the compared call.
      component['applyAirplaneRotation'](new THREE.Group(), -1, -1, maxAngle, createActiveState());

      const innerGroup = new THREE.Group();
      const activeState = createActiveState();
      component['applyAirplaneRotation'](innerGroup, 1, 1, maxAngle, activeState);

      expect(innerGroup.quaternion.toArray()).toEqual(referenceGroup.quaternion.toArray());
      expect(activeState.euler.x).toBe(referenceState.euler.x);
      expect(activeState.euler.z).toBe(referenceState.euler.z);
    });
  });
});
