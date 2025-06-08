import type { PhysicsEventCallback, PhysicsEventData, PhysicsEventType } from '../../../types';

class EventBus {
  private listeners: Map<PhysicsEventType, Set<PhysicsEventCallback<any>>> = new Map();
  private eventCount = 0;
  private lastEventData: Map<PhysicsEventType, unknown> = new Map();
  private lastEventTime: Map<PhysicsEventType, number> = new Map();
  private maxListenersPerEvent = 50;
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
    ['CAMERA_BLEND_START', 0], // 즉시
    ['CAMERA_BLEND_END', 0], // 즉시
    ['CAMERA_EFFECT', 0], // 즉시
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

      case 'MOVE_STATE_CHANGE':
        const moveData = newData as PhysicsEventData['MOVE_STATE_CHANGE'];
        const lastMoveData = lastData as PhysicsEventData['MOVE_STATE_CHANGE'];
        return (
          moveData.isMoving === lastMoveData.isMoving &&
          moveData.isRunning === lastMoveData.isRunning &&
          moveData.isNotMoving === lastMoveData.isNotMoving &&
          moveData.isNotRunning === lastMoveData.isNotRunning
        );

      case 'JUMP_STATE_CHANGE':
        const jumpData = newData as PhysicsEventData['JUMP_STATE_CHANGE'];
        const lastJumpData = lastData as PhysicsEventData['JUMP_STATE_CHANGE'];
        return (
          jumpData.isJumping === lastJumpData.isJumping &&
          jumpData.isOnTheGround === lastJumpData.isOnTheGround
        );

      case 'GROUND_STATE_CHANGE':
        const groundData = newData as PhysicsEventData['GROUND_STATE_CHANGE'];
        const lastGroundData = lastData as PhysicsEventData['GROUND_STATE_CHANGE'];
        return (
          groundData.isOnTheGround === lastGroundData.isOnTheGround &&
          groundData.isFalling === lastGroundData.isFalling
        );

      case 'RIDE_STATE_CHANGE':
        const rideData = newData as PhysicsEventData['RIDE_STATE_CHANGE'];
        const lastRideData = lastData as PhysicsEventData['RIDE_STATE_CHANGE'];
        return (
          rideData.isRiding === lastRideData.isRiding &&
          rideData.canRide === lastRideData.canRide &&
          rideData.shouldEnterRideable === lastRideData.shouldEnterRideable &&
          rideData.shouldExitRideable === lastRideData.shouldExitRideable
        );

      case 'MODE_CHANGE':
        const modeData = newData as PhysicsEventData['MODE_CHANGE'];
        const lastModeData = lastData as PhysicsEventData['MODE_CHANGE'];
        return (
          modeData.type === lastModeData.type &&
          modeData.control === lastModeData.control &&
          modeData.controller === lastModeData.controller
        );

      case 'CAMERA_UPDATE':
        const camData = newData as PhysicsEventData['CAMERA_UPDATE'];
        const lastCamData = lastData as PhysicsEventData['CAMERA_UPDATE'];
        const camPosDiff = camData.position?.distanceTo?.(lastCamData.position) || 0;
        const camTargetDiff = camData.target?.distanceTo?.(lastCamData.target) || 0;
        const fovDiff = Math.abs((camData.fov || 75) - (lastCamData.fov || 75));
        return camPosDiff < 0.01 && camTargetDiff < 0.01 && fovDiff < 0.1;

      case 'CAMERA_BLEND_START':
      case 'CAMERA_BLEND_END':
      case 'CAMERA_EFFECT':
        return false;

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

  destroy() {
    this.listeners.clear();
    this.eventQueue.clear();
    this.lastEventData.clear();
    this.lastEventTime.clear();
    this.eventCount = 0;
    this.isProcessing = false;
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

export const eventBus = new EventBus();

export class EventSync {
  private setActiveState: ((update: Partial<ActiveStateType>) => void) | null = null;
  private setGameStates: ((update: Partial<GameStatesType>) => void) | null = null;
  private setMode: ((mode: unknown) => void) | null = null;
  private setCamera: ((cameraData: unknown) => void) | null = null;

  private activeState: ActiveStateType | null = null;
  private gameStates: GameStatesType | null = null;
  private mode: unknown = null;
  private cameraState: unknown = null;

  initialize(
    setActiveStateFn: (update: Partial<ActiveStateType>) => void,
    setGameStatesFn: (update: Partial<GameStatesType>) => void,
    setModeFn?: (mode: unknown) => void | null,
    setCameraFn?: (cameraData: unknown) => void | null,
  ) {
    this.setActiveState = setActiveStateFn;
    this.setGameStates = setGameStatesFn;
    this.setMode = setModeFn || null;
    this.setCamera = setCameraFn || null;
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

  updateCamera(cameraData: PhysicsEventData['CAMERA_UPDATE']) {
    this.cameraState = cameraData;
    eventBus.emit('CAMERA_UPDATE', cameraData);

    if (this.setCamera) {
      this.setCamera(cameraData);
    }
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

  syncMode(data: unknown) {
    if (this.setMode) {
      this.setMode(data);
    }
  }

  syncCamera(data: unknown) {
    if (this.setCamera) {
      this.setCamera(data);
    }
  }
}

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
  physicsSync.syncMode(data);
});

eventBus.subscribe('CAMERA_UPDATE', (data) => {
  physicsSync.syncCamera(data);
});
