import * as THREE from 'three';

/**
 * 재사용 가능한 벡터 캐시 시스템
 */
export function createVectorCache() {
  const cache = new Map<string, THREE.Vector3>();
  const tempVectors: THREE.Vector3[] = [];
  
  // 재사용 가능한 임시 벡터 풀 (10개)
  for (let i = 0; i < 10; i++) {
    tempVectors.push(new THREE.Vector3());
  }
  
  return {
    /**
     * 임시 벡터 가져오기 (재사용)
     */
    getTempVector(index: number): THREE.Vector3 {
      const vector = tempVectors[index % tempVectors.length];
      vector.set(0, 0, 0); // 초기화
      return vector;
    },
    
    /**
     * 캐시된 벡터 가져오기
     */
    getCached(key: string, factory: () => THREE.Vector3): THREE.Vector3 {
      if (!cache.has(key)) {
        cache.set(key, factory());
        
        // 캐시 크기 제한 (100개)
        if (cache.size > 100) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      }
      return cache.get(key)!;
    },
    
    /**
     * 캐시 클리어
     */
    clear() {
      cache.clear();
    },
    
    /**
     * 캐시 상태 정보
     */
    getStats() {
      return {
        cacheSize: cache.size,
        tempVectorCount: tempVectors.length,
      };
    }
  };
}

/**
 * 삼각함수 메모이제이션 캐시
 */
export const trigCache = new Map<number, { sin: number; cos: number }>();

/**
 * 캐시된 삼각함수 값 가져오기
 */
export function getCachedTrig(angle: number): { sin: number; cos: number } {
  // 0.01 라디안 단위로 반올림하여 캐싱 (정밀도와 캐시 효율성의 균형)
  const key = Math.round(angle * 100) / 100;
  
  if (!trigCache.has(key)) {
    trigCache.set(key, {
      sin: Math.sin(angle),
      cos: Math.cos(angle)
    });
    
    // 캐시 크기 제한 (1000개, 약 2π * 1000/100 = 62.8 라디안 범위)
    if (trigCache.size > 1000) {
      const firstKey = trigCache.keys().next().value;
      trigCache.delete(firstKey);
    }
  }
  
  return trigCache.get(key)!;
}

/**
 * 삼각함수 캐시 클리어
 */
export function clearTrigCache(): void {
  trigCache.clear();
}

/**
 * 삼각함수 캐시 상태 정보
 */
export function getTrigCacheStats() {
  return {
    size: trigCache.size,
    maxSize: 1000,
    coverage: `${((trigCache.size / 1000) * 100).toFixed(1)}%`
  };
}

/**
 * 각도 정규화 (메모이제이션과 함께 사용)
 */
export function normalizeAngle(angle: number): number {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

/**
 * 거리 기반 메모이제이션 (작은 차이 무시)
 */
export function shouldUpdate(current: number, previous: number, threshold: number = 0.01): boolean {
  return Math.abs(current - previous) >= threshold;
}

/**
 * 벡터 거리 기반 메모이제이션
 */
export function shouldUpdateVector3(current: THREE.Vector3, previous: THREE.Vector3, threshold: number = 0.01): boolean {
  return current.distanceTo(previous) >= threshold;
}

/**
 * 전역 메모이제이션 관리자
 */
export class MemoizationManager {
  private static instance: MemoizationManager;
  private vectorCaches = new Map<string, ReturnType<typeof createVectorCache>>();
  
  static getInstance(): MemoizationManager {
    if (!this.instance) {
      this.instance = new MemoizationManager();
    }
    return this.instance;
  }
  
  getVectorCache(id: string): ReturnType<typeof createVectorCache> {
    if (!this.vectorCaches.has(id)) {
      this.vectorCaches.set(id, createVectorCache());
    }
    return this.vectorCaches.get(id)!;
  }
  
  clearAll(): void {
    this.vectorCaches.forEach(cache => cache.clear());
    clearTrigCache();
  }
  
  getStats() {
    const vectorStats = Array.from(this.vectorCaches.entries()).map(([id, cache]) => ({
      id,
      ...cache.getStats()
    }));
    
    return {
      vectorCaches: vectorStats,
      trigCache: getTrigCacheStats(),
    };
  }
} 