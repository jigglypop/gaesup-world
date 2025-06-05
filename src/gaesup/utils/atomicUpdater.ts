/**
 * 불필요한 리렌더링을 방지하기 위한 원자적 업데이트 관리자
 * 여러 상태 변경을 배치 처리하여 한 번에 적용합니다.
 */

type UpdateFunction = (payload: any) => void;
type StateCompareFn = (current: any, next: any) => boolean;

interface UpdateEntry {
  path: string;
  value: any;
  priority: number;
  timestamp: number;
}

interface AtomicUpdaterConfig {
  batchDelay: number; // 배치 처리 지연 시간 (ms)
  maxBatchSize: number; // 최대 배치 크기
  enableLogging: boolean; // 로깅 활성화
}

export class AtomicUpdater {
  private pendingUpdates = new Map<string, UpdateEntry>();
  private updateScheduled = false;
  private batchTimeoutId: number | null = null;
  private updateStats = {
    totalUpdates: 0,
    batchedUpdates: 0,
    skippedUpdates: 0,
    lastBatchSize: 0,
  };
  
  private config: AtomicUpdaterConfig = {
    batchDelay: 16, // ~60fps
    maxBatchSize: 50,
    enableLogging: false,
  };

  constructor(
    private dispatch: UpdateFunction,
    config?: Partial<AtomicUpdaterConfig>
  ) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  /**
   * 업데이트 스케줄링
   */
  update(path: string, value: any, priority: number = 5): void {
    const existingUpdate = this.pendingUpdates.get(path);
    
    // 동일한 값인지 확인 (얕은 비교)
    if (existingUpdate && this.shallowEqual(existingUpdate.value, value)) {
      this.updateStats.skippedUpdates++;
      return;
    }

    this.pendingUpdates.set(path, {
      path,
      value,
      priority,
      timestamp: performance.now(),
    });

    this.updateStats.totalUpdates++;
    this.scheduleFlush();
  }

  /**
   * 즉시 업데이트 (배치 처리 무시)
   */
  updateImmediate(path: string, value: any): void {
    this.flushSpecificPath(path, value);
    this.pendingUpdates.delete(path);
  }

  /**
   * 여러 경로를 한 번에 업데이트
   */
  updateBatch(updates: Record<string, any>, priority: number = 5): void {
    Object.entries(updates).forEach(([path, value]) => {
      this.update(path, value, priority);
    });
  }

  /**
   * 조건부 업데이트
   */
  updateIf(
    path: string, 
    value: any, 
    condition: () => boolean, 
    priority: number = 5
  ): void {
    if (condition()) {
      this.update(path, value, priority);
    }
  }

  /**
   * 플러시 스케줄링
   */
  private scheduleFlush(): void {
    if (this.updateScheduled) return;

    this.updateScheduled = true;

    // 즉시 실행할 것인지 지연할 것인지 결정
    if (this.pendingUpdates.size >= this.config.maxBatchSize) {
      // 배치 크기가 크면 즉시 실행
      this.flushImmediate();
    } else {
      // 작으면 지연 실행으로 더 모을 기회를 줌
      this.batchTimeoutId = window.setTimeout(() => {
        this.flush();
      }, this.config.batchDelay);
    }
  }

  /**
   * 즉시 플러시
   */
  private flushImmediate(): void {
    if (this.batchTimeoutId) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = null;
    }
    this.flush();
  }

  /**
   * 배치 업데이트 실행
   */
  private flush(): void {
    if (this.pendingUpdates.size === 0) {
      this.updateScheduled = false;
      return;
    }

    const startTime = performance.now();
    const updates = Array.from(this.pendingUpdates.values());
    
    // 우선순위로 정렬 (낮은 숫자가 높은 우선순위)
    updates.sort((a, b) => a.priority - b.priority);

    // 경로별로 업데이트를 그룹화
    const groupedUpdates = this.groupUpdatesByRoot(updates);
    
    // 그룹화된 업데이트 실행
    groupedUpdates.forEach((updateGroup, rootPath) => {
      try {
        this.dispatch({
          type: 'atomic_update',
          payload: updateGroup,
          meta: {
            rootPath,
            updateCount: Object.keys(updateGroup).length,
            timestamp: startTime,
          }
        });
      } catch (error) {
        console.error(`AtomicUpdater: Error updating ${rootPath}:`, error);
      }
    });

    // 통계 업데이트
    this.updateStats.batchedUpdates += updates.length;
    this.updateStats.lastBatchSize = updates.length;

    // 로깅
    if (this.config.enableLogging && updates.length > 1) {
      const duration = performance.now() - startTime;
      console.log(
        `AtomicUpdater: Batched ${updates.length} updates in ${duration.toFixed(2)}ms`
      );
    }

    // 정리
    this.pendingUpdates.clear();
    this.updateScheduled = false;
  }

  /**
   * 특정 경로만 플러시
   */
  private flushSpecificPath(path: string, value: any): void {
    const [root, ...rest] = path.split('.');
    const updateObj = this.buildNestedObject(rest, value);
    
    try {
      this.dispatch({
        type: 'update',
        payload: { [root]: updateObj },
        meta: {
          path,
          immediate: true,
          timestamp: performance.now(),
        }
      });
    } catch (error) {
      console.error(`AtomicUpdater: Error updating path ${path}:`, error);
    }
  }

  /**
   * 업데이트를 루트 경로별로 그룹화
   */
  private groupUpdatesByRoot(updates: UpdateEntry[]): Map<string, any> {
    const groups = new Map<string, any>();

    updates.forEach(({ path, value }) => {
      const [root, ...rest] = path.split('.');
      
      if (!groups.has(root)) {
        groups.set(root, {});
      }
      
      const rootObj = groups.get(root);
      this.setNestedValue(rootObj, rest, value);
    });

    return groups;
  }

  /**
   * 중첩된 객체에 값 설정
   */
  private setNestedValue(obj: any, path: string[], value: any): void {
    if (path.length === 0) {
      return;
    }

    if (path.length === 1) {
      obj[path[0]] = value;
      return;
    }

    const [head, ...tail] = path;
    if (!obj[head]) {
      obj[head] = {};
    }
    
    this.setNestedValue(obj[head], tail, value);
  }

  /**
   * 중첩된 객체 생성
   */
  private buildNestedObject(path: string[], value: any): any {
    if (path.length === 0) {
      return value;
    }

    const [head, ...tail] = path;
    return { [head]: this.buildNestedObject(tail, value) };
  }

  /**
   * 얕은 비교
   */
  private shallowEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
      return obj1 === obj2;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    return keys1.every(key => obj1[key] === obj2[key]);
  }

  /**
   * 설정 업데이트
   */
  updateConfig(config: Partial<AtomicUpdaterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 대기 중인 업데이트 강제 플러시
   */
  flush(): void {
    this.flushImmediate();
  }

  /**
   * 모든 업데이트 취소
   */
  cancel(): void {
    if (this.batchTimeoutId) {
      clearTimeout(this.batchTimeoutId);
      this.batchTimeoutId = null;
    }
    
    this.pendingUpdates.clear();
    this.updateScheduled = false;
  }

  /**
   * 통계 정보 반환
   */
  getStats() {
    return {
      ...this.updateStats,
      pendingUpdatesCount: this.pendingUpdates.size,
      isScheduled: this.updateScheduled,
      config: this.config,
    };
  }

  /**
   * 통계 리셋
   */
  resetStats(): void {
    this.updateStats = {
      totalUpdates: 0,
      batchedUpdates: 0,
      skippedUpdates: 0,
      lastBatchSize: 0,
    };
  }
}

/**
 * React Hook으로 AtomicUpdater 사용
 */
import { useCallback, useEffect, useRef } from 'react';

export function useAtomicUpdater(
  dispatch: UpdateFunction,
  config?: Partial<AtomicUpdaterConfig>
) {
  const updaterRef = useRef<AtomicUpdater | null>(null);

  if (!updaterRef.current) {
    updaterRef.current = new AtomicUpdater(dispatch, config);
  }

  // 컴포넌트 언마운트 시 대기 중인 업데이트 플러시
  useEffect(() => {
    return () => {
      if (updaterRef.current) {
        updaterRef.current.flush();
      }
    };
  }, []);

  const update = useCallback((path: string, value: any, priority?: number) => {
    updaterRef.current?.update(path, value, priority);
  }, []);

  const updateBatch = useCallback((updates: Record<string, any>, priority?: number) => {
    updaterRef.current?.updateBatch(updates, priority);
  }, []);

  const updateImmediate = useCallback((path: string, value: any) => {
    updaterRef.current?.updateImmediate(path, value);
  }, []);

  const flush = useCallback(() => {
    updaterRef.current?.flush();
  }, []);

  const cancel = useCallback(() => {
    updaterRef.current?.cancel();
  }, []);

  const getStats = useCallback(() => {
    return updaterRef.current?.getStats() || null;
  }, []);

  return {
    update,
    updateBatch,
    updateImmediate,
    flush,
    cancel,
    getStats,
  };
} 