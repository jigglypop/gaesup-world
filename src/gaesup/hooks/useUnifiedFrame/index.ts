import { RootState, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';

type FrameCallback = (state: RootState, delta: number) => void;

interface FrameSubscription {
  id: string;
  callback: FrameCallback;
  priority: number; // 낮을수록 먼저 실행
  lastExecutionTime?: number;
  totalExecutionTime?: number;
  executionCount?: number;
}

type PerformanceMode = 'high' | 'balanced' | 'low';

class OptimizedFrameManager {
  private subscriptions: Map<string, FrameSubscription> = new Map();
  private sortedSubscriptions: FrameSubscription[] = [];
  private needsSort = false;
  private isRunning = false;
  
  // 성능 최적화 관련
  private frameCount = 0;
  private performanceMode: PerformanceMode = 'balanced';
  private lastFPSCheck = 0;
  private fpsHistory: number[] = [];
  private lastFrameTime = 0;
  
  // 통계
  private totalFrameTime = 0;
  private slowCallbackThreshold = 5; // 5ms 이상이면 slow로 간주

  subscribe(id: string, callback: FrameCallback, priority: number = 0): void {
    const subscription: FrameSubscription = { 
      id, 
      callback, 
      priority,
      lastExecutionTime: 0,
      totalExecutionTime: 0,
      executionCount: 0,
    };
    
    this.subscriptions.set(id, subscription);
    this.needsSort = true; // 다음 프레임에서 재정렬 필요
  }

  unsubscribe(id: string): void {
    if (this.subscriptions.delete(id)) {
      this.needsSort = true; // 다음 프레임에서 재정렬 필요
    }
  }

  executeFrame(state: RootState, delta: number): void {
    if (this.isRunning) return; // 중복 실행 방지
    this.isRunning = true;
    
    const frameStartTime = performance.now();
    this.frameCount++;

    try {
      // FPS 모니터링 및 성능 모드 자동 조정
      this.updatePerformanceMode(delta, frameStartTime);
      
      // 구독자가 변경되었거나 처음 실행인 경우에만 재정렬
      if (this.needsSort) {
        this.sortedSubscriptions = Array.from(this.subscriptions.values()).sort(
          (a, b) => a.priority - b.priority,
        );
        this.needsSort = false;
      }

      // 캐시된 정렬 배열을 사용하여 실행 (60fps에서 배열 정렬 완전 제거!)
      for (const subscription of this.sortedSubscriptions) {
        // 성능 모드와 우선순위에 따른 스킵 결정
        if (this.shouldSkipExecution(subscription)) {
          continue;
        }
        
        try {
          const callbackStartTime = performance.now();
          subscription.callback(state, delta);
          const executionTime = performance.now() - callbackStartTime;
          
          // 통계 업데이트
          subscription.lastExecutionTime = executionTime;
          subscription.totalExecutionTime = (subscription.totalExecutionTime || 0) + executionTime;
          subscription.executionCount = (subscription.executionCount || 0) + 1;
          
          // 느린 콜백 경고 (개발 환경에서만)
          if (executionTime > this.slowCallbackThreshold) {
            if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
              console.warn(`Slow frame callback: ${subscription.id} took ${executionTime.toFixed(2)}ms`);
            }
          }
        } catch (error) {
          console.error(`Frame callback error for ${subscription.id}:`, error);
        }
      }
    } finally {
      this.isRunning = false;
      this.totalFrameTime = performance.now() - frameStartTime;
    }
  }

  private shouldSkipExecution(subscription: FrameSubscription): boolean {
    // 최고 우선순위(0-1)는 항상 실행
    if (subscription.priority <= 1) return false;
    
    switch (this.performanceMode) {
      case 'low':
        // 낮은 성능 모드: 중간 우선순위 이상만 제한적 실행
        if (subscription.priority > 2) {
          // 3프레임에 1번만 실행
          return this.frameCount % 3 !== 0;
        }
        if (subscription.priority > 4) {
          // 5프레임에 1번만 실행  
          return this.frameCount % 5 !== 0;
        }
        break;
        
      case 'balanced':
        // 균형 모드: 낮은 우선순위는 2프레임에 1번
        if (subscription.priority > 3) {
          return this.frameCount % 2 !== 0;
        }
        if (subscription.priority > 5) {
          return this.frameCount % 3 !== 0;
        }
        break;
        
      case 'high':
        // 높은 성능 모드: 매우 낮은 우선순위만 제한
        if (subscription.priority > 6) {
          return this.frameCount % 2 !== 0;
        }
        break;
    }
    
    return false;
  }

  private updatePerformanceMode(delta: number, now: number): void {
    // 1초마다 FPS 체크
    if (now - this.lastFPSCheck > 1000) {
      const currentFPS = 1000 / delta;
      this.fpsHistory.push(currentFPS);
      
      // 최근 5개 프레임의 평균으로 성능 모드 결정
      if (this.fpsHistory.length > 5) {
        this.fpsHistory.shift();
      }
      
      const avgFPS = this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      
      // 성능 모드 조정 (히스테리시스 적용하여 진동 방지)
      const currentMode = this.performanceMode;
      
      if (avgFPS < 25 && currentMode !== 'low') {
        this.performanceMode = 'low';
        if (typeof window !== 'undefined' && window.location?.hostname === 'localhost') {
          console.log(`Performance mode changed to: ${this.performanceMode} (${avgFPS.toFixed(1)} FPS)`);
        }
      } else if (avgFPS >= 30 && avgFPS < 45 && currentMode !== 'balanced') {
        this.performanceMode = 'balanced';
      } else if (avgFPS >= 50 && currentMode !== 'high') {
        this.performanceMode = 'high';
      }
      
      this.lastFPSCheck = now;
    }
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getPerformanceStats() {
    const subscriptionStats = Array.from(this.subscriptions.values()).map(sub => ({
      id: sub.id,
      priority: sub.priority,
      avgExecutionTime: sub.executionCount ? 
        ((sub.totalExecutionTime || 0) / sub.executionCount).toFixed(2) : '0',
      lastExecutionTime: (sub.lastExecutionTime || 0).toFixed(2),
      executionCount: sub.executionCount || 0,
    }));

    const avgFPS = this.fpsHistory.length > 0 ? 
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 60;

    return {
      mode: this.performanceMode,
      avgFPS: parseFloat(avgFPS.toFixed(1)),
      subscriptionCount: this.subscriptions.size,
      frameCount: this.frameCount,
      totalFrameTime: this.totalFrameTime.toFixed(2),
      subscriptions: subscriptionStats,
    };
  }

  getStats(): {
    totalSubscriptions: number;
    needsSort: boolean;
    isRunning: boolean;
    sortedLength: number;
    performanceMode: PerformanceMode;
    avgFPS: number;
  } {
    const avgFPS = this.fpsHistory.length > 0 ? 
      this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length : 60;

    return {
      totalSubscriptions: this.subscriptions.size,
      needsSort: this.needsSort,
      isRunning: this.isRunning,
      sortedLength: this.sortedSubscriptions.length,
      performanceMode: this.performanceMode,
      avgFPS: parseFloat(avgFPS.toFixed(1)),
    };
  }

  // 개발 도구용 메서드들
  setPerformanceMode(mode: PerformanceMode): void {
    this.performanceMode = mode;
  }

  resetStats(): void {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.subscriptions.forEach(sub => {
      sub.totalExecutionTime = 0;
      sub.executionCount = 0;
      sub.lastExecutionTime = 0;
    });
  }
}

const frameManager = new OptimizedFrameManager();

export function useUnifiedFrame(
  id: string,
  callback: FrameCallback,
  priority: number = 0,
  enabled: boolean = true,
): { 
  subscriptionCount: number;
  performanceStats: ReturnType<typeof frameManager.getPerformanceStats>;
} {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableCallback = useCallback(
    (state: RootState, delta: number): void => {
      if (enabled) {
        callbackRef.current(state, delta);
      }
    },
    [enabled],
  );

  const subscribe = useCallback((): void => {
    frameManager.subscribe(id, stableCallback, priority);
  }, [id, stableCallback, priority]);

  const unsubscribe = useCallback((): void => {
    frameManager.unsubscribe(id);
  }, [id]);

  useEffect((): (() => void) => {
    subscribe();
    return unsubscribe;
  }, [subscribe, unsubscribe]);

  return {
    subscriptionCount: frameManager.getSubscriptionCount(),
    performanceStats: frameManager.getPerformanceStats(),
  };
}

export function useMainFrameLoop(): void {
  useFrame((state, delta) => {
    frameManager.executeFrame(state, delta);
  });
}

// 개발 도구용 export
export { frameManager };
