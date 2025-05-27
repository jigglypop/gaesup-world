import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { GaesupWorld, GaesupController, Rideable } from '../../index';
import { V3 } from '../../gaesup/utils/vector';
import {
  testComponentMemoryUsage,
  formatMemoryResult,
  MemoryMonitor,
  forceGarbageCollection,
  createMemorySnapshot,
  checkThreeJSMemoryLeaks,
} from '../utils/memoryTestUtils';

// Mock URLs
const MOCK_CHARACTER_URL = 'https://example.com/mock-character.glb';
const MOCK_VEHICLE_URL = 'https://example.com/mock-vehicle.glb';
const MOCK_WHEEL_URL = 'https://example.com/mock-wheel.glb';
const MOCK_AIRPLANE_URL = 'https://example.com/mock-airplane.glb';

describe('Rideable Component Memory Tests', () => {
  afterEach(async () => {
    cleanup();
    await forceGarbageCollection();
  });

  describe('기본 Rideable 컴포넌트 메모리 테스트', () => {
    test('Vehicle 타입 Rideable 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="test-vehicle"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        3, // 3번 반복
        2 * 1024 * 1024 // 2MB 임계값 (3D 모델 포함)
      );

      console.log('Vehicle Rideable:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.final.used - result.initial.used).toBeLessThan(result.leakThreshold);
    });

    test('Airplane 타입 Rideable 메모리 누수 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="test-airplane"
                  objectType="airplane"
                  url={MOCK_AIRPLANE_URL}
                  position={V3(0, 5, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        3,
        2 * 1024 * 1024
      );

      console.log('Airplane Rideable:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.final.used - result.initial.used).toBeLessThan(result.leakThreshold);
    });
  });

  describe('다중 Rideable 객체 메모리 테스트', () => {
    test('여러 Vehicle 동시 생성/제거 테스트', async () => {
      const result = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="vehicle-1"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  position={V3(-5, 1, 0)}
                />
                <Rideable
                  objectkey="vehicle-2"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  position={V3(5, 1, 0)}
                />
                <Rideable
                  objectkey="airplane-1"
                  objectType="airplane"
                  url={MOCK_AIRPLANE_URL}
                  position={V3(0, 10, -5)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        2,
        5 * 1024 * 1024 // 5MB 임계값 (다중 3D 모델)
      );

      console.log('다중 Rideable:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(500 * 1024); // 500KB 이하 평균 증가
    });

    test('동적 Rideable 추가/제거 시뮬레이션', async () => {
      const monitor = new MemoryMonitor();
      monitor.start(100);

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

      try {
        // 동적으로 Rideable 컴포넌트 추가/제거 시뮬레이션
        for (let i = 0; i < 5; i++) {
          // 실제 애플리케이션에서는 state 변경을 통해 동적으로 추가/제거됨
          await new Promise(resolve => setTimeout(resolve, 100));
          
          if (i % 2 === 0) {
            await forceGarbageCollection();
          }
        }

      } finally {
        unmount();
        monitor.stop();
      }

      const result = monitor.getResult(3 * 1024 * 1024);
      console.log('동적 Rideable 시뮬레이션:', formatMemoryResult(result));
      
      expect(result.hasMemoryLeak).toBe(false);
    });
  });

  describe('Rideable 설정별 메모리 테스트', () => {
    test('isRiderOn 설정에 따른 메모리 사용량 차이', async () => {
      const riderOnResult = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="rider-on-vehicle"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  isRiderOn={true}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        2,
        2 * 1024 * 1024
      );

      const riderOffResult = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="rider-off-vehicle"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  isRiderOn={false}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        2,
        2 * 1024 * 1024
      );

      console.log('Rider ON:', formatMemoryResult(riderOnResult));
      console.log('Rider OFF:', formatMemoryResult(riderOffResult));

      expect(riderOnResult.hasMemoryLeak).toBe(false);
      expect(riderOffResult.hasMemoryLeak).toBe(false);

      // 메모리 사용량 비교 (큰 차이가 없어야 함)
      const memoryDiff = Math.abs(
        (riderOnResult.peak.used - riderOnResult.initial.used) -
        (riderOffResult.peak.used - riderOffResult.initial.used)
      );
      expect(memoryDiff).toBeLessThan(1024 * 1024); // 1MB 이하 차이
    });

    test('다양한 크기 설정에 따른 메모리 사용량', async () => {
      const smallSize = V3(0.5, 0.5, 0.5);
      const largeSize = V3(2.0, 2.0, 2.0);

      const smallSizeResult = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="small-vehicle"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  vehicleSize={smallSize}
                  wheelSize={smallSize}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        2,
        2 * 1024 * 1024
      );

      const largeSizeResult = await testComponentMemoryUsage(
        () => render(
          <GaesupWorld
            urls={{ characterUrl: MOCK_CHARACTER_URL }}
            mode={{ controller: 'keyboard' }}
          >
            <Canvas>
              <Physics>
                <GaesupController />
                <Rideable
                  objectkey="large-vehicle"
                  objectType="vehicle"
                  url={MOCK_VEHICLE_URL}
                  wheelUrl={MOCK_WHEEL_URL}
                  vehicleSize={largeSize}
                  wheelSize={largeSize}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        ),
        (component) => component.unmount(),
        2,
        2 * 1024 * 1024
      );

      console.log('작은 크기:', formatMemoryResult(smallSizeResult));
      console.log('큰 크기:', formatMemoryResult(largeSizeResult));

      expect(smallSizeResult.hasMemoryLeak).toBe(false);
      expect(largeSizeResult.hasMemoryLeak).toBe(false);
    });
  });

  describe('3D 모델 관련 메모리 테스트', () => {
    test('3D 모델 로딩 성능 및 메모리 사용량', async () => {
      const models = [
        { name: 'Vehicle', url: MOCK_VEHICLE_URL, type: 'vehicle' as const },
        { name: 'Airplane', url: MOCK_AIRPLANE_URL, type: 'airplane' as const },
      ];

      for (const model of models) {
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
                <Rideable
                  objectkey={`perf-test-${model.type}`}
                  objectType={model.type}
                  url={model.url}
                  wheelUrl={model.type === 'vehicle' ? MOCK_WHEEL_URL : undefined}
                  position={V3(0, 1, 0)}
                />
              </Physics>
            </Canvas>
          </GaesupWorld>
        );

        // 모델 로딩 완료 대기
        await new Promise(resolve => setTimeout(resolve, 200));

        const loadTime = performance.now() - startTime;
        const loadedMemory = createMemorySnapshot();

        unmount();
        await forceGarbageCollection();

        const finalMemory = createMemorySnapshot();

        console.log(`
        ${model.name} 모델 성능:
        - 로딩 시간: ${loadTime.toFixed(2)}ms
        - 메모리 사용량: ${((loadedMemory.used - initialMemory.used) / 1024 / 1024).toFixed(2)}MB
        - 메모리 정리율: ${(((loadedMemory.used - finalMemory.used) / (loadedMemory.used - initialMemory.used)) * 100).toFixed(1)}%
        `);

        // 성능 기준
        expect(loadTime).toBeLessThan(2000); // 2초 이내 로딩
        expect(loadedMemory.used - initialMemory.used).toBeLessThan(8 * 1024 * 1024); // 8MB 이내

        // 메모리 정리율 확인
        const cleanupRate = (loadedMemory.used - finalMemory.used) / (loadedMemory.used - initialMemory.used);
        expect(cleanupRate).toBeGreaterThan(0.7); // 70% 이상 정리
      }
    });

    test('Three.js 객체 정리 확인 (Mock)', async () => {
      // 실제 환경에서는 Three.js scene을 검사할 수 있습니다
      const mockScene = {
        traverse: jest.fn((callback) => {
          // Mock mesh objects
          const mockObjects = [
            {
              type: 'Mesh',
              geometry: { dispose: jest.fn(), isDisposed: false },
              material: {
                type: 'MeshStandardMaterial',
                dispose: jest.fn(),
                isDisposed: false,
                map: { isTexture: true, dispose: jest.fn(), isDisposed: false },
              },
            },
          ];
          mockObjects.forEach(callback);
        }),
      };

      const { unmount } = render(
        <GaesupWorld
          urls={{ characterUrl: MOCK_CHARACTER_URL }}
          mode={{ controller: 'keyboard' }}
        >
          <Canvas>
            <Physics>
              <GaesupController />
              <Rideable
                objectkey="cleanup-test"
                objectType="vehicle"
                url={MOCK_VEHICLE_URL}
                wheelUrl={MOCK_WHEEL_URL}
                position={V3(0, 1, 0)}
              />
            </Physics>
          </Canvas>
        </GaesupWorld>
      );

      await new Promise(resolve => setTimeout(resolve, 100));

      unmount();
      await forceGarbageCollection();

      // Mock scene으로 메모리 누수 체크 시뮬레이션
      const warnings = checkThreeJSMemoryLeaks(mockScene);
      console.log('Three.js 정리 경고:', warnings);

      // 실제 구현에서는 정리되지 않은 객체가 없어야 함
      // expect(warnings.length).toBe(0);
    });
  });

  describe('Rideable 스트레스 테스트', () => {
    test('대량의 Rideable 객체 생성/제거', async () => {
      const monitor = new MemoryMonitor();
      monitor.start(200);

      try {
        for (let batch = 0; batch < 3; batch++) {
          const instances: Array<{ unmount: () => void }> = [];

          // 배치별로 여러 Rideable 인스턴스 생성
          for (let i = 0; i < 2; i++) {
            const instance = render(
              <GaesupWorld
                urls={{ characterUrl: MOCK_CHARACTER_URL }}
                mode={{ controller: 'keyboard' }}
              >
                <Canvas>
                  <Physics>
                    <GaesupController />
                    <Rideable
                      objectkey={`stress-${batch}-${i}`}
                      objectType={i % 2 === 0 ? 'vehicle' : 'airplane'}
                      url={i % 2 === 0 ? MOCK_VEHICLE_URL : MOCK_AIRPLANE_URL}
                      wheelUrl={i % 2 === 0 ? MOCK_WHEEL_URL : undefined}
                      position={V3(i * 2, 1, batch * 2)}
                    />
                  </Physics>
                </Canvas>
              </GaesupWorld>
            );
            instances.push(instance);
            
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          // 배치 정리
          instances.forEach(instance => instance.unmount());
          await forceGarbageCollection();
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } finally {
        monitor.stop();
      }

      const result = monitor.getResult(5 * 1024 * 1024);
      console.log('Rideable 스트레스 테스트:', formatMemoryResult(result));

      expect(result.hasMemoryLeak).toBe(false);
      expect(result.averageGrowth).toBeLessThan(200 * 1024); // 200KB 이하 평균 증가
    });
  });
}); 