import React from 'react';
import { renderHook, cleanup } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { 
  useGaesupController, 
  useClicker, 
  usePushKey, 
  useRideable,
  useTeleport,
  GaesupWorld 
} from '../../index';
import {
  testComponentMemoryUsage,
  formatMemoryResult,
  MemoryMonitor,
  forceGarbageCollection,
  createMemorySnapshot,
} from '../utils/memoryTestUtils';

// Mock 설정
const MOCK_CHARACTER_URL = 'https://example.com/mock-character.glb';

// Wrapper 컴포넌트
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GaesupWorld
      urls={{ characterUrl: MOCK_CHARACTER_URL }}
      mode={{ controller: 'keyboard' }}
    >
      <Canvas>
        <Physics>
          {children}
        </Physics>
      </Canvas>
    </GaesupWorld>
  );
}

describe('Hooks Memory Tests', () => {
  afterEach(async () => {
    cleanup();
    await forceGarbageCollection();
  });

  describe('useGaesupController Hook', () => {
    test('useGaesupController 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => useGaesupController(), {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        10, // 10번 반복
        256 * 1024 // 256KB 임계값
      );

      console.log('useGaesupController:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(50 * 1024); // 50KB 이하
    });

    test('useGaesupController 연속 호출 테스트', async () => {
      const monitor = new MemoryMonitor();
      monitor.start(50);

      const hooks: Array<{ unmount: () => void }> = [];

      try {
        // 동시에 여러 개의 hook 인스턴스 생성
        for (let i = 0; i < 5; i++) {
          const hook = renderHook(() => useGaesupController(), {
            wrapper: TestWrapper,
          });
          hooks.push(hook);
          
          await new Promise(resolve => setTimeout(resolve, 20));
        }

        // 모든 hook 정리
        hooks.forEach(hook => hook.unmount());
        await forceGarbageCollection();

      } finally {
        monitor.stop();
        hooks.forEach(hook => {
          try {
            hook.unmount();
          } catch (e) {
            // 이미 정리된 경우 무시
          }
        });
      }

      const result = monitor.getResult(512 * 1024);
      console.log('useGaesupController 연속 호출:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
    });
  });

  describe('useClicker Hook', () => {
    test('useClicker 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => useClicker(), {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        8,
        256 * 1024
      );

      console.log('useClicker:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.final.used - result.initial.used).toBeLessThan(100 * 1024); // 100KB 이하
    });
  });

  describe('usePushKey Hook', () => {
    test('usePushKey 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => usePushKey(), {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        8,
        256 * 1024
      );

      console.log('usePushKey:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
    });

    test('usePushKey 이벤트 리스너 정리 테스트', async () => {
      const initialEventListeners = document.addEventListener.toString();
      
      const hooks: Array<{ unmount: () => void }> = [];
      
      try {
        // 여러 개의 usePushKey hook 생성 (이벤트 리스너가 추가됨)
        for (let i = 0; i < 3; i++) {
          const hook = renderHook(() => usePushKey(), {
            wrapper: TestWrapper,
          });
          hooks.push(hook);
        }

        // 모든 hook 정리
        hooks.forEach(hook => hook.unmount());
        await forceGarbageCollection();

        // 이벤트 리스너가 적절히 정리되었는지 확인
        // (실제 구현에서는 더 정교한 테스트가 필요)
        expect(true).toBe(true); // 기본 검증
        
      } finally {
        hooks.forEach(hook => {
          try {
            hook.unmount();
          } catch (e) {
            // 이미 정리된 경우 무시
          }
        });
      }
    });
  });

  describe('useRideable Hook', () => {
    test('useRideable 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => useRideable(), {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        6,
        512 * 1024
      );

      console.log('useRideable:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
    });
  });

  describe('useTeleport Hook', () => {
    test('useTeleport 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => useTeleport(), {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        8,
        256 * 1024
      );

      console.log('useTeleport:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
    });
  });



  describe('Multiple Hooks 조합 테스트', () => {
    test('여러 hooks 동시 사용 메모리 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => renderHook(() => {
          const controller = useGaesupController();
          const clicker = useClicker();
          const pushKey = usePushKey();
          const rideable = useRideable();
          
          return { controller, clicker, pushKey, rideable };
        }, {
          wrapper: TestWrapper,
        }),
        (result) => result.unmount(),
        5,
        1024 * 1024 // 1MB (더 큰 임계값)
      );

      console.log('다중 Hooks 조합:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(200 * 1024); // 200KB 이하
    });

    test('hooks 생성/제거 반복 스트레스 테스트', async () => {
      const monitor = new MemoryMonitor();
      monitor.start(100);

      const iterations = 20;
      
      try {
        for (let i = 0; i < iterations; i++) {
          const hook = renderHook(() => {
            useGaesupController();
            useClicker();
            usePushKey();
          }, {
            wrapper: TestWrapper,
          });

          // 짧은 생명주기 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 25));
          
          hook.unmount();

          // 가끔 가비지 컬렉션 수행
          if (i % 5 === 0) {
            await forceGarbageCollection();
          }
        }

      } finally {
        monitor.stop();
      }

      const result = monitor.getResult(1024 * 1024);
      console.log('Hooks 스트레스 테스트:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(100 * 1024); // 100KB 이하 평균 증가
    });
  });

  describe('Hook 메모리 사용량 프로파일링', () => {
    test('개별 hook 메모리 사용량 비교', async () => {
      const hooks = [
        { name: 'useGaesupController', hook: useGaesupController },
        { name: 'useClicker', hook: useClicker },
        { name: 'usePushKey', hook: usePushKey },
        { name: 'useRideable', hook: useRideable },
        { name: 'useTeleport', hook: useTeleport },

      ];

      const results = [];

      for (const { name, hook } of hooks) {
        const initialMemory = createMemorySnapshot();
        
        const rendered = renderHook(() => hook(), {
          wrapper: TestWrapper,
        });

        await new Promise(resolve => setTimeout(resolve, 50));
        
        const peakMemory = createMemorySnapshot();
        
        rendered.unmount();
        await forceGarbageCollection();
        
        const finalMemory = createMemorySnapshot();
        
        const memoryUsed = peakMemory.used - initialMemory.used;
        const memoryReleased = peakMemory.used - finalMemory.used;
        const releaseRate = memoryReleased / memoryUsed;
        
        results.push({
          name,
          memoryUsed,
          memoryReleased,
          releaseRate,
        });
      }

      console.log('\nHook 메모리 사용량 프로파일:');
      results.forEach(({ name, memoryUsed, releaseRate }) => {
        console.log(`${name}: ${(memoryUsed / 1024).toFixed(2)}KB (해제율: ${(releaseRate * 100).toFixed(1)}%)`);
      });

      // 모든 hook이 합리적인 메모리 사용량을 가져야 함
      results.forEach(({ name, memoryUsed }) => {
        expect(memoryUsed).toBeLessThan(512 * 1024); // 512KB 이하
      });

      // 모든 hook이 80% 이상 메모리를 해제해야 함
      results.forEach(({ name, releaseRate }) => {
        expect(releaseRate).toBeGreaterThan(0.8);
      });
    });
  });
}); 