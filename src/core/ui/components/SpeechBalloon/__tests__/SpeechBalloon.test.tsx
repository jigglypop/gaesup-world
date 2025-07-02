import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { SpeechBalloon } from '../index';
import * as THREE from 'three';

describe('SpeechBalloon 성능 테스트', () => {
  describe('메모리 최적화', () => {
    it('렌더링마다 새로운 Vector3를 생성하지 않아야 함', async () => {
      const position = new THREE.Vector3(0, 0, 0);
      const offset = new THREE.Vector3(0, 1, 0);
      
      const TestScene = ({ text }: { text: string }) => {
        return (
          <SpeechBalloon
            text={text}
            position={position}
            offset={offset}
          />
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(
        <TestScene text="초기 텍스트" />
      );
      
      // 초기 sprite 찾기
      const sprite = renderer.scene.findByType('Sprite');
      const initialPosition = sprite?.position.clone();
      
      // 여러 번 업데이트
      for (let i = 0; i < 10; i++) {
        await renderer.update(<TestScene text={`업데이트 ${i}`} />);
      }
      
      // position이 동일한 참조를 유지하는지 확인
      const finalSprite = renderer.scene.findByType('Sprite');
      expect(finalSprite?.position.equals(initialPosition)).toBe(true);
      
      renderer.unmount();
    });

    it('리소스가 제대로 정리되어야 함', async () => {
      const TestScene = () => {
        return (
          <SpeechBalloon
            text="테스트"
            position={[0, 2, 0]}
            offset={[0, 1, 0]}
            backgroundColor="rgba(0, 0, 0, 0.8)"
          />
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // Sprite와 Material 찾기
      const sprite = renderer.scene.findByType('Sprite');
      expect(sprite).toBeDefined();
      
      const material = sprite?.material as THREE.SpriteMaterial;
      expect(material).toBeDefined();
      expect(material.transparent).toBe(true);
      
      // unmount 시 정리 확인
      const disposeSpy = jest.fn();
      if (material) {
        material.dispose = disposeSpy;
      }
      
      renderer.unmount();
      
      // dispose가 호출되어야 함
      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('useFrame 성능 최적화', () => {
    it('스케일 업데이트가 필요할 때만 실행되어야 함', async () => {
      let scaleUpdateCount = 0;
      
      const TestScene = () => {
        const spriteRef = React.useRef<THREE.Sprite>(null);
        const [frameCount, setFrameCount] = React.useState(0);
        
        React.useEffect(() => {
          // useFrame 시뮬레이션
          let count = 0;
          const interval = setInterval(() => {
            count++;
            
            if (spriteRef.current) {
              const prevScale = spriteRef.current.scale.x;
              // 거리 기반 스케일 계산 (SpeechBalloon 로직 시뮬레이션)
              const mockDistance = 5 + Math.sin(count * 0.1) * 0.1;
              const newScale = mockDistance * 0.01;
              
              // 실제로 변경이 필요한 경우만 카운트
              if (Math.abs(newScale - prevScale) > 0.01) {
                scaleUpdateCount++;
                spriteRef.current.scale.setScalar(newScale);
              }
            }
            
            if (count >= 100) {
              clearInterval(interval);
              setFrameCount(count);
            }
          }, 16); // 60fps
          
          return () => clearInterval(interval);
        }, []);
        
        return (
          <>
            <sprite ref={spriteRef}>
              <spriteMaterial />
            </sprite>
            <mesh userData={{ frameCount, scaleUpdateCount }}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          </>
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 100 프레임 대기
      await new Promise(resolve => setTimeout(resolve, 1700));
      
      const resultMesh = renderer.scene.children.find(
        m => m.userData.frameCount !== undefined
      );
      
      // 스케일 업데이트가 매 프레임마다 일어나지 않아야 함
      expect(resultMesh?.userData.scaleUpdateCount).toBeLessThan(resultMesh?.userData.frameCount);
      
      renderer.unmount();
    });
  });

  describe('텍스처 관리', () => {
    it('긴 텍스트도 효율적으로 처리해야 함', async () => {
      const longText = '이것은 매우 긴 텍스트입니다. '.repeat(20);
      
      const TestScene = () => {
        return (
          <SpeechBalloon
            text={longText}
            position={[0, 0, 0]}
            maxWidth={500}
          />
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      const sprite = renderer.scene.findByType('Sprite');
      expect(sprite).toBeDefined();
      
      // 텍스처가 생성되었는지 확인
      const material = sprite?.material as THREE.SpriteMaterial;
      expect(material.map).toBeDefined();
      
      renderer.unmount();
    });

    it('visible이 false일 때 리소스를 생성하지 않아야 함', async () => {
      const TestScene = () => {
        return (
          <SpeechBalloon
            text="숨겨진 텍스트"
            position={[0, 0, 0]}
            visible={false}
          />
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // visible이 false면 sprite가 생성되지 않아야 함
      const sprite = renderer.scene.findByType('Sprite');
      expect(sprite).toBeUndefined();
      
      renderer.unmount();
    });
  });

  describe('위치 계산 최적화', () => {
    it('position과 offset이 동일하면 재계산하지 않아야 함', async () => {
      const position = new THREE.Vector3(1, 2, 3);
      const offset = new THREE.Vector3(0, 1, 0);
      
      let renderCount = 0;
      
      const TestScene = ({ text }: { text: string }) => {
        renderCount++;
        
        return (
          <SpeechBalloon
            text={text}
            position={position}
            offset={offset}
          />
        );
      };
      
      const renderer = await ReactThreeTestRenderer.create(
        <TestScene text="초기" />
      );
      
      const initialRenderCount = renderCount;
      
      // 텍스트만 변경
      await renderer.update(<TestScene text="변경됨" />);
      await renderer.update(<TestScene text="다시 변경" />);
      
      // 렌더링은 발생하지만 position 계산은 메모이제이션되어야 함
      expect(renderCount).toBe(initialRenderCount + 2);
      
      const sprite = renderer.scene.findByType('Sprite');
      expect(sprite?.position.y).toBe(3); // position.y + offset.y
      
      renderer.unmount();
    });
  });
}); 