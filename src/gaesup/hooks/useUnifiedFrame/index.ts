import { useFrame } from '@react-three/fiber';
import React, { useCallback, useRef, useEffect } from 'react';

type FrameCallback = (state: any, delta: number) => void;

interface FrameSubscription {
  id: string;
  callback: FrameCallback;
  priority: number; // 낮을수록 먼저 실행
}

// 전역 프레임 매니저
class FrameManager {
  private subscriptions: Map<string, FrameSubscription> = new Map();
  private isRunning = false;

  subscribe(id: string, callback: FrameCallback, priority: number = 0) {
    this.subscriptions.set(id, { id, callback, priority });
  }

  unsubscribe(id: string) {
    this.subscriptions.delete(id);
  }

  executeFrame(state: any, delta: number) {
    if (this.isRunning) return; // 중복 실행 방지
    this.isRunning = true;

    try {
      // 우선순위 순으로 정렬하여 실행
      const sortedSubscriptions = Array.from(this.subscriptions.values())
        .sort((a, b) => a.priority - b.priority);

      for (const subscription of sortedSubscriptions) {
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

  getSubscriptionCount() {
    return this.subscriptions.size;
  }
}

const frameManager = new FrameManager();

export function useUnifiedFrame(
  id: string,
  callback: FrameCallback,
  priority: number = 0,
  enabled: boolean = true
) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const stableCallback = useCallback((state: any, delta: number) => {
    if (enabled) {
      callbackRef.current(state, delta);
    }
  }, [enabled]);

  // 구독 관리
  const subscribe = useCallback(() => {
    frameManager.subscribe(id, stableCallback, priority);
  }, [id, stableCallback, priority]);

  const unsubscribe = useCallback(() => {
    frameManager.unsubscribe(id);
  }, [id]);

  // 컴포넌트 마운트/언마운트 시 구독 관리
  useEffect(() => {
    subscribe();
    return unsubscribe;
  }, [subscribe, unsubscribe]);

  return {
    subscriptionCount: frameManager.getSubscriptionCount(),
  };
}

// 메인 프레임 루프 (한 번만 실행되어야 함)
export function useMainFrameLoop() {
  useFrame((state, delta) => {
    frameManager.executeFrame(state, delta);
  });
}

export { frameManager }; 