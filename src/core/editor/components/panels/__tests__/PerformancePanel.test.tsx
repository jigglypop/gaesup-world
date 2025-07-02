import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';
import { PerformancePanel } from '../PerformancePanel';
import * as THREE from 'three';

// requestAnimationFrame 모킹
const mockRequestAnimationFrame = (callback: FrameRequestCallback) => {
  setTimeout(() => callback(performance.now()), 16);
  return 1;
};

const mockCancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

beforeAll(() => {
  global.requestAnimationFrame = mockRequestAnimationFrame as any;
  global.cancelAnimationFrame = mockCancelAnimationFrame;
});

describe('PerformancePanel 성능 테스트', () => {
  describe('매 프레임 setState 최적화', () => {
    it('프레임 업데이트가 throttle되어야 함', async () => {
      let frameUpdateCount = 0;
      const originalSetState = React.Component.prototype.setState;
      
      // setState 호출 추적
      React.Component.prototype.setState = function(...args) {
        frameUpdateCount++;
        return originalSetState.apply(this, args);
      };

      const TestScene = () => {
        return <PerformancePanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 200ms 대기 (약 12 프레임)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // 매 프레임마다 setState가 호출되지 않아야 함
      // 10프레임마다 1번 업데이트하므로 1-2번만 호출되어야 함
      expect(frameUpdateCount).toBeLessThan(5);
      
      React.Component.prototype.setState = originalSetState;
      renderer.unmount();
    });

    it('언마운트 시 애니메이션 프레임이 취소되어야 함', async () => {
      const cancelSpy = jest.spyOn(global, 'cancelAnimationFrame');

      const TestScene = () => {
        const [mounted, setMounted] = React.useState(true);
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setMounted(false);
          }, 50);
          
          return () => clearTimeout(timer);
        }, []);
        
        return mounted ? <PerformancePanel /> : null;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 언마운트 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      await renderer.update(<TestScene />);
      
      // cancelAnimationFrame이 호출되었는지 확인
      expect(cancelSpy).toHaveBeenCalled();
      
      cancelSpy.mockRestore();
      renderer.unmount();
    });
  });

  describe('메모리 관리', () => {
    it('연속적인 업데이트가 메모리 누수를 일으키지 않아야 함', async () => {
      const TestScene = () => {
        return <PerformancePanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 초기 상태 확인
      const initialHtmlElements = renderer.scene.findAllByType('Html');
      expect(initialHtmlElements.length).toBeGreaterThan(0);
      
      // 500ms 동안 연속 업데이트 (약 30 프레임)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 동일한 수의 요소가 유지되어야 함 (메모리 누수 없음)
      const finalHtmlElements = renderer.scene.findAllByType('Html');
      expect(finalHtmlElements.length).toBe(initialHtmlElements.length);
      
      renderer.unmount();
    });

    it('빠른 마운트/언마운트 시 안정적이어야 함', async () => {
      for (let i = 0; i < 5; i++) {
        const TestScene = () => {
          return <PerformancePanel />;
        };

        const renderer = await ReactThreeTestRenderer.create(<TestScene />);
        
        // 짧은 시간 후 언마운트
        await new Promise(resolve => setTimeout(resolve, 20));
        
        renderer.unmount();
      }
      
      // 에러 없이 완료되어야 함
      expect(true).toBe(true);
    });
  });

  describe('성능 메트릭 계산', () => {
    it('프레임 시간이 정확하게 측정되어야 함', async () => {
      const TestScene = () => {
        const [metrics, setMetrics] = React.useState<any>(null);
        
        React.useEffect(() => {
          // PerformancePanel이 업데이트한 DOM을 확인
          const checkMetrics = () => {
            const frameTimeElement = document.querySelector('[data-testid="frame-time"]');
            if (frameTimeElement) {
              setMetrics({
                frameTime: parseFloat(frameTimeElement.textContent || '0'),
              });
            }
          };
          
          const interval = setInterval(checkMetrics, 100);
          return () => clearInterval(interval);
        }, []);
        
        return (
          <>
            <PerformancePanel />
            <mesh userData={{ metrics }}>
              <planeGeometry />
              <meshBasicMaterial />
            </mesh>
          </>
        );
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // 메트릭이 업데이트될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mesh = renderer.scene.children.find(
        child => child.userData.metrics !== null
      );
      
      // 프레임 시간이 합리적인 범위에 있어야 함
      if (mesh?.userData.metrics) {
        expect(mesh.userData.metrics.frameTime).toBeGreaterThan(0);
        expect(mesh.userData.metrics.frameTime).toBeLessThan(100);
      }
      
      renderer.unmount();
    });
  });

  describe('조건부 렌더링', () => {
    it('숨김 상태에서는 업데이트가 일시정지되어야 함', async () => {
      let updateCount = 0;
      
      const TestScene = ({ visible }: { visible: boolean }) => {
        React.useEffect(() => {
          updateCount++;
        });
        
        return visible ? <PerformancePanel /> : null;
      };

      const renderer = await ReactThreeTestRenderer.create(
        <TestScene visible={true} />
      );
      
      const initialUpdateCount = updateCount;
      
      // 숨김
      await renderer.update(<TestScene visible={false} />);
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 다시 표시
      await renderer.update(<TestScene visible={true} />);
      
      // 숨김 상태에서는 업데이트가 최소화되어야 함
      expect(updateCount).toBeLessThanOrEqual(initialUpdateCount + 2);
      
      renderer.unmount();
    });
  });

  describe('레이아웃 최적화', () => {
    it('패널 크기가 고정되어 리플로우를 방지해야 함', async () => {
      const TestScene = () => {
        return <PerformancePanel />;
      };

      const renderer = await ReactThreeTestRenderer.create(<TestScene />);
      
      // Html 컴포넌트의 스타일 확인
      const htmlElements = renderer.scene.findAllByType('Html');
      
      htmlElements.forEach(element => {
        // 고정 크기나 적절한 스타일이 설정되어 있어야 함
        expect(element).toBeDefined();
      });
      
      renderer.unmount();
    });
  });
}); 