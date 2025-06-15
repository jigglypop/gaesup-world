import type { PhysicsEventCallback, PhysicsEventData, PhysicsEventType } from '../../../types';
import { useGaesupStore } from '@stores/gaesupStore';

// Simplified EventBus for 2-layer architecture
class SimpleEventBus {
  private listeners = new Map<PhysicsEventType, Set<PhysicsEventCallback<any>>>();

  subscribe<T extends PhysicsEventType>(
    eventType: T,
    callback: PhysicsEventCallback<T>,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    const eventListeners = this.listeners.get(eventType)!;
    eventListeners.add(callback as PhysicsEventCallback<any>);

    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback as PhysicsEventCallback<any>);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  emit<T extends PhysicsEventType>(eventType: T, data: PhysicsEventData[T]): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Physics event error [${eventType}]:`, error);
        }
      });
    }
  }
}

export const eventBus = new SimpleEventBus();

// 원래 로직처럼 이벤트 구독 설정
eventBus.subscribe('POSITION_UPDATE', (data) => {
  const { position, velocity } = data;
  useGaesupStore.getState().updateState({
    activeState: {
      ...useGaesupStore.getState().activeState,
      position,
      velocity,
    },
  });
});

eventBus.subscribe('ROTATION_UPDATE', (data) => {
  const { euler, direction, dir } = data;
  useGaesupStore.getState().updateState({
    activeState: {
      ...useGaesupStore.getState().activeState,
      euler,
      direction,
      dir,
    },
  });
});

eventBus.subscribe('MOVE_STATE_CHANGE', (data) => {
  useGaesupStore.getState().setStates(data);
});

eventBus.subscribe('JUMP_STATE_CHANGE', (data) => {
  useGaesupStore.getState().setStates(data);
});

eventBus.subscribe('GROUND_STATE_CHANGE', (data) => {
  useGaesupStore.getState().setStates(data);
});

eventBus.subscribe('RIDE_STATE_CHANGE', (data) => {
  useGaesupStore.getState().setStates(data);
});

export { usePhysics } from './physics';
