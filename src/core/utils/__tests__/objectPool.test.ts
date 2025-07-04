import * as THREE from 'three';
import { ThreeObjectPool } from '../objectPool';

describe('ThreeObjectPool', () => {
  let pool: ThreeObjectPool;
  
  beforeEach(() => {
    pool = ThreeObjectPool.getInstance();
    pool.clear();
  });
  
  afterEach(() => {
    pool.clear();
  });
  
  describe('싱글톤 패턴', () => {
    it('항상 같은 인스턴스를 반환해야 함', () => {
      const instance1 = ThreeObjectPool.getInstance();
      const instance2 = ThreeObjectPool.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
  
  describe('Vector3 풀링', () => {
    it('Vector3 객체를 획득하고 반환할 수 있어야 함', () => {
      const v1 = pool.acquireVector3();
      expect(v1).toBeInstanceOf(THREE.Vector3);
      expect(v1.x).toBe(0);
      expect(v1.y).toBe(0);
      expect(v1.z).toBe(0);
      
      v1.set(1, 2, 3);
      pool.releaseVector3(v1);
      
      const v2 = pool.acquireVector3();
      expect(v2).toBe(v1);
      expect(v2.x).toBe(0);
      expect(v2.y).toBe(0);
      expect(v2.z).toBe(0);
    });
    
    it('withVector3 헬퍼 메서드가 자동으로 객체를 반환해야 함', () => {
      const result = pool.withVector3((v) => {
        v.set(10, 20, 30);
        return v.length();
      });
      
      expect(result).toBeCloseTo(37.416, 2);
      
      const stats = pool.getStats();
      expect(stats.vector3.inUse).toBe(0);
    });
    
    it('풀이 비어있을 때 자동으로 확장되어야 함', () => {
      const vectors: THREE.Vector3[] = [];
      const initialStats = pool.getStats();
      
      for (let i = 0; i < initialStats.vector3.total + 5; i++) {
        vectors.push(pool.acquireVector3());
      }
      
      const expandedStats = pool.getStats();
      expect(expandedStats.vector3.total).toBeGreaterThan(initialStats.vector3.total);
      
      vectors.forEach(v => pool.releaseVector3(v));
    });
    
    it('최대 크기를 초과하지 않아야 함', () => {
      const vectors: THREE.Vector3[] = [];
      
      for (let i = 0; i < 200; i++) {
        vectors.push(pool.acquireVector3());
      }
      
      const stats = pool.getStats();
      expect(stats.vector3.total).toBe(200);
      
      expect(() => {
        pool.acquireVector3();
      }).toThrow('ObjectPool: Maximum size 200 reached');
      
      vectors.forEach(v => pool.releaseVector3(v));
    });
  });
  
  describe('Quaternion 풀링', () => {
    it('Quaternion 객체를 올바르게 초기화해야 함', () => {
      const q = pool.acquireQuaternion();
      expect(q).toBeInstanceOf(THREE.Quaternion);
      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
      
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
      pool.releaseQuaternion(q);
      
      const q2 = pool.acquireQuaternion();
      expect(q2).toBe(q);
      expect(q2.w).toBe(1);
    });
    
    it('withQuaternion 헬퍼가 예외 발생 시에도 객체를 반환해야 함', () => {
      expect(() => {
        pool.withQuaternion((q) => {
          throw new Error('테스트 에러');
        });
      }).toThrow('테스트 에러');
      
      const stats = pool.getStats();
      expect(stats.quaternion.inUse).toBe(0);
    });
  });
  
  describe('Euler 풀링', () => {
    it('Euler 객체를 올바르게 재사용해야 함', () => {
      const e1 = pool.acquireEuler();
      e1.set(Math.PI, Math.PI / 2, Math.PI / 4);
      
      const rotationOrder = e1.order;
      pool.releaseEuler(e1);
      
      const e2 = pool.acquireEuler();
      expect(e2).toBe(e1);
      expect(e2.x).toBe(0);
      expect(e2.y).toBe(0);
      expect(e2.z).toBe(0);
      expect(e2.order).toBe(rotationOrder);
    });
  });
  
  describe('Matrix4 풀링', () => {
    it('Matrix4 객체를 identity로 초기화해야 함', () => {
      const m = pool.acquireMatrix4();
      expect(m).toBeInstanceOf(THREE.Matrix4);
      
      const identity = new THREE.Matrix4();
      expect(m.equals(identity)).toBe(true);
      
      m.makeRotationX(Math.PI / 2);
      pool.releaseMatrix4(m);
      
      const m2 = pool.acquireMatrix4();
      expect(m2).toBe(m);
      expect(m2.equals(identity)).toBe(true);
    });
  });
  
  describe('동시성 테스트', () => {
    it('여러 객체를 동시에 사용할 수 있어야 함', () => {
      const objects = {
        vectors: [] as THREE.Vector3[],
        quaternions: [] as THREE.Quaternion[],
        eulers: [] as THREE.Euler[],
        matrices: [] as THREE.Matrix4[]
      };
      
      for (let i = 0; i < 10; i++) {
        objects.vectors.push(pool.acquireVector3());
        objects.quaternions.push(pool.acquireQuaternion());
        objects.eulers.push(pool.acquireEuler());
        objects.matrices.push(pool.acquireMatrix4());
      }
      
      const stats = pool.getStats();
      expect(stats.vector3.inUse).toBe(10);
      expect(stats.quaternion.inUse).toBe(10);
      expect(stats.euler.inUse).toBe(10);
      expect(stats.matrix4.inUse).toBe(10);
      
      objects.vectors.forEach(v => pool.releaseVector3(v));
      objects.quaternions.forEach(q => pool.releaseQuaternion(q));
      objects.eulers.forEach(e => pool.releaseEuler(e));
      objects.matrices.forEach(m => pool.releaseMatrix4(m));
      
      const finalStats = pool.getStats();
      expect(finalStats.vector3.inUse).toBe(0);
      expect(finalStats.quaternion.inUse).toBe(0);
      expect(finalStats.euler.inUse).toBe(0);
      expect(finalStats.matrix4.inUse).toBe(0);
    });
  });
  
  describe('성능 테스트', () => {
    it('객체 풀링이 직접 생성보다 빨라야 함', () => {
      const iterations = 10000;
      
      const directStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const v = new THREE.Vector3();
        v.set(i, i, i);
      }
      const directTime = performance.now() - directStart;
      
      const poolStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        const v = pool.acquireVector3();
        v.set(i, i, i);
        pool.releaseVector3(v);
      }
      const poolTime = performance.now() - poolStart;
      expect(poolTime).toBeLessThan(directTime * 2);
    });
  });
  
  describe('메모리 누수 방지', () => {
    it('clear 메서드가 모든 객체를 정리해야 함', () => {
      for (let i = 0; i < 50; i++) {
        pool.acquireVector3();
        pool.acquireQuaternion();
      }
      
      pool.clear();
      
      const stats = pool.getStats();
      expect(stats.vector3.total).toBe(0);
      expect(stats.quaternion.total).toBe(0);
      expect(stats.euler.total).toBe(0);
      expect(stats.matrix4.total).toBe(0);
    });
    
    it('이미 반환된 객체를 다시 반환해도 안전해야 함', () => {
      const v = pool.acquireVector3();
      pool.releaseVector3(v);
      
      expect(() => {
        pool.releaseVector3(v);
      }).not.toThrow();
      
      const stats = pool.getStats();
      expect(stats.vector3.available).toBe(stats.vector3.total);
    });
  });
}); 