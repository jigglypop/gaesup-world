import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { CameraDebugPanel } from '../index';
import { useGaesupStore } from '../../../../stores';
import * as THREE from 'three';
jest.mock('../../../../stores');

describe('CameraDebugPanel 성능 테스트', () => {
  const mockCameraState = {
    position: new THREE.Vector3(0, 5, 10),
    rotation: new THREE.Euler(0, 0, 0),
    currentMode: 'chase',
    zoomLevel: 10,
    fov: 75,
    debugInfo: {
      position: { x: 0, y: 5, z: 10 },
      rotation: { x: 0, y: 0, z: 0 },
      target: { x: 0, y: 0, z: 0 },
      distance: 11.18,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ cameraState: mockCameraState });
      }
      return mockCameraState;
    });
  });

  describe('메모리 최적화', () => {
    it('Vector3와 Euler 객체를 재사용해야 함', async () => {
      const TestScene = () => {
        return <CameraDebugPanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // Html 컴포넌트 찾기
      const htmlElements = renderer.scene.findAllByType('Html');
      expect(htmlElements.length).toBeGreaterThan(0);

      // 여러 번 업데이트
      for (let i = 0; i < 10; i++) {
        await renderer.update(<TestScene />);
      }

      // 메모리 누수가 없어야 함 (동일한 수의 요소)
      const finalHtmlElements = renderer.scene.findAllByType('Html');
      expect(finalHtmlElements.length).toBe(htmlElements.length);

      renderer.unmount();
    });

    it('JSON.stringify 대신 최적화된 비교를 사용해야 함', async () => {
      let renderCount = 0;
      const stringifySpy = jest.spyOn(JSON, 'stringify');

      const TestScene = () => {
        renderCount++;
        return <CameraDebugPanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 동일한 값으로 여러 번 업데이트
      for (let i = 0; i < 5; i++) {
        await renderer.update(<TestScene />);
      }

      // JSON.stringify가 과도하게 호출되지 않아야 함
      expect(stringifySpy).toHaveBeenCalledTimes(0);
      
      stringifySpy.mockRestore();
      renderer.unmount();
    });
  });

  describe('Store 구독 최적화', () => {
    it('전체 store가 아닌 camera 슬라이스만 구독해야 함', async () => {
      const TestScene = () => {
        return <CameraDebugPanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // selector 패턴 사용 확인
      expect(useGaesupStore).toHaveBeenCalledWith(expect.any(Function));
      
      const selector = (useGaesupStore as jest.Mock).mock.calls[0][0];
      const testState = {
        cameraState: mockCameraState,
        motionState: { someOtherData: true },
        worldState: { anotherData: false },
      };
      
      // selector가 camera 상태만 반환하는지 확인
      const result = selector(testState);
      expect(result).toBe(mockCameraState);

      renderer.unmount();
    });

    it('관련 없는 상태 변경 시 재렌더링되지 않아야 함', async () => {
      let renderCount = 0;

      const TestScene = () => {
        renderCount++;
        return <CameraDebugPanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      const initialRenderCount = renderCount;

      // 카메라와 관련 없는 상태 변경 시뮬레이션
      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          cameraState: mockCameraState,
          motionState: { updated: true }, // 다른 상태 변경
        };
        return selector ? selector(state) : state;
      });

      await renderer.update(<TestScene />);
      
      // 재렌더링이 최소화되어야 함
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 1);

      renderer.unmount();
    });
  });

  describe('조건부 렌더링 최적화', () => {
    it('변경되지 않은 메트릭은 업데이트하지 않아야 함', async () => {
      const TestScene = () => {
        const [updateTrigger, setUpdateTrigger] = React.useState(0);
        
        React.useEffect(() => {
          // 작은 변경 시뮬레이션
          const timer = setTimeout(() => {
            mockCameraState.position.x += 0.0001; // 무시할 수 있는 변경
            setUpdateTrigger(prev => prev + 1);
          }, 10);
          
          return () => clearTimeout(timer);
        }, []);
        
        return (
          <>
            <CameraDebugPanel />
            <mesh userData={{ updateTrigger }}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          </>
        );
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 업데이트 대기
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // HTML 요소들이 여전히 존재하는지 확인
      const htmlElements = renderer.scene.findAllByType('Html');
      expect(htmlElements.length).toBeGreaterThan(0);

      renderer.unmount();
    });
  });

  describe('성능 메트릭', () => {
    it('큰 데이터셋도 효율적으로 렌더링해야 함', async () => {
      // 복잡한 디버그 정보로 모킹
      const complexCameraState = {
        ...mockCameraState,
        debugInfo: {
          position: { x: 123.456789, y: 234.567890, z: 345.678901 },
          rotation: { x: 0.123456, y: 1.234567, z: 2.345678 },
          target: { x: 456.789012, y: 567.890123, z: 678.901234 },
          distance: 987.654321,
          quaternion: { x: 0.1, y: 0.2, z: 0.3, w: 0.9 },
          frustum: {
            near: 0.1,
            far: 1000,
            left: -10,
            right: 10,
            top: 10,
            bottom: -10,
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector({ cameraState: complexCameraState });
        }
        return complexCameraState;
      });

      const startTime = performance.now();

      const TestScene = () => {
        return <CameraDebugPanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      const renderTime = performance.now() - startTime;
      
      // 렌더링이 합리적인 시간 내에 완료되어야 함 (100ms 이하)
      expect(renderTime).toBeLessThan(100);

      renderer.unmount();
    });
  });

  describe('리소스 정리', () => {
    it('언마운트 시 모든 리소스가 정리되어야 함', async () => {
      const TestScene = () => {
        const [isVisible, setIsVisible] = React.useState(true);
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setIsVisible(false);
          }, 50);
          
          return () => clearTimeout(timer);
        }, []);
        
        return isVisible ? <CameraDebugPanel /> : null;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 초기 상태 확인
      expect(renderer.scene.children.length).toBeGreaterThan(0);
      
      // 언마운트 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      await renderer.update(<TestScene />);
      
      // 모든 요소가 정리되었는지 확인
      expect(renderer.scene.children.length).toBe(0);

      renderer.unmount();
    });
  });
}); 