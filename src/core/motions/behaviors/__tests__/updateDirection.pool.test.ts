import { DirectionController } from '../updateDirection';
import { threeObjectPool } from '../../../utils/objectPool';
import * as THREE from 'three';

describe('DirectionController with Object Pooling', () => {
  let controller: DirectionController;
  
  beforeEach(() => {
    controller = new DirectionController();
    threeObjectPool.clear();
  });
  
  afterEach(() => {
    controller.dispose();
    threeObjectPool.clear();
  });
  
  describe('객체 풀링 성능', () => {
    it('applyAirplaneRotation이 객체 풀을 사용해야 함', () => {
      const innerGroup = new THREE.Group();
      const activeState = {
        euler: new THREE.Euler(),
        dir: new THREE.Vector3(),
        direction: new THREE.Vector3(),
      } as any;
      
      const initialStats = threeObjectPool.getStats();
      
      // applyAirplaneRotation을 여러 번 호출
      for (let i = 0; i < 100; i++) {
        (controller as any).applyAirplaneRotation(
          innerGroup,
          0.5,
          -0.5,
          { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
          activeState
        );
      }
      
      const finalStats = threeObjectPool.getStats();
      
      // 객체 풀이 사용되었는지 확인
      expect(finalStats.euler.total).toBeGreaterThan(0);
      expect(finalStats.quaternion.total).toBeGreaterThan(0);
      
      // 메모리 누수가 없는지 확인 (사용 중인 객체가 없어야 함)
      expect(finalStats.euler.inUse).toBe(0);
      expect(finalStats.quaternion.inUse).toBe(0);
    });
    
    it('handleMouseDirection이 메모리 누수 없이 작동해야 함', () => {
      const activeState = {
        euler: new THREE.Euler(),
        dir: new THREE.Vector3(),
        direction: new THREE.Vector3(),
      } as any;
      
      const mouse = {
        target: new THREE.Vector3(10, 0, 10),
        angle: Math.PI / 4,
        isActive: true,
        shouldRun: false,
      };
      
      const calcProp = {
        worldContext: {
          automation: {
            settings: { trackProgress: true, loop: false },
            queue: {
              actions: [
                { target: new THREE.Vector3(5, 0, 5) },
                { target: new THREE.Vector3(10, 0, 10) },
              ],
            },
          },
        },
        body: {
          translation: () => ({ x: 0, y: 0, z: 0 }),
        },
        memo: {
          direction: null,
          directionTarget: null,
        },
        rigidBodyRef: {
          current: null,
        },
      } as any;
      
      const initialStats = threeObjectPool.getStats();
      
      // handleMouseDirection을 여러 번 호출
      for (let i = 0; i < 50; i++) {
        (controller as any).handleMouseDirection(
          activeState,
          mouse,
          {},
          calcProp
        );
      }
      
      const finalStats = threeObjectPool.getStats();
      
      // 객체 풀이 사용되었는지 확인
      expect(finalStats.vector3.total).toBeGreaterThan(initialStats.vector3.total);
      
      // 메모리 누수가 없는지 확인
      expect(finalStats.vector3.inUse).toBe(0);
    });
  });
  
  describe('동일한 결과 보장', () => {
    it('객체 풀 사용 전후 결과가 동일해야 함', () => {
      const innerGroup1 = new THREE.Group();
      const innerGroup2 = new THREE.Group();
      
      const activeState1 = {
        euler: new THREE.Euler(),
        dir: new THREE.Vector3(),
        direction: new THREE.Vector3(),
      } as any;
      
      const activeState2 = {
        euler: new THREE.Euler(),
        dir: new THREE.Vector3(), 
        direction: new THREE.Vector3(),
      } as any;
      
      const params = {
        upDown: 0.3,
        leftRight: -0.7,
        maxAngle: { x: Math.PI / 6, y: Math.PI, z: Math.PI / 6 },
      };
      
      // 동일한 초기 상태 설정
      innerGroup1.rotation.set(0.1, 0.2, 0.3);
      innerGroup2.rotation.set(0.1, 0.2, 0.3);
      
      // 첫 번째 호출
      (controller as any).applyAirplaneRotation(
        innerGroup1,
        params.upDown,
        params.leftRight,
        params.maxAngle,
        activeState1
      );
      
      // 두 번째 호출
      (controller as any).applyAirplaneRotation(
        innerGroup2,
        params.upDown,
        params.leftRight,
        params.maxAngle,
        activeState2
      );
      
      // 결과가 동일한지 확인
      expect(innerGroup1.rotation.x).toBeCloseTo(innerGroup2.rotation.x);
      expect(innerGroup1.rotation.y).toBeCloseTo(innerGroup2.rotation.y);
      expect(innerGroup1.rotation.z).toBeCloseTo(innerGroup2.rotation.z);
      
      expect(activeState1.euler.x).toBeCloseTo(activeState2.euler.x);
      expect(activeState1.euler.z).toBeCloseTo(activeState2.euler.z);
    });
  });
}); 