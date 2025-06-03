import { RootState, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';

type FrameCallback = (state: RootState, delta: number) => void;
interface FrameSubscription {
  id: string;
  callback: FrameCallback;
  priority: number; // 낮을수록 먼저 실행
}

class FrameManager {
  private subscriptions: Map<string, FrameSubscription> = new Map();
  private sortedSubscriptions: FrameSubscription[] = [];
  private needsSort = false;
  private isRunning = false;

  subscribe(id: string, callback: FrameCallback, priority: number = 0): void {
    const subscription = { id, callback, priority };
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

    try {
      // 구독자가 변경되었거나 처음 실행인 경우에만 재정렬
      if (this.needsSort) {
        this.sortedSubscriptions = Array.from(this.subscriptions.values()).sort(
          (a, b) => a.priority - b.priority,
        );
        this.needsSort = false;
      }

      // 캐시된 정렬 배열을 사용하여 실행 (60fps에서 배열 정렬 완전 제거!)
      for (const subscription of this.sortedSubscriptions) {
        try {
          subscription.callback(state, delta);
        } catch (error) {
          console.error(`Frame callback error for ${subscription.id}:`, error);
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getStats(): {
    totalSubscriptions: number;
    needsSort: boolean;
    isRunning: boolean;
    sortedLength: number;
  } {
    return {
      totalSubscriptions: this.subscriptions.size,
      needsSort: this.needsSort,
      isRunning: this.isRunning,
      sortedLength: this.sortedSubscriptions.length,
    };
  }
}

const frameManager = new FrameManager();

export function useUnifiedFrame(
  id: string,
  callback: FrameCallback,
  priority: number = 0,
  enabled: boolean = true,
): { subscriptionCount: number } {
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
  };
}

export function useMainFrameLoop(): void {
  useFrame((state, delta) => {
    frameManager.executeFrame(state, delta);
  });
}

export { frameManager };
