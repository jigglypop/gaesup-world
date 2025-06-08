import type { PhysicsEventCallback, PhysicsEventData, PhysicsEventType } from '../../../types';
import type { ActiveStateType, GameStatesType } from '../../types';

class EventBus {
  private listeners: Map<PhysicsEventType, Set<PhysicsEventCallback<any>>> = new Map();
  private eventCount = 0;
  private lastEventData: Map<PhysicsEventType, unknown> = new Map();
  private lastEventTime: Map<PhysicsEventType, number> = new Map();
  private maxListenersPerEvent = 50;
  private eventQueue: Map<PhysicsEventType, PhysicsEventData[PhysicsEventType][]> = new Map();
  private isProcessing = false;
  private eventThrottleMap = new Map<PhysicsEventType, number>([
    ['POSITION_UPDATE', 16],
    ['ROTATION_UPDATE', 33],
    ['MOVE_STATE_CHANGE', 50],
    ['JUMP_STATE_CHANGE', 100],
    ['GROUND_STATE_CHANGE', 100],
    ['RIDE_STATE_CHANGE', 200],
    ['MODE_CHANGE', 0],
    ['CAMERA_UPDATE', 33],
    ['CAMERA_BLEND_START', 0],
    ['CAMERA_BLEND_END', 0],
    ['CAMERA_EFFECT', 0],
  ]);

  subscribe<T extends PhysicsEventType>(
    eventType: T,
    callback: PhysicsEventCallback<T>,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    const eventListeners = this.listeners.get(eventType)!;
    if (eventListeners.size >= this.maxListenersPerEvent) {
      const firstListener = eventListeners.values().next().value;
      if (firstListener) {
        eventListeners.delete(firstListener);
      }
    }
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
    const now = performance.now();
    const throttleTime = this.eventThrottleMap.get(eventType) || 0;

    if (throttleTime > 0) {
      const lastEmit = this.lastEventTime.get(eventType) || 0;
      if (now - lastEmit < throttleTime) {
        if (!this.eventQueue.has(eventType)) {
          this.eventQueue.set(eventType, []);
        }
        const queue = this.eventQueue.get(eventType)!;
        queue.length = 0;
        queue.push(data);
        this.scheduleFlush();
        return;
      }
    }

    if (this.isDeepDuplicate(eventType, data)) {
      return;
    }

    this.lastEventTime.set(eventType, now);
    this.lastEventData.set(eventType, data);
    this.eventCount++;

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

  private isDeepDuplicate(eventType: PhysicsEventType, newData: unknown): boolean {
    const lastData = this.lastEventData.get(eventType);
    if (!lastData) return false;

    switch (eventType) {
      case 'POSITION_UPDATE':
        const posData = newData as PhysicsEventData['POSITION_UPDATE'];
        const lastPosData = lastData as PhysicsEventData['POSITION_UPDATE'];
        const posDiff = posData.position?.distanceTo?.(lastPosData.position) || 0;
        const velDiff = posData.velocity?.distanceTo?.(lastPosData.velocity) || 0;
        return posDiff < 0.01 && velDiff < 0.01;

      case 'ROTATION_UPDATE':
        const rotData = newData as PhysicsEventData['ROTATION_UPDATE'];
        const lastRotData = lastData as PhysicsEventData['ROTATION_UPDATE'];
        const eulerDiff = Math.abs((rotData.euler?.y || 0) - (lastRotData.euler?.y || 0));
        const dirDiff = rotData.direction?.distanceTo?.(lastRotData.direction) || 0;
        return eulerDiff < 0.001 && dirDiff < 0.01;

      default:
        return JSON.stringify(newData) === JSON.stringify(lastData);
    }
  }

  private scheduleFlush(): void {
    if (!this.isProcessing && this.eventQueue.size > 0) {
      this.isProcessing = true;
      requestAnimationFrame(() => this.flushQueue());
    }
  }

  private flushQueue(): void {
    const now = performance.now();

    this.eventQueue.forEach((events, type) => {
      if (events.length > 0) {
        const lastEvent = events[events.length - 1];

        if (!this.isDeepDuplicate(type, lastEvent)) {
          this.lastEventTime.set(type, now);
          this.lastEventData.set(type, lastEvent);
          this.eventCount++;

          const listeners = this.listeners.get(type);
          if (listeners) {
            listeners.forEach((callback) => {
              try {
                callback(lastEvent);
              } catch (error) {
                console.error(`Physics event error [${type}]:`, error);
              }
            });
          }
        }
      }
    });

    this.eventQueue.clear();
    this.isProcessing = false;
    this.lastProcessTime = now;
  }

  destroy() {
    this.listeners.clear();
    this.eventQueue.clear();
    this.lastEventData.clear();
    this.lastEventTime.clear();
    this.eventCount = 0;
    this.isProcessing = false;
  }
}

export class EventSync {
  private setActiveState: ((update: Partial<ActiveStateType>) => void) | null = null;
  private setGameStates: ((update: Partial<GameStatesType>) => void) | null = null;
  private setMode: ((mode: unknown) => void) | null = null;

  private activeState: ActiveStateType | null = null;
  private gameStates: GameStatesType | null = null;
  private mode: unknown = null;

  initialize(
    setActiveStateFn: (update: Partial<ActiveStateType>) => void,
    setGameStatesFn: (update: Partial<GameStatesType>) => void,
    setModeFn?: (mode: unknown) => void,
  ) {
    this.setActiveState = setActiveStateFn;
    this.setGameStates = setGameStatesFn;
    this.setMode = setModeFn || null;
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
      if (update.position) {
        this.activeState.position.copy(update.position);
      }
      if (update.velocity) {
        this.activeState.velocity.copy(update.velocity);
      }
      if (update.euler) {
        this.activeState.euler.copy(update.euler);
      }
      if (update.direction) {
        this.activeState.direction.copy(update.direction);
      }
      if (update.dir) {
        this.activeState.dir.copy(update.dir);
      }
    }

    if (this.setActiveState) {
      this.setActiveState(update);
    }
  }

  updateGameStates(update: Partial<GameStatesType>) {
    if (this.gameStates) {
      Object.assign(this.gameStates, update);
    }

    if (this.setGameStates) {
      this.setGameStates(update);
    }
  }

  updateMode(mode: unknown) {
    const oldMode = this.mode as any;
    this.mode = mode;

    const modeData = mode as any;
    if (oldMode?.control !== modeData?.control || oldMode?.type !== modeData?.type) {
      eventBus.emit('MODE_CHANGE', {
        type: modeData?.type,
        control: modeData?.control,
        controller: modeData?.controller,
      });
    }

    if (this.setMode) {
      this.setMode(mode);
    }
  }
}

export const eventBus = new EventBus();
export const physicsSync = new EventSync();

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

eventBus.subscribe('MODE_CHANGE', (data) => {
  // Mode 변경 처리
});

// Bridge 관련 로직 export
export * from './bridges';
