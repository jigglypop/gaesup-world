import { ActiveStateType, GameStatesType } from '../../types';
import { PhysicsEventData, PhysicsEventType } from './type';

class PhysicsEventBus {
  private listeners: Map<PhysicsEventType, Set<(data: any) => void>> = new Map();
  private eventCount = 0;
  private lastEventData: Map<PhysicsEventType, any> = new Map();

  subscribe<T extends PhysicsEventType>(
    eventType: T,
    callback: (data: PhysicsEventData[T]) => void,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback as (data: any) => void);

    return () => {
      this.listeners.get(eventType)?.delete(callback as (data: any) => void);
    };
  }

  emit<T extends PhysicsEventType>(eventType: T, data: PhysicsEventData[T]): void {
    const lastData = this.lastEventData.get(eventType);

    if (this.isDuplicateEvent(eventType, data, lastData)) {
      return;
    }

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

  private isDuplicateEvent(eventType: PhysicsEventType, newData: any, lastData: any): boolean {
    if (!lastData) return false;

    switch (eventType) {
      case 'POSITION_UPDATE':
        return (
          newData.position?.equals?.(lastData.position) &&
          newData.velocity?.equals?.(lastData.velocity)
        );
      case 'ROTATION_UPDATE':
        return (
          newData.euler?.equals?.(lastData.euler) && newData.direction?.equals?.(lastData.direction)
        );
      case 'MOVE_STATE_CHANGE':
        return newData.isMoving === lastData.isMoving && newData.isRunning === lastData.isRunning;
      case 'MODE_CHANGE':
        return newData.type === lastData.type && newData.control === lastData.control;
      case 'CAMERA_UPDATE':
        return (
          newData.position?.equals?.(lastData.position) && newData.target?.equals?.(lastData.target)
        );
      default:
        return JSON.stringify(newData) === JSON.stringify(lastData);
    }
  }

  getStats() {
    return {
      totalEvents: this.eventCount,
      listeners: Array.from(this.listeners.entries()).map(([type, set]) => ({
        type,
        count: set.size,
      })),
    };
  }

  clear() {
    this.listeners.clear();
    this.eventCount = 0;
    this.lastEventData.clear();
  }
}

export const physicsEventBus = new PhysicsEventBus();

// worldContext 직접 업데이트 헬퍼 (리렌더링 방지)
export class WorldContextSync {
  private activeState: ActiveStateType | null = null;
  private gameStates: GameStatesType | null = null;
  private mode: any = null;
  private cameraState: any = null;

  setWorldContext(worldContext: {
    activeState: ActiveStateType;
    states: GameStatesType;
    mode?: any;
  }) {
    this.activeState = worldContext?.activeState;
    this.gameStates = worldContext?.states;
    this.mode = worldContext?.mode;
  }

  // 직접 업데이트 (React 상태 변경 없음)
  updateActiveState(update: Partial<ActiveStateType>) {
    if (!this.activeState) return;
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

  updateGameStates(update: Partial<GameStatesType>) {
    if (!this.gameStates) return;
    Object.assign(this.gameStates, update);
  }

  updateMode(mode: any) {
    const oldMode = this.mode;
    this.mode = mode;

    if (oldMode?.control !== mode?.control || oldMode?.type !== mode?.type) {
      physicsEventBus.emit('MODE_CHANGE', {
        type: mode.type,
        control: mode.control,
        controller: mode.controller,
      });
    }
  }

  updateCamera(cameraData: any) {
    this.cameraState = cameraData;
    physicsEventBus.emit('CAMERA_UPDATE', cameraData);
  }

  getActiveState() {
    return this.activeState;
  }

  getGameStates() {
    return this.gameStates;
  }

  getMode() {
    return this.mode;
  }

  getCameraState() {
    return this.cameraState;
  }
}

export const worldContextSync = new WorldContextSync();

// 🔧 jotai atoms와 동기화하는 클래스 추가
export class JotaiPhysicsSync {
  private setActiveState: any = null;
  private setGameStates: any = null;
  private setMode: any = null;
  private setCamera: any = null;

  initialize(setActiveStateFn: any, setGameStatesFn: any, setModeFn?: any, setCameraFn?: any) {
    this.setActiveState = setActiveStateFn;
    this.setGameStates = setGameStatesFn;
    this.setMode = setModeFn;
    this.setCamera = setCameraFn;
  }

  syncActiveState(update: Partial<ActiveStateType>) {
    if (this.setActiveState) {
      this.setActiveState(update);
    }
  }

  syncGameStates(update: Partial<GameStatesType>) {
    if (this.setGameStates) {
      this.setGameStates(update);
    }
  }

  syncMode(mode: any) {
    if (this.setMode) {
      this.setMode(mode);
    }
  }

  syncCamera(cameraData: any) {
    if (this.setCamera) {
      this.setCamera(cameraData);
    }
  }
}

export const jotaiPhysicsSync = new JotaiPhysicsSync();

// 기존 이벤트 구독에 jotai 동기화 추가
physicsEventBus.subscribe('POSITION_UPDATE', (data) => {
  worldContextSync.updateActiveState({
    position: data.position,
    velocity: data.velocity,
  });

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncActiveState({
    position: data.position,
    velocity: data.velocity,
  });
});

physicsEventBus.subscribe('ROTATION_UPDATE', (data) => {
  worldContextSync.updateActiveState({
    euler: data.euler,
    direction: data.direction,
    dir: data.dir,
  });

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncActiveState({
    euler: data.euler,
    direction: data.direction,
    dir: data.dir,
  });
});

physicsEventBus.subscribe('MOVE_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncGameStates(data);
});

physicsEventBus.subscribe('JUMP_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncGameStates(data);
});

physicsEventBus.subscribe('GROUND_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncGameStates(data);
});

physicsEventBus.subscribe('RIDE_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);

  // 🔧 jotai atoms에도 동기화
  jotaiPhysicsSync.syncGameStates(data);
});

physicsEventBus.subscribe('MODE_CHANGE', (data) => {
  jotaiPhysicsSync.syncMode(data);
});

physicsEventBus.subscribe('CAMERA_UPDATE', (data) => {
  jotaiPhysicsSync.syncCamera(data);
});
