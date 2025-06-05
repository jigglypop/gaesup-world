import type { ActiveStateType, GameStatesType, PhysicsEventData, PhysicsEventType, PhysicsEventCallback } from '../../../types';

class OptimizedPhysicsEventBus {
  private listeners: Map<PhysicsEventType, Set<PhysicsEventCallback<any>>> = new Map();
  private eventCount = 0;
  private lastEventData: Map<PhysicsEventType, unknown> = new Map();
  private lastEventTime: Map<PhysicsEventType, number> = new Map();
  
  // 이벤트 큐와 스로틀링
  private eventQueue: Map<PhysicsEventType, PhysicsEventData[PhysicsEventType][]> = new Map();
  private isProcessing = false;
  private lastProcessTime = 0;
  private eventThrottleMap = new Map<PhysicsEventType, number>([
    ['POSITION_UPDATE', 16], // 60fps
    ['ROTATION_UPDATE', 33], // 30fps
    ['MOVE_STATE_CHANGE', 50], // 20fps
    ['JUMP_STATE_CHANGE', 100], // 10fps
    ['GROUND_STATE_CHANGE', 100], // 10fps
    ['RIDE_STATE_CHANGE', 200], // 5fps
    ['MODE_CHANGE', 0], // 즉시
    ['CAMERA_UPDATE', 33], // 30fps
  ]);

  subscribe<T extends PhysicsEventType>(
    eventType: T,
    callback: PhysicsEventCallback<T>,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback as PhysicsEventCallback<any>);

    return () => {
      this.listeners.get(eventType)?.delete(callback as PhysicsEventCallback<any>);
    };
  }

  emit<T extends PhysicsEventType>(eventType: T, data: PhysicsEventData[T]): void {
    const now = performance.now();
    const throttleTime = this.eventThrottleMap.get(eventType) || 0;
    
    // 스로틀링 적용
    if (throttleTime > 0) {
      const lastEmit = this.lastEventTime.get(eventType) || 0;
      if (now - lastEmit < throttleTime) {
        // 큐에 저장 (마지막 값만 유지)
        if (!this.eventQueue.has(eventType)) {
          this.eventQueue.set(eventType, []);
        }
        const queue = this.eventQueue.get(eventType)!;
        queue.length = 0; // 기존 값 제거
        queue.push(data);
        this.scheduleFlush();
        return;
      }
    }

    // 더 정교한 중복 체크
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

  private isDeepDuplicate(eventType: PhysicsEventType, newData: any): boolean {
    const lastData = this.lastEventData.get(eventType) as any;
    if (!lastData) return false;

    switch (eventType) {
      case 'POSITION_UPDATE':
        // 위치 변화가 0.01 미만이면 무시
        const posDiff = newData.position?.distanceTo?.(lastData.position) || 0;
        const velDiff = newData.velocity?.distanceTo?.(lastData.velocity) || 0;
        return posDiff < 0.01 && velDiff < 0.01;
        
      case 'ROTATION_UPDATE':
        // 회전 변화가 0.001 라디안 미만이면 무시
        const eulerDiff = Math.abs((newData.euler?.y || 0) - (lastData.euler?.y || 0));
        const dirDiff = newData.direction?.distanceTo?.(lastData.direction) || 0;
        return eulerDiff < 0.001 && dirDiff < 0.01;
        
      case 'MOVE_STATE_CHANGE':
        return (
          newData.isMoving === lastData.isMoving && 
          newData.isRunning === lastData.isRunning &&
          newData.isNotMoving === lastData.isNotMoving &&
          newData.isNotRunning === lastData.isNotRunning
        );
        
      case 'JUMP_STATE_CHANGE':
        return (
          newData.isJumping === lastData.isJumping &&
          newData.isOnTheGround === lastData.isOnTheGround
        );
        
      case 'GROUND_STATE_CHANGE':
        return (
          newData.isOnTheGround === lastData.isOnTheGround &&
          newData.isFalling === lastData.isFalling
        );
        
      case 'RIDE_STATE_CHANGE':
        return (
          newData.isRiding === lastData.isRiding &&
          newData.canRide === lastData.canRide &&
          newData.shouldEnterRideable === lastData.shouldEnterRideable &&
          newData.shouldExitRideable === lastData.shouldExitRideable
        );
        
      case 'MODE_CHANGE':
        return (
          newData.type === lastData.type && 
          newData.control === lastData.control &&
          newData.controller === lastData.controller
        );
        
      case 'CAMERA_UPDATE':
        const camPosDiff = newData.position?.distanceTo?.(lastData.position) || 0;
        const camTargetDiff = newData.target?.distanceTo?.(lastData.target) || 0;
        return camPosDiff < 0.01 && camTargetDiff < 0.01;
        
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
    
    // 큐에 있는 이벤트들을 처리
    this.eventQueue.forEach((events, type) => {
      if (events.length > 0) {
        // 마지막 이벤트만 발행 (중간 상태는 무시)
        const lastEvent = events[events.length - 1];
        
        // 중복 체크 후 발행
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

  getStats() {
    return {
      totalEvents: this.eventCount,
      listeners: Array.from(this.listeners.entries()).map(([type, set]) => ({
        type,
        count: set.size,
      })),
      queueSize: this.eventQueue.size,
      isProcessing: this.isProcessing,
      avgProcessTime: this.lastProcessTime,
    };
  }

  clear() {
    this.listeners.clear();
    this.eventCount = 0;
    this.lastEventData.clear();
    this.lastEventTime.clear();
    this.eventQueue.clear();
    this.isProcessing = false;
  }
}

// 기존 PhysicsEventBus를 OptimizedPhysicsEventBus로 교체
export const physicsEventBus = new OptimizedPhysicsEventBus();

// worldContext 직접 업데이트 헬퍼 (리렌더링 방지)
export class WorldContextSync {
  private activeState: ActiveStateType | null = null;
  private gameStates: GameStatesType | null = null;
  private mode: unknown = null;
  private cameraState: unknown = null;

  setWorldContext(worldContext: {
    activeState: ActiveStateType;
    states: GameStatesType;
    mode?: unknown;
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

  updateMode(mode: unknown) {
    const oldMode = this.mode as any;
    this.mode = mode;

    const modeData = mode as any;
    if (oldMode?.control !== modeData?.control || oldMode?.type !== modeData?.type) {
      physicsEventBus.emit('MODE_CHANGE', {
        type: modeData.type,
        control: modeData.control,
        controller: modeData.controller,
      });
    }
  }

  updateCamera(cameraData: unknown) {
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
  private setActiveState: ((update: Partial<ActiveStateType>) => void) | null = null;
  private setGameStates: ((update: Partial<GameStatesType>) => void) | null = null;
  private setMode: ((mode: unknown) => void) | null = null;
  private setCamera: ((cameraData: unknown) => void) | null = null;

  initialize(
    setActiveStateFn: (update: Partial<ActiveStateType>) => void,
    setGameStatesFn: (update: Partial<GameStatesType>) => void,
    setModeFn?: (mode: unknown) => void,
    setCameraFn?: (cameraData: unknown) => void
  ) {
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

  syncMode(mode: unknown) {
    if (this.setMode) {
      this.setMode(mode);
    }
  }

  syncCamera(cameraData: unknown) {
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
