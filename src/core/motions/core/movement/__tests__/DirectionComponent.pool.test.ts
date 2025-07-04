import { DirectionComponent } from '@core/motions/core/movement/DirectionComponent';
import { threeObjectPool } from '@utils/objectPool';
import * as THREE from 'three';

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
      const activeState = { euler: { x: 0, z: 0 } } as any;

      const initialPoolSize = threeObjectPool.getStats();
      
      (component as any).applyAirplaneRotation(innerGroup, 1, 1, maxAngle, activeState);
      
      const finalStats = threeObjectPool.getStats();
      
      expect(finalStats.euler.inUse).toBe(0);
      expect(finalStats.quaternion.inUse).toBe(0);
    });
    
    it('handleMouseDirection이 메모리 누수 없이 작동해야 함', () => {
      const activeState = {
        dir: new THREE.Vector3(),
        direction: new THREE.Vector3(),
        euler: new THREE.Euler(),
      } as any;
      const mouse = {
        target: new THREE.Vector3(10, 0, 10),
        angle: Math.PI / 4,
        isActive: true
      } as any;
      const characterConfig = {};
      const rigidBodyRef = {
        current: {
          translation: () => ({ x: 0, y: 0, z: 0 })
        }
      };
      const props = {
        rigidBodyRef,
        setMouseInput: jest.fn(),
        worldContext: { automation: { settings: {} } }
      } as any;
      
      const initialPoolSize = threeObjectPool.getStats();

      (component as any).handleMouseDirection(activeState, mouse, characterConfig, props);

      const finalStats = threeObjectPool.getStats();
      expect(finalStats.vector3.inUse).toBe(0);
    });
  });
  
  describe('동일한 결과 보장', () => {
    it('객체 풀 사용 전후 결과가 동일해야 함', () => {
      const innerGroup = new THREE.Group();
      const maxAngle = { x: 1, y: 1, z: 1 };
      const activeState = { euler: { x: 0, z: 0 } } as any;

      // Without pool
      threeObjectPool.enabled = false;
      const rotationWithoutPool = (component as any).applyAirplaneRotation(
        innerGroup.clone(), 1, 1, maxAngle, { ...activeState }
      );
      
      // With pool
      threeObjectPool.enabled = true;
      const rotationWithPool = (component as any).applyAirplaneRotation(
        innerGroup.clone(), 1, 1, maxAngle, { ...activeState }
      );
    });
  });
}); 