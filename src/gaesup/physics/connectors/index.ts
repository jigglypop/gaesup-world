import type { ActiveStateType, GameStatesType } from '../../types';
import type { PhysicsEventCallback, PhysicsEventData, PhysicsEventType } from '../../../types';

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

export class PhysicsSync {
  private activeState: ActiveStateType | null = null;
  private gameStates: GameStatesType | null = null;
  private mode: unknown = null;

  initialize(
    setActiveStateFn: (update: Partial<ActiveStateType>) => void,
    setGameStatesFn: (update: Partial<GameStatesType>) => void,
  ) {
    // Simplified initialization - just keep reference for future use
  }

  setWorldContext(worldContext: {
    activeState: ActiveStateType;
    states: GameStatesType;
    mode?: unknown;
  }) {
    this.activeState = worldContext?.activeState;
    this.gameStates = worldContext?.states;
    this.mode = worldContext?.mode;
  }

  updateActiveState(update: Partial<ActiveStateType>) {
    if (this.activeState) {
      if (update.position) this.activeState.position.copy(update.position);
      if (update.velocity) this.activeState.velocity.copy(update.velocity);
      if (update.euler) this.activeState.euler.copy(update.euler);
      if (update.direction) this.activeState.direction.copy(update.direction);
      if (update.dir) this.activeState.dir.copy(update.dir);
    }
  }

  updateGameStates(update: Partial<GameStatesType>) {
    if (this.gameStates) {
      Object.assign(this.gameStates, update);
    }
  }

  updateMode(mode: unknown) {
    this.mode = mode;
  }
}

export const eventBus = new SimpleEventBus();
export const physicsSync = new PhysicsSync();

// 원래 로직처럼 이벤트 구독 설정
eventBus.subscribe('POSITION_UPDATE', (data) => {
  physicsSync.updateActiveState({
    position: data.position,
    velocity: data.velocity,
  });
});

eventBus.subscribe('ROTATION_UPDATE', (data) => {
  physicsSync.updateActiveState({
    euler: data.euler,
    direction: data.direction,
    dir: data.dir,
  });
});

eventBus.subscribe('MOVE_STATE_CHANGE', (data) => {
  physicsSync.updateGameStates(data);
});

eventBus.subscribe('JUMP_STATE_CHANGE', (data) => {
  physicsSync.updateGameStates(data);
});

eventBus.subscribe('GROUND_STATE_CHANGE', (data) => {
  physicsSync.updateGameStates(data);
});

eventBus.subscribe('RIDE_STATE_CHANGE', (data) => {
  physicsSync.updateGameStates(data);
});

export { usePhysics } from './physics';
