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

class CharacterPool {
  private instances: Map<string, CharacterInstance> = new Map();
  private availableIds: string[] = [];
  private config: CharacterPoolConfig;
  private lastGlobalUpdate = 0;

  constructor(config: CharacterPoolConfig) {
    this.config = config;
    
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
    instance.lastUpdateTime = performance.now();

    return id;
  }

  release(id: string) {
    const instance = this.instances.get(id);
    if (instance && instance.isActive) {
      instance.isActive = false;
      this.availableIds.push(id);
    }
  }

  update(id: string, position: THREE.Vector3, rotation: THREE.Euler, animation: string) {
    const instance = this.instances.get(id);
    if (instance && instance.isActive) {
      instance.position.copy(position);
      instance.rotation.copy(rotation);
      instance.currentAnimation = animation;
      instance.lastUpdateTime = performance.now();
    }
  }

  batchUpdate(cameraPosition: THREE.Vector3, currentTime: number) {
    // 전역 업데이트 간격 체크
    if (currentTime - this.lastGlobalUpdate < this.config.updateInterval) {
      return;
    }
    this.lastGlobalUpdate = currentTime;

    // 거리 기반 컬링 및 배치 업데이트
    for (const [id, instance] of this.instances) {
      if (!instance.isActive) continue;

      const distance = instance.position.distanceTo(cameraPosition);
      
      // 너무 멀면 업데이트 스킵
      if (distance > this.config.cullingDistance) {
        continue;
      }

      // LOD 기반 업데이트 빈도 조절
      const updateFrequency = distance < 50 ? 16 : distance < 100 ? 33 : 66; // ms
      if (currentTime - instance.lastUpdateTime < updateFrequency) {
        continue;
      }

      // 여기서 실제 렌더링 업데이트 수행
      instance.lastUpdateTime = currentTime;
    }
  }

  getActiveInstances(): CharacterInstance[] {
    return Array.from(this.instances.values()).filter(instance => instance.isActive);
  }

  getStats() {
    const active = this.getActiveInstances().length;
    return {
      total: this.instances.size,
      active,
      available: this.availableIds.length,
      utilization: (active / this.instances.size) * 100,
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

  // 통합 프레임 시스템에서 배치 업데이트
  useUnifiedFrame(
    'character-pool-batch-update',
    (state) => {
      const cameraPosition = state.camera.position;
      const currentTime = performance.now();
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

  return {
    acquireCharacter,
    releaseCharacter,
    updateCharacter,
    getStats,
    getActiveCharacters,
  };
} 