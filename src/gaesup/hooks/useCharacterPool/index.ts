import { useCallback, useRef, useMemo } from 'react';
import { useUnifiedFrame } from '../useUnifiedFrame';
import * as THREE from 'three';

interface CharacterInstance {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  currentAnimation: string;
  isActive: boolean;
  lastUpdateTime: number;
}

interface CharacterPoolConfig {
  maxInstances: number;
  updateInterval: number; // ms
  cullingDistance: number; // 카메라로부터 이 거리 이상이면 업데이트 중단
}

// 성능 최적화된 캐릭터 풀
class CharacterPool {
  private instances: Map<string, CharacterInstance> = new Map();
  private availableIds: string[] = [];
  private activeInstances: Set<string> = new Set(); // 🚀 활성 인스턴스만 별도 관리
  private config: CharacterPoolConfig;
  private lastGlobalUpdate = 0;
  private cullingDistanceSquared: number; // 🚀 제곱 거리 사전 계산
  private lodThresholds = {
    near: { distanceSquared: 50 * 50, updateInterval: 16 },
    medium: { distanceSquared: 100 * 100, updateInterval: 33 },
    far: { distanceSquared: 200 * 200, updateInterval: 66 }
  }; // 🚀 LOD 임계값 사전 계산

  constructor(config: CharacterPoolConfig) {
    this.config = config;
    this.cullingDistanceSquared = config.cullingDistance * config.cullingDistance;
    
    // 풀 초기화
    for (let i = 0; i < config.maxInstances; i++) {
      const id = `character-pool-${i}`;
      this.availableIds.push(id);
      this.instances.set(id, {
        id,
        position: new THREE.Vector3(),
        rotation: new THREE.Euler(),
        currentAnimation: 'idle',
        isActive: false,
        lastUpdateTime: 0,
      });
    }
  }

  acquire(position: THREE.Vector3, rotation: THREE.Euler, animation: string): string | null {
    const id = this.availableIds.pop();
    if (!id) return null;

    const instance = this.instances.get(id)!;
    instance.position.copy(position);
    instance.rotation.copy(rotation);
    instance.currentAnimation = animation;
    instance.isActive = true;
    instance.lastUpdateTime = 0; // 다음 프레임에서 즉시 업데이트되도록

    // 🚀 활성 인스턴스 Set에 추가
    this.activeInstances.add(id);

    return id;
  }

  release(id: string) {
    const instance = this.instances.get(id);
    if (instance && instance.isActive) {
      instance.isActive = false;
      this.availableIds.push(id);
      
      // 🚀 활성 인스턴스 Set에서 제거
      this.activeInstances.delete(id);
    }
  }

  update(id: string, position: THREE.Vector3, rotation: THREE.Euler, animation: string) {
    const instance = this.instances.get(id);
    if (instance && instance.isActive) {
      instance.position.copy(position);
      instance.rotation.copy(rotation);
      instance.currentAnimation = animation;
      // lastUpdateTime은 batchUpdate에서 관리
    }
  }

  batchUpdate(cameraPosition: THREE.Vector3, currentTime: number) {
    // 전역 업데이트 간격 체크
    if (currentTime - this.lastGlobalUpdate < this.config.updateInterval) {
      return;
    }
    this.lastGlobalUpdate = currentTime;

    // 🚀 활성 인스턴스만 순회 (Map 전체 순회 제거!)
    for (const id of this.activeInstances) {
      const instance = this.instances.get(id)!;
      
      // 🚀 제곱 거리 비교로 제곱근 연산 완전 제거
      const distanceSquared = instance.position.distanceToSquared(cameraPosition);
      
      // 너무 멀면 업데이트 스킵
      if (distanceSquared > this.cullingDistanceSquared) {
        continue;
      }

      // 🚀 사전 계산된 LOD 임계값으로 빠른 업데이트 빈도 결정
      let updateInterval: number;
      if (distanceSquared < this.lodThresholds.near.distanceSquared) {
        updateInterval = this.lodThresholds.near.updateInterval;
      } else if (distanceSquared < this.lodThresholds.medium.distanceSquared) {
        updateInterval = this.lodThresholds.medium.updateInterval;
      } else {
        updateInterval = this.lodThresholds.far.updateInterval;
      }

      if (currentTime - instance.lastUpdateTime < updateInterval) {
        continue;
      }

      // 여기서 실제 렌더링 업데이트 수행
      instance.lastUpdateTime = currentTime;
    }
  }

  getActiveInstances(): CharacterInstance[] {
    // 🚀 활성 인스턴스 Set을 활용하여 O(n) → O(active) 성능 향상
    const result: CharacterInstance[] = [];
    for (const id of this.activeInstances) {
      const instance = this.instances.get(id)!;
      result.push(instance);
    }
    return result;
  }

  getStats() {
    return {
      total: this.instances.size,
      active: this.activeInstances.size, // 🚀 O(1) 활성 개수 조회
      available: this.availableIds.length,
      utilization: (this.activeInstances.size / this.instances.size) * 100,
    };
  }

  // 🚀 개발용 성능 디버깅 메서드
  getPerformanceStats() {
    return {
      ...this.getStats(),
      cullingDistanceSquared: this.cullingDistanceSquared,
      lodThresholds: this.lodThresholds,
      lastGlobalUpdate: this.lastGlobalUpdate,
    };
  }
}

const defaultConfig: CharacterPoolConfig = {
  maxInstances: 100,
  updateInterval: 16, // 60fps
  cullingDistance: 200,
};

export function useCharacterPool(config: Partial<CharacterPoolConfig> = {}) {
  const finalConfig = useMemo(() => ({ ...defaultConfig, ...config }), [config]);
  const poolRef = useRef<CharacterPool>();

  if (!poolRef.current) {
    poolRef.current = new CharacterPool(finalConfig);
  }

  const pool = poolRef.current;

  // 🚀 통합 프레임 시스템에서 최적화된 배치 업데이트
  useUnifiedFrame(
    'character-pool-batch-update',
    (state) => {
      const cameraPosition = state.camera.position;
      const currentTime = performance.now(); // 🚀 프레임당 1회만 호출
      pool.batchUpdate(cameraPosition, currentTime);
    },
    4, // 패시브 객체들 다음 우선순위
    true
  );

  const acquireCharacter = useCallback((
    position: THREE.Vector3, 
    rotation: THREE.Euler, 
    animation: string = 'idle'
  ) => {
    return pool.acquire(position, rotation, animation);
  }, [pool]);

  const releaseCharacter = useCallback((id: string) => {
    pool.release(id);
  }, [pool]);

  const updateCharacter = useCallback((
    id: string,
    position: THREE.Vector3,
    rotation: THREE.Euler,
    animation: string
  ) => {
    pool.update(id, position, rotation, animation);
  }, [pool]);

  const getStats = useCallback(() => {
    return pool.getStats();
  }, [pool]);

  const getActiveCharacters = useCallback(() => {
    return pool.getActiveInstances();
  }, [pool]);

  // 🚀 성능 디버깅용 추가 메서드
  const getPerformanceStats = useCallback(() => {
    return pool.getPerformanceStats();
  }, [pool]);

  return {
    acquireCharacter,
    releaseCharacter,
    updateCharacter,
    getStats,
    getActiveCharacters,
    getPerformanceStats, // 🚀 성능 모니터링용
  };
} 