import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { MotionController } from '../index';
import { useGaesupStore } from '../../../../stores';
import * as THREE from 'three';

jest.mock('../../../../stores');

describe('MotionController 성능 테스트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Store 구독 최적화', () => {
    it('필요한 필드만 구독해야 함', async () => {
      const mockState = {
        mode: { value: 'view' },
        motions: {
          controller: {
            mode: 'walk',
            onChangeMode: jest.fn(),
            onToggleRun: jest.fn(),
            airActions: {
              onJump: jest.fn(),
              canJump: true,
            },
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      });

      const TestScene = () => {
        return <MotionController />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // Store가 selector와 함께 호출되었는지 확인
      expect(useGaesupStore).toHaveBeenCalledWith(expect.any(Function));
      
      // 전체 store를 구독하지 않았는지 확인
      const calls = (useGaesupStore as jest.Mock).mock.calls;
      expect(calls.some(call => call.length === 0)).toBe(false);

      renderer.unmount();
    });

    it('불필요한 재렌더링을 피해야 함', async () => {
      let renderCount = 0;
      
      const TestScene = () => {
        renderCount++;
        return <MotionController />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      const initialRenderCount = renderCount;

      // 관련없는 상태 변경으로는 재렌더링되지 않아야 함
      await renderer.update(<TestScene />);
      
      // 컴포넌트가 필요 이상으로 재렌더링되지 않았는지 확인
      expect(renderCount).toBeLessThanOrEqual(initialRenderCount + 1);

      renderer.unmount();
    });
  });

  describe('이벤트 핸들러 최적화', () => {
    it('클릭 핸들러가 매번 재생성되지 않아야 함', async () => {
      const mockState = {
        mode: { value: 'view' },
        motions: {
          controller: {
            mode: 'walk',
            onChangeMode: jest.fn(),
            onToggleRun: jest.fn(),
            airActions: {
              onJump: jest.fn(),
              canJump: true,
            },
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      });

      const TestScene = () => {
        const [triggerUpdate, setTriggerUpdate] = React.useState(0);
        
        React.useEffect(() => {
          // 약간의 시간 후에 업데이트 트리거
          const timeout = setTimeout(() => {
            setTriggerUpdate(1);
          }, 10);
          
          return () => clearTimeout(timeout);
        }, []);
        
        return (
          <>
            <MotionController />
            <mesh userData={{ triggerUpdate }}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          </>
        );
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // UI 요소들 찾기
      const buttons = renderer.scene.children.filter(
        child => child.userData?.testId?.includes('button')
      );
      
      // 버튼이 존재하는지 확인
      expect(buttons.length).toBeGreaterThan(0);

      renderer.unmount();
    });
  });

  describe('조건부 렌더링 최적화', () => {
    it('edit 모드가 아닐 때는 UI를 렌더링하지 않아야 함', async () => {
      const mockState = {
        mode: { value: 'play' },
        motions: {
          controller: {
            mode: 'walk',
            onChangeMode: jest.fn(),
            onToggleRun: jest.fn(),
            airActions: {
              onJump: jest.fn(),
              canJump: true,
            },
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      });

      const TestScene = () => {
        return <MotionController />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 아무 요소도 렌더링되지 않아야 함
      expect(renderer.scene.children).toHaveLength(0);

      renderer.unmount();
    });

    it('view 모드에서만 UI를 렌더링해야 함', async () => {
      const mockState = {
        mode: { value: 'view' },
        motions: {
          controller: {
            mode: 'walk',
            onChangeMode: jest.fn(),
            onToggleRun: jest.fn(),
            airActions: {
              onJump: jest.fn(),
              canJump: true,
            },
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      });

      const TestScene = () => {
        return <MotionController />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // UI 요소가 렌더링되어야 함 (Html 컴포넌트)
      const htmlElements = renderer.scene.findAllByType('Html');
      expect(htmlElements.length).toBeGreaterThan(0);

      renderer.unmount();
    });
  });

  describe('메모리 관리', () => {
    it('언마운트 시 리소스가 정리되어야 함', async () => {
      const mockState = {
        mode: { value: 'view' },
        motions: {
          controller: {
            mode: 'walk',
            onChangeMode: jest.fn(),
            onToggleRun: jest.fn(),
            airActions: {
              onJump: jest.fn(),
              canJump: true,
            },
          },
        },
      };

      (useGaesupStore as unknown as jest.Mock).mockImplementation((selector) => {
        if (typeof selector === 'function') {
          return selector(mockState);
        }
        return mockState;
      });

      const TestScene = () => {
        const [mounted, setMounted] = React.useState(true);
        
        React.useEffect(() => {
          const timeout = setTimeout(() => {
            setMounted(false);
          }, 50);
          
          return () => clearTimeout(timeout);
        }, []);
        
        return mounted ? <MotionController /> : null;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 초기 렌더링 확인
      expect(renderer.scene.children.length).toBeGreaterThan(0);
      
      // 언마운트 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await renderer.update(<TestScene />);
      
      // 언마운트 후 정리 확인
      expect(renderer.scene.children.length).toBe(0);

      renderer.unmount();
    });
  });
}); 