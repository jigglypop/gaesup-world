import { RootState, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { FrameSubscription, FrameCallback } from './types';

class OptimizedFrameManager {
  private subscriptions: Map<string, FrameSubscription> = new Map();
  private sortedSubscriptions: FrameSubscription[] = [];
  private needsSort = false;
  private isRunning = false;
  private maxSubscriptions = 100;
  subscribe(id: string, callback: FrameCallback, priority: number = 0): void {
    if (this.subscriptions.size >= this.maxSubscriptions) {
      console.error(`Maximum frame subscriptions (${this.maxSubscriptions}) exceeded`);
      const lowestPriority = Array.from(this.subscriptions.values())
        .sort((a, b) => b.priority - a.priority)
        .pop();
      if (lowestPriority) {
        this.subscriptions.delete(lowestPriority.id);
      }
    }

    const subscription: FrameSubscription = {
      id,
      callback,
      priority,
    };

    this.subscriptions.set(id, subscription);
    this.needsSort = true;
  }

  unsubscribe(id: string): void {
    if (this.subscriptions.delete(id)) {
      this.needsSort = true;
    }
  }

  executeFrame(state: RootState, delta: number): void {
    if (this.isRunning) return;
    this.isRunning = true;
    try {
      if (this.needsSort) {
        this.sortedSubscriptions = Array.from(this.subscriptions.values()).sort(
          (a, b) => a.priority - b.priority,
        );
        this.needsSort = false;
      }
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
  destroy() {
    this.subscriptions.clear();
    this.sortedSubscriptions = [];
    this.needsSort = false;
    this.isRunning = false;
  }
  clear() {
    this.subscriptions.clear();
    this.sortedSubscriptions = [];
    this.needsSort = false;
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
  };
}

export function useMainFrameLoop(): void {
  useFrame((state, delta) => {
    frameManager.executeFrame(state, delta);
  });
}
export { frameManager };
