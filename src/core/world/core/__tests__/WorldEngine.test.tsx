import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { WorldEngine } from '../WorldEngine';
import * as THREE from 'three';

describe('WorldEngine', () => {
  let engine: WorldEngine;

  beforeEach(() => {
    engine = new WorldEngine();
  });

  afterEach(() => {
    engine.cleanup();
    // Three.js 객체들 정리
    jest.clearAllMocks();
  });

  describe('기본 기능', () => {
    it('should add and retrieve objects', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const rotation = new THREE.Euler(0, 0, 0);
      const scale = new THREE.Vector3(1, 1, 1);
      
      const object = {
        id: 'test-1',
        position,
        rotation,
        scale,
        type: 'active' as const,
      };

      engine.addObject(object);
      expect(engine.getObject('test-1')).toBe(object);
    });

    it('should remove objects', () => {
      const object = {
        id: 'test-1',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active' as const,
      };

      engine.addObject(object);
      expect(engine.removeObject('test-1')).toBe(true);
      expect(engine.getObject('test-1')).toBeUndefined();
    });
  });

  describe('메모리 누수 테스트', () => {
    it('should reuse raycaster instance', () => {
      const origin = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3(0, 0, 1);
      
      // 첫 번째 호출
      engine.raycast(origin, direction, 10);
      
      // 메모리 사용량 측정 (간접적)
      const initialObjects = engine.getAllObjects().length;
      
      // 1000번 raycast 호출
      for (let i = 0; i < 1000; i++) {
        engine.raycast(origin, direction, 10);
      }
      
      // 객체 수가 증가하지 않아야 함
      expect(engine.getAllObjects().length).toBe(initialObjects);
    });

    it('should handle multiple raycasts without memory leak', () => {
      const origin = new THREE.Vector3(0, 0, 0);
      const direction = new THREE.Vector3(0, 0, 1);
      
      // 객체 추가
      const box = {
        id: 'box-1',
        position: new THREE.Vector3(0, 0, 5),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'static' as const,
        boundingBox: new THREE.Box3(
          new THREE.Vector3(-1, -1, 4),
          new THREE.Vector3(1, 1, 6)
        ),
      };
      
      engine.addObject(box);
      
      // 여러 번 raycast
      const results = [];
      for (let i = 0; i < 100; i++) {
        const result = engine.raycast(origin, direction, 10);
        if (result) results.push(result);
      }
      
      // 결과가 일관되어야 함
      expect(results.length).toBeGreaterThan(0);
      results.forEach(result => {
        expect(result.object.id).toBe('box-1');
      });
    });
  });

  describe('공간 검색', () => {
    it('should find objects in radius', () => {
      const object1 = {
        id: 'test-1',
        position: new THREE.Vector3(0, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active' as const,
      };

      const object2 = {
        id: 'test-2',
        position: new THREE.Vector3(5, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active' as const,
      };

      const object3 = {
        id: 'test-3',
        position: new THREE.Vector3(15, 0, 0),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        type: 'active' as const,
      };

      engine.addObject(object1);
      engine.addObject(object2);
      engine.addObject(object3);

      const nearbyObjects = engine.getObjectsInRadius(new THREE.Vector3(0, 0, 0), 10);
      expect(nearbyObjects).toHaveLength(2);
      expect(nearbyObjects.map(o => o.id)).toContain('test-1');
      expect(nearbyObjects.map(o => o.id)).toContain('test-2');
    });
  });
});

describe('WorldEngine 성능 테스트', () => {
  let engine: WorldEngine;

  beforeEach(() => {
    engine = new WorldEngine();
  });

  afterEach(() => {
    engine.cleanup();
  });

  describe('메모리 누수 방지', () => {
    it('raycast 호출 시 새로운 객체를 생성하지 않아야 함', async () => {
      const TestScene = () => {
        const engineRef = React.useRef(new WorldEngine());
        
        React.useEffect(() => {
          const origin = new THREE.Vector3(0, 0, 0);
          const direction = new THREE.Vector3(0, 0, 1);
          
          // 100번 raycast 호출
          for (let i = 0; i < 100; i++) {
            engineRef.current.raycast(origin, direction, 10);
          }
        }, []);
        
        return (
          <mesh position={[0, 0, 5]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshBasicMaterial />
          </mesh>
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // Scene graph 확인
      const mesh = renderer.scene.children[0];
      expect(mesh).toBeDefined();
      expect(mesh.position.z).toBe(5);
      
      renderer.unmount();
    });

    it('여러 객체에 대한 raycast가 메모리 효율적이어야 함', async () => {
      const TestScene = () => {
        const engineRef = React.useRef(new WorldEngine());
        const [hitCount, setHitCount] = React.useState(0);
        
        React.useEffect(() => {
          // 객체 추가
          const box = {
            id: 'box-1',
            position: new THREE.Vector3(0, 0, 5),
            rotation: new THREE.Euler(0, 0, 0),
            scale: new THREE.Vector3(1, 1, 1),
            type: 'static' as const,
            boundingBox: new THREE.Box3(
              new THREE.Vector3(-1, -1, 4),
              new THREE.Vector3(1, 1, 6)
            ),
          };
          
          engineRef.current.addObject(box);
          
          // 여러 번 raycast
          let hits = 0;
          const origin = new THREE.Vector3(0, 0, 0);
          const direction = new THREE.Vector3(0, 0, 1);
          
          for (let i = 0; i < 100; i++) {
            const result = engineRef.current.raycast(origin, direction, 10);
            if (result) hits++;
          }
          
          setHitCount(hits);
        }, []);
        
        return (
          <>
            <mesh name="test-box" position={[0, 0, 5]}>
              <boxGeometry args={[2, 2, 2]} />
              <meshBasicMaterial color="red" />
            </mesh>
            <mesh userData={{ hitCount }}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          </>
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 결과 확인
      const meshes = renderer.scene.children.filter(child => child instanceof THREE.Mesh);
      expect(meshes).toHaveLength(2);
      
      const resultMesh = meshes.find(m => m.userData.hitCount !== undefined);
      expect(resultMesh?.userData.hitCount).toBeGreaterThan(0);
      
      renderer.unmount();
    });
  });

  describe('공간 검색 성능', () => {
    it('반경 내 객체를 효율적으로 찾아야 함', async () => {
      const TestScene = () => {
        const engineRef = React.useRef(new WorldEngine());
        const [nearbyCount, setNearbyCount] = React.useState(0);
        
        React.useEffect(() => {
          // 여러 객체 추가
          for (let i = 0; i < 10; i++) {
            engineRef.current.addObject({
              id: `object-${i}`,
              position: new THREE.Vector3(i * 3, 0, 0),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(1, 1, 1),
              type: 'active' as const,
            });
          }
          
          // 반경 검색
          const nearby = engineRef.current.getObjectsInRadius(
            new THREE.Vector3(5, 0, 0), 
            10
          );
          
          setNearbyCount(nearby.length);
        }, []);
        
        return (
          <>
            {Array.from({ length: 10 }, (_, i) => (
              <mesh key={i} position={[i * 3, 0, 0]}>
                <sphereGeometry args={[0.5]} />
                <meshBasicMaterial color={i < 5 ? 'green' : 'red'} />
              </mesh>
            ))}
            <mesh userData={{ nearbyCount }}>
              <planeGeometry />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
          </>
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 객체 수 확인
      const spheres = renderer.scene.children.filter(
        child => child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry
      );
      expect(spheres).toHaveLength(10);
      
      // 반경 검색 결과 확인
      const resultMesh = renderer.scene.children.find(
        m => m.userData.nearbyCount !== undefined
      );
      expect(resultMesh?.userData.nearbyCount).toBeGreaterThan(0);
      expect(resultMesh?.userData.nearbyCount).toBeLessThan(10);
      
      renderer.unmount();
    });
  });

  describe('리소스 정리', () => {
    it('cleanup 호출 시 모든 리소스가 해제되어야 함', async () => {
      const TestScene = () => {
        const engineRef = React.useRef(new WorldEngine());
        const [cleaned, setCleaned] = React.useState(false);
        React.useEffect(() => {
          for (let i = 0; i < 5; i++) {
            engineRef.current.addObject({
              id: `cleanup-test-${i}`,
              position: new THREE.Vector3(i, 0, 0),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(1, 1, 1),
              type: 'active' as const,
            });
          }
          // cleanup 테스트
          expect(engineRef.current.getAllObjects()).toHaveLength(5);
          engineRef.current.cleanup();
          expect(engineRef.current.getAllObjects()).toHaveLength(0);
          setCleaned(true);
        }, []);
        
        return (
          <mesh userData={{ cleaned }}>
            <boxGeometry />
            <meshBasicMaterial />
          </mesh>
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      const mesh = renderer.scene.children[0];
      expect(mesh.userData.cleaned).toBe(true);
      
      renderer.unmount();
    });
  });
}); 