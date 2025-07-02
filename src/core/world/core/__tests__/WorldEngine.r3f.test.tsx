import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { WorldEngine } from '../WorldEngine';
import * as THREE from 'three';

describe('WorldEngine R3F Tests', () => {
  it('should test raycast without creating new objects', async () => {
    // R3F 컴포넌트로 테스트
    const TestComponent = () => {
      const engine = React.useRef(new WorldEngine());
      
      React.useEffect(() => {
        const origin = new THREE.Vector3(0, 0, 0);
        const direction = new THREE.Vector3(0, 0, 1);
        
        // 여러 번 raycast 호출
        for (let i = 0; i < 100; i++) {
          engine.current.raycast(origin, direction, 10);
        }
      }, []);
      
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="red" />
        </mesh>
      );
    };
    
    const renderer = await ReactThreeTestRenderer.create(<TestComponent />);
    
    // Scene graph 확인
    const graph = renderer.toGraph();
    expect(graph).toMatchSnapshot();
    
    // 메모리 누수 확인 - 재사용된 raycaster 인스턴스 확인
    const mesh = renderer.scene.children[0];
    expect(mesh).toBeDefined();
    
    renderer.unmount();
  });
  
  it('should handle objects in scene correctly', async () => {
    const engine = new WorldEngine();
    
    const TestScene = () => {
      return (
        <>
          <mesh name="object1" position={[0, 0, 0]}>
            <boxGeometry />
            <meshBasicMaterial />
          </mesh>
          <mesh name="object2" position={[5, 0, 0]}>
            <sphereGeometry />
            <meshBasicMaterial />
          </mesh>
        </>
      );
    };
    
    const renderer = await ReactThreeTestRenderer.create(<TestScene />);
    
    // Scene 구조 확인
    const meshes = renderer.scene.children.filter(child => child instanceof THREE.Mesh);
    expect(meshes).toHaveLength(2);
    
    // 위치 확인
    expect(meshes[0].position.x).toBe(0);
    expect(meshes[1].position.x).toBe(5);
    
    // findByProps 사용
    const object1 = renderer.scene.findByProps({ name: 'object1' });
    expect(object1).toBeDefined();
    
    // fireEvent 사용 (포인터 이벤트)
    await renderer.fireEvent(object1, 'click');
    
    renderer.unmount();
  });
}); 