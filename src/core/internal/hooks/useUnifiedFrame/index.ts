import { RootState, useFrame } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { FrameSubscription, FrameCallback } from './types';

class OptimizedFrameManager {
  private subscriptions: Map<string, FrameSubscription> = new Map();
  private sortedSubscriptions: FrameSubscription[] = [];
  private needsSort = false;
  private isRunning = false;
  private readonly maxSubscriptions = 100;
  private executionTimings: Map<string, number> = new Map();
  private readonly maxExecutionTime = 16;

  subscribe(id: string, callback: FrameCallback, priority: number = 0): void {
    if (this.subscriptions.size >= this.maxSubscriptions) {
      console.warn(`Maximum frame subscriptions (${this.maxSubscriptions}) reached`);
      const lowestPriority = Array.from(this.subscriptions.values())
        .sort((a, b) => b.priority - a.priority)
        .pop();
      if (lowestPriority) {
        this.subscriptions.delete(lowestPriority.id);
        this.executionTimings.delete(lowestPriority.id);
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
      this.executionTimings.delete(id);
      this.needsSort = true;
    }
  }

  executeFrame(state: RootState, delta: number): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    const frameStartTime = performance.now();

    try {
      if (this.needsSort) {
        this.sortedSubscriptions = Array.from(this.subscriptions.values()).sort(
          (a, b) => a.priority - b.priority,
        );
        this.needsSort = false;
      }

      for (const subscription of this.sortedSubscriptions) {
        const callbackStartTime = performance.now();
        
        try {
          subscription.callback(state, delta);
          
          const executionTime = performance.now() - callbackStartTime;
          this.executionTimings.set(subscription.id, executionTime);
          
          if (executionTime > this.maxExecutionTime) {
            console.warn(`Frame callback ${subscription.id} took ${executionTime.toFixed(2)}ms`);
          }
        } catch (error) {
          console.error(`Frame callback error for ${subscription.id}:`, error);
        }

        if ((performance.now() - frameStartTime) > this.maxExecutionTime) {
          console.warn('Frame execution time exceeded limit, skipping remaining callbacks');
          break;
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  getAverageExecutionTime(): number {
    const times = Array.from(this.executionTimings.values());
    return times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
  }

  destroy(): void {
    this.subscriptions.clear();
    this.sortedSubscriptions = [];
    this.executionTimings.clear();
    this.needsSort = false;
    this.isRunning = false;
  }

  clear(): void {
    this.subscriptions.clear();
    this.sortedSubscriptions = [];
    this.executionTimings.clear();
    this.needsSort = false;
  }
}

let frameManager: OptimizedFrameManager | null = null;

const getFrameManager = (): OptimizedFrameManager => {
  if (!frameManager) {
    frameManager = new OptimizedFrameManager();
  }
  return frameManager;
};

export function useUnifiedFrame(
  id: string,
  callback: FrameCallback,
  priority: number = 0,
  enabled: boolean = true,
): {
  subscriptionCount: number;
  averageExecutionTime: number;
} {
  const callbackRef = useRef(callback);
  const manager = getFrameManager();
  
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
    manager.subscribe(id, stableCallback, priority);
  }, [id, stableCallback, priority, manager]);

  const unsubscribe = useCallback((): void => {
    manager.unsubscribe(id);
  }, [id, manager]);

  useEffect((): (() => void) => {
    subscribe();
    return unsubscribe;
  }, [subscribe, unsubscribe]);

  useEffect(() => {
    return () => {
      if (manager.getSubscriptionCount() === 0) {
        manager.destroy();
        frameManager = null;
      }
    };
  }, [manager]);

  return {
    subscriptionCount: manager.getSubscriptionCount(),
    averageExecutionTime: manager.getAverageExecutionTime(),
  };
}

export function useMainFrameLoop(): void {
  const manager = getFrameManager();
  
  useFrame((state, delta) => {
    manager.executeFrame(state, delta);
  });
}

export { getFrameManager as frameManager };
