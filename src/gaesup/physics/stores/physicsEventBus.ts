import * as THREE from 'three';

// ============================================================================
// 🎯 Physics Events (리렌더링 추적 제거)
// ============================================================================

// 간단하고 확실한 Physics 이벤트 시스템
export type PhysicsEventType =
  | 'MOVE_STATE_CHANGE'
  | 'JUMP_STATE_CHANGE'
  | 'GROUND_STATE_CHANGE'
  | 'POSITION_UPDATE'
  | 'ROTATION_UPDATE'
  | 'RIDE_STATE_CHANGE';

export interface PhysicsEventData {
  MOVE_STATE_CHANGE: {
    isMoving: boolean;
    isRunning: boolean;
    isNotMoving: boolean;
    isNotRunning: boolean;
  };
  JUMP_STATE_CHANGE: {
    isJumping: boolean;
    isOnTheGround: boolean;
  };
  GROUND_STATE_CHANGE: {
    isOnTheGround: boolean;
    isFalling: boolean;
  };
  POSITION_UPDATE: {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
  };
  ROTATION_UPDATE: {
    euler: THREE.Euler;
    direction: THREE.Vector3;
    dir: THREE.Vector3;
  };
  RIDE_STATE_CHANGE: {
    isRiding: boolean;
    canRide: boolean;
    shouldEnterRideable: boolean;
    shouldExitRideable: boolean;
  };
}

// 즉시 실행 이벤트 버스 (큐 없음, 바로 처리, 리렌더링 추적 제거)
class PhysicsEventBus {
  private listeners: Map<PhysicsEventType, Set<(data: any) => void>> = new Map();
  private eventCount = 0;

  subscribe<T extends PhysicsEventType>(
    eventType: T,
    callback: (data: PhysicsEventData[T]) => void,
  ): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  emit<T extends PhysicsEventType>(eventType: T, data: PhysicsEventData[T]): void {
    this.eventCount++;

    // 🔥 renderMonitor 추적 제거 - 리렌더링 유발 방지
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
    console.log('🧹 PhysicsEventBus cleared');
  }
}

export const physicsEventBus = new PhysicsEventBus();

// worldContext 직접 업데이트 헬퍼 (리렌더링 방지)
export class WorldContextSync {
  private worldContext: any = null;
  private activeState: any = null;
  private gameStates: any = null;

  setWorldContext(worldContext: any) {
    this.worldContext = worldContext;
    this.activeState = worldContext?.activeState;
    this.gameStates = worldContext?.states;

    // 🔥 renderMonitor 추적 제거 - 리렌더링 유발 방지
  }

  // 직접 업데이트 (React 상태 변경 없음)
  updateActiveState(update: Partial<any>) {
    if (!this.activeState) return;

    // 직접 객체 프로퍼티 변경 (리렌더링 유발 안함)
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

  updateGameStates(update: Partial<any>) {
    if (!this.gameStates) return;

    // 직접 프로퍼티 변경 (리렌더링 유발 안함)
    Object.assign(this.gameStates, update);
  }

  getActiveState() {
    return this.activeState;
  }

  getGameStates() {
    return this.gameStates;
  }
}

export const worldContextSync = new WorldContextSync();

// 이벤트 구독 설정
physicsEventBus.subscribe('POSITION_UPDATE', (data) => {
  worldContextSync.updateActiveState({
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
});

physicsEventBus.subscribe('MOVE_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);
});

physicsEventBus.subscribe('JUMP_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);
});

physicsEventBus.subscribe('GROUND_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);
});

physicsEventBus.subscribe('RIDE_STATE_CHANGE', (data) => {
  worldContextSync.updateGameStates(data);
});
