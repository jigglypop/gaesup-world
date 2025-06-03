import { act } from '@testing-library/react';
import * as THREE from 'three';

export interface MemorySnapshot {
  used: number;
  total: number;
  limit: number;
  timestamp: number;
}

export interface MemoryTestResult {
  initial: MemorySnapshot;
  peak: MemorySnapshot;
  final: MemorySnapshot;
  averageGrowth: number;
  maxGrowth: number;
  hasMemoryLeak: boolean;
  leakThreshold: number;
}

/**
 * 메모리 스냅샷을 생성합니다
 */
export function createMemorySnapshot(): MemorySnapshot {
  const memory = (global as any).measureMemory();
  return {
    ...memory,
    timestamp: Date.now(),
  };
}

/**
 * 강제 가비지 컬렉션을 시도합니다 (개발 환경에서만)
 */
export async function forceGarbageCollection(): Promise<void> {
  // Node.js 환경에서 가비지 컬렉션 강제 실행
  if (global.gc) {
    global.gc();
  }

  // 브라우저에서는 메모리 압박을 시뮬레이션
  if (typeof window !== 'undefined') {
    // 큰 배열을 생성했다가 제거하여 GC 트리거
    const arr = new Array(1000000).fill(0);
    arr.length = 0;
  }

  // Promise를 사용하여 비동기적으로 대기
  return new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * 메모리 사용량 변화를 모니터링합니다
 */
export class MemoryMonitor {
  private snapshots: MemorySnapshot[] = [];
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 100): void {
    this.snapshots = [];
    this.snapshots.push(createMemorySnapshot());

    this.intervalId = setInterval(() => {
      this.snapshots.push(createMemorySnapshot());
    }, intervalMs);
  }

  stop(): MemorySnapshot[] {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    return this.snapshots;
  }

  getResult(leakThreshold: number = 1024 * 1024): MemoryTestResult {
    if (this.snapshots.length < 2) {
      throw new Error('메모리 모니터링이 충분히 수행되지 않았습니다');
    }

    const initial = this.snapshots[0];
    const final = this.snapshots[this.snapshots.length - 1];
    const peak = this.snapshots.reduce(
      (max, current) => (current.used > max.used ? current : max),
      initial,
    );

    const growthValues = this.snapshots
      .slice(1)
      .map((snapshot, index) => snapshot.used - this.snapshots[index].used);

    const averageGrowth =
      growthValues.reduce((sum, growth) => sum + growth, 0) / growthValues.length;
    const maxGrowth = Math.max(...growthValues);

    const totalGrowth = final.used - initial.used;
    const hasMemoryLeak = totalGrowth > leakThreshold;

    return {
      initial,
      peak,
      final,
      averageGrowth,
      maxGrowth,
      hasMemoryLeak,
      leakThreshold,
    };
  }
}

/**
 * 컴포넌트의 메모리 사용량을 테스트합니다
 */
export async function testComponentMemoryUsage<T>(
  renderComponent: () => T,
  unmountComponent: (component: T) => void,
  iterations: number = 10,
  leakThreshold: number = 1024 * 1024, // 1MB
): Promise<MemoryTestResult> {
  const monitor = new MemoryMonitor();
  monitor.start(50);

  // 초기 메모리 측정
  await forceGarbageCollection();
  const components: T[] = [];

  try {
    // 컴포넌트를 여러 번 마운트/언마운트
    for (let i = 0; i < iterations; i++) {
      await act(async () => {
        const component = renderComponent();
        components.push(component);

        // 잠시 대기 (렌더링 완료를 위함)
        await new Promise((resolve) => setTimeout(resolve, 50));

        unmountComponent(component);

        // 가비지 컬렉션 기회 제공
        if (i % 3 === 0) {
          await forceGarbageCollection();
        }
      });
    }

    // 최종 정리
    await forceGarbageCollection();
    await new Promise((resolve) => setTimeout(resolve, 200));
  } finally {
    monitor.stop();
  }

  return monitor.getResult(leakThreshold);
}

/**
 * 메모리 테스트 결과를 포맷팅합니다
 */
export function formatMemoryResult(result: MemoryTestResult): string {
  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)}MB`;
  };

  return `
메모리 테스트 결과:
- 초기 사용량: ${formatBytes(result.initial.used)}
- 최대 사용량: ${formatBytes(result.peak.used)}
- 최종 사용량: ${formatBytes(result.final.used)}
- 평균 증가량: ${formatBytes(result.averageGrowth)}
- 최대 증가량: ${formatBytes(result.maxGrowth)}
- 총 증가량: ${formatBytes(result.final.used - result.initial.used)}
- 메모리 누수 여부: ${result.hasMemoryLeak ? '감지됨' : '정상'}
- 누수 임계값: ${formatBytes(result.leakThreshold)}
  `.trim();
}

/**
 * Three.js 관련 메모리 누수를 체크합니다
 */
export function checkThreeJSMemoryLeaks(scene: THREE.Scene | THREE.Object3D): string[] {
  const warnings: string[] = [];

  if (!scene) return warnings;

  // Geometry 체크
  scene.traverse?.((object: THREE.Object3D) => {
    if ('geometry' in object && object.geometry) {
      const geometry = object.geometry as THREE.BufferGeometry;
      if (geometry.dispose && !(geometry as any).isDisposed) {
        warnings.push(`Geometry not disposed: ${object.type}`);
      }
    }

    // Material 체크
    if ('material' in object && object.material) {
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      materials.forEach((material: THREE.Material) => {
        if (material.dispose && !(material as any).isDisposed) {
          warnings.push(`Material not disposed: ${material.type}`);
        }

        // Texture 체크
        Object.keys(material).forEach((key) => {
          const prop = (material as any)[key];
          if (prop && prop.isTexture && prop.dispose && !prop.isDisposed) {
            warnings.push(`Texture not disposed: ${key}`);
          }
        });
      });
    }
  });

  return warnings;
}

export default {
  createMemorySnapshot,
  forceGarbageCollection,
  MemoryMonitor,
  testComponentMemoryUsage,
  formatMemoryResult,
  checkThreeJSMemoryLeaks,
};
