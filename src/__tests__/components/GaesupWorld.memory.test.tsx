import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController } from '../../index';
import {
  testComponentMemoryUsage,
  formatMemoryResult,
  MemoryMonitor,
  forceGarbageCollection,
  createMemorySnapshot,
} from '../utils/memoryTestUtils';

// Mock 3D model URL
const MOCK_CHARACTER_URL = 'https://example.com/mock-character.glb';

describe('GaesupWorld Memory Tests', () => {
  let memoryMonitor: MemoryMonitor;

  beforeEach(() => {
    memoryMonitor = new MemoryMonitor();
  });

  afterEach(async () => {
    cleanup();
    await forceGarbageCollection();
  });

  describe('기본 메모리 사용량 테스트', () => {
    test('GaesupWorld 컴포넌트 단독 마운트/언마운트', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <div>Test Content</div>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        5, // 5번 반복
        512 * 1024 // 512KB 누수 임계값
      );

      console.log(formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.final.used - result.initial.used).toBeLessThan(result.leakThreshold);
    });

    test('GaesupWorld + Canvas + Physics 전체 스택', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        3, // 3번 반복 (더 무거운 테스트)
        1024 * 1024 // 1MB 누수 임계값
      );

      console.log(formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(100 * 1024); // 100KB 이하 평균 증가
    });
  });

  describe('다양한 설정에서의 메모리 테스트', () => {
    test('다양한 컨트롤러 모드 테스트', async () => {
      const controllers = ['keyboard', 'joystick', 'gamepad'] as const;
      
      for (const controller of controllers) {
        const result = await testComponentMemoryUsage(
          () => render(
            <GaesupWorld
              urls={{ characterUrl: MOCK_CHARACTER_URL }}
              mode={{ controller }}
            >
              <Canvas>
                <Physics>
                  <GaesupController />
                </Physics>
              </Canvas>
            </GaesupWorld>
          ),
          (component) => component.unmount(),
          2,
          1024 * 1024
        );

        console.log(`${controller} 컨트롤러:`, formatMemoryResult(result));
        expect(result.hasMemoryLeak).toBe(false);
      }
    });

    test('블록 스크롤 옵션 메모리 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'joystick' }}
            block={{ scrollBlock: true }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        3,
        1024 * 1024
      );

      console.log('스크롤 블록 옵션:', formatMemoryResult(result));
      expect(result.hasMemoryLeak).toBe(false);
    });
  });

  describe('장시간 실행 시뮬레이션', () => {
    test('연속적인 상태 변경 메모리 테스트', async () => {
      memoryMonitor.start(100);
      
      const { unmount } = render(
        <GaesupWorld
          urls={{ characterUrl: MOCK_CHARACTER_URL }}
          mode={{ controller: 'keyboard' }}
        >
          <Canvas>
            <Physics>
              <GaesupController />
            </Physics>
          </Canvas>
        </GaesupWorld>
      );

      // 여러 상태 변경을 시뮬레이션
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // 강제 리렌더링 트리거 (실제 사용에서 발생할 수 있는 상황)
        if (i % 3 === 0) {
          await forceGarbageCollection();
        }
      }

      unmount();
      const snapshots = memoryMonitor.stop();
      const result = memoryMonitor.getResult(1024 * 1024);

      console.log('장시간 실행 테스트:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(snapshots.length).toBeGreaterThan(5);
    });
  });

  describe('메모리 성능 벤치마크', () => {
    test('초기 로딩 시간 및 메모리 사용량', async () => {
      const startTime = performance.now();
      const initialMemory = createMemorySnapshot();
      
      const { unmount } = render(
        <GaesupWorld
          urls={{ characterUrl: MOCK_CHARACTER_URL }}
          mode={{ controller: 'keyboard' }}
        >
          <Canvas>
            <Physics>
              <GaesupController />
            </Physics>
          </Canvas>
        </GaesupWorld>
      );

      // 컴포넌트가 완전히 마운트될 때까지 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const loadTime = performance.now() - startTime;
      const loadedMemory = createMemorySnapshot();
      
      unmount();
      await forceGarbageCollection();
      
      const finalMemory = createMemorySnapshot();
      
      console.log(`
      성능 벤치마크:
      - 로딩 시간: ${loadTime.toFixed(2)}ms
      - 초기 메모리: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB
      - 로딩 후 메모리: ${(loadedMemory.used / 1024 / 1024).toFixed(2)}MB
      - 정리 후 메모리: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB
      - 메모리 증가량: ${((loadedMemory.used - initialMemory.used) / 1024 / 1024).toFixed(2)}MB
      - 메모리 정리율: ${((loadedMemory.used - finalMemory.used) / (loadedMemory.used - initialMemory.used) * 100).toFixed(1)}%
      `);
      
      // 성능 기준 검증
      expect(loadTime).toBeLessThan(1000); // 1초 이내 로딩
      expect(loadedMemory.used - initialMemory.used).toBeLessThan(10 * 1024 * 1024); // 10MB 이내 메모리 사용
      
      // 메모리 정리가 80% 이상 되어야 함
      const cleanupRate = (loadedMemory.used - finalMemory.used) / (loadedMemory.used - initialMemory.used);
      expect(cleanupRate).toBeGreaterThan(0.8);
    });

    test('동시 다중 인스턴스 메모리 테스트', async () => {
      const instances: Array<{ unmount: () => void }> = [];
      const initialMemory = createMemorySnapshot();
      
      try {
        // 3개의 동시 인스턴스 생성
        for (let i = 0; i < 3; i++) {
          const instance = render(
            <GaesupWorld
              urls={{ characterUrl: MOCK_CHARACTER_URL }}
              mode={{ controller: 'keyboard' }}
            >
              <Canvas>
                <Physics>
                  <GaesupController />
                </Physics>
              </Canvas>
            </GaesupWorld>
          );
          instances.push(instance);
          
          // 각 인스턴스 간 간격
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        const peakMemory = createMemorySnapshot();
        
        // 모든 인스턴스 정리
        instances.forEach(instance => instance.unmount());
        await forceGarbageCollection();
        
        const finalMemory = createMemorySnapshot();
        
        console.log(`
        다중 인스턴스 테스트:
        - 초기 메모리: ${(initialMemory.used / 1024 / 1024).toFixed(2)}MB
        - 최대 메모리: ${(peakMemory.used / 1024 / 1024).toFixed(2)}MB  
        - 정리 후 메모리: ${(finalMemory.used / 1024 / 1024).toFixed(2)}MB
        - 인스턴스당 평균 사용량: ${((peakMemory.used - initialMemory.used) / 3 / 1024 / 1024).toFixed(2)}MB
        `);
        
        // 메모리 사용량이 합리적인 범위인지 확인
        const memoryPerInstance = (peakMemory.used - initialMemory.used) / 3;
        expect(memoryPerInstance).toBeLessThan(5 * 1024 * 1024); // 인스턴스당 5MB 이하
        
        // 정리 후 메모리가 적절히 해제되었는지 확인
        const retainedMemory = finalMemory.used - initialMemory.used;
        expect(retainedMemory).toBeLessThan(1024 * 1024); // 1MB 이하 잔여 메모리
        
      } finally {
        // 안전한 정리
        instances.forEach(instance => {
          try {
            instance.unmount();
          } catch (e) {
            // 이미 정리된 경우 무시
          }
        });
      }
    });
  });
}); 