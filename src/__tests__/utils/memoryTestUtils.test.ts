import {
  createMemorySnapshot,
  forceGarbageCollection,
  MemoryMonitor,
  formatMemoryResult,
  checkThreeJSMemoryLeaks,
} from './memoryTestUtils';

describe('Memory Test Utils', () => {
  describe('createMemorySnapshot', () => {
    test('메모리 스냅샷 생성', () => {
      const snapshot = createMemorySnapshot();
      
      expect(snapshot).toHaveProperty('used');
      expect(snapshot).toHaveProperty('total');
      expect(snapshot).toHaveProperty('limit');
      expect(snapshot).toHaveProperty('timestamp');
      expect(typeof snapshot.used).toBe('number');
      expect(typeof snapshot.total).toBe('number');
      expect(typeof snapshot.limit).toBe('number');
      expect(typeof snapshot.timestamp).toBe('number');
    });
  });

  describe('forceGarbageCollection', () => {
    test('가비지 컬렉션 실행', async () => {
      // 함수가 에러 없이 실행되는지 확인
      await expect(forceGarbageCollection()).resolves.toBeUndefined();
    });
  });

  describe('MemoryMonitor', () => {
    test('메모리 모니터 시작/중지', async () => {
      const monitor = new MemoryMonitor();
      
      monitor.start(10);
      await new Promise(resolve => setTimeout(resolve, 50));
      const snapshots = monitor.stop();
      
      expect(Array.isArray(snapshots)).toBe(true);
      expect(snapshots.length).toBeGreaterThan(1);
      
      // 각 스냅샷이 올바른 구조를 가지는지 확인
      snapshots.forEach(snapshot => {
        expect(snapshot).toHaveProperty('used');
        expect(snapshot).toHaveProperty('total');
        expect(snapshot).toHaveProperty('limit');
        expect(snapshot).toHaveProperty('timestamp');
      });
    });

    test('메모리 모니터 결과 분석', async () => {
      const monitor = new MemoryMonitor();
      
      monitor.start(10);
      await new Promise(resolve => setTimeout(resolve, 100));
      monitor.stop();
      
      const result = monitor.getResult(1024 * 1024);
      
      expect(result).toHaveProperty('initial');
      expect(result).toHaveProperty('peak');
      expect(result).toHaveProperty('final');
      expect(result).toHaveProperty('averageGrowth');
      expect(result).toHaveProperty('maxGrowth');
      expect(result).toHaveProperty('hasMemoryLeak');
      expect(result).toHaveProperty('leakThreshold');
      
      expect(typeof result.hasMemoryLeak).toBe('boolean');
    });
  });

  describe('formatMemoryResult', () => {
    test('메모리 결과 포맷팅', () => {
      const mockResult = {
        initial: { used: 1024 * 1024 * 10, total: 1024 * 1024 * 50, limit: 1024 * 1024 * 100, timestamp: Date.now() },
        peak: { used: 1024 * 1024 * 15, total: 1024 * 1024 * 50, limit: 1024 * 1024 * 100, timestamp: Date.now() },
        final: { used: 1024 * 1024 * 11, total: 1024 * 1024 * 50, limit: 1024 * 1024 * 100, timestamp: Date.now() },
        averageGrowth: 1024 * 100,
        maxGrowth: 1024 * 500,
        hasMemoryLeak: false,
        leakThreshold: 1024 * 1024,
      };
      
      const formatted = formatMemoryResult(mockResult);
      
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('메모리 테스트 결과');
      expect(formatted).toContain('초기 사용량');
      expect(formatted).toContain('최대 사용량');
      expect(formatted).toContain('최종 사용량');
      expect(formatted).toContain('MB');
    });
  });

  describe('checkThreeJSMemoryLeaks', () => {
    test('Three.js 메모리 누수 체크 - null scene', () => {
      const warnings = checkThreeJSMemoryLeaks(null);
      expect(Array.isArray(warnings)).toBe(true);
      expect(warnings.length).toBe(0);
    });

    test('Three.js 메모리 누수 체크 - mock scene', () => {
      const mockScene = {
        traverse: jest.fn((callback) => {
          const mockObject = {
            type: 'Mesh',
            geometry: { dispose: jest.fn(), isDisposed: false },
            material: {
              type: 'MeshStandardMaterial',
              dispose: jest.fn(),
              isDisposed: false,
              map: { isTexture: true, dispose: jest.fn(), isDisposed: false },
            },
          };
          callback(mockObject);
        }),
      };
      
      const warnings = checkThreeJSMemoryLeaks(mockScene);
      
      expect(Array.isArray(warnings)).toBe(true);
      expect(mockScene.traverse).toHaveBeenCalled();
    });
  });
}); 