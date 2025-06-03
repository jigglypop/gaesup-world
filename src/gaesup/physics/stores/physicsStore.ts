import { atom } from 'jotai';
import * as THREE from 'three';

// ============================================================================
// 🎯 Physics Raw Data (useFrame 전용, 리렌더링 없음)
// ============================================================================

// useFrame에서만 사용하는 물리 계산 데이터 (ref 기반)
export const physicsRawDataAtom = atom({
  position: new THREE.Vector3(),
  velocity: new THREE.Vector3(),
  euler: new THREE.Euler(),
  direction: new THREE.Vector3(),
  dir: new THREE.Vector3(),
  lastUpdate: 0,
});

// 게임 상태 (useFrame에서 변경, 주기적으로 UI에 반영)
export const gameStatesRawAtom = atom({
  isMoving: false,
  isRunning: false,
  isJumping: false,
  isFalling: false,
  isOnTheGround: false,
  isNotMoving: true,
  isNotRunning: true,
  isRotated: false,
  isRiding: false,
  canRide: false,
  shouldEnterRideable: false,
  shouldExitRideable: false,
  isRiderOn: false,
  isLanding: false,
  lastUpdate: 0,
});

// ============================================================================
// 🔄 Physics State Sync (배치 업데이트)
// ============================================================================

// UI용 상태 (주기적으로 동기화, 60fps가 아닌 30fps나 그 이하)
export const syncedActiveStateAtom = atom(
  (get) => get(physicsRawDataAtom),
  (get, set, update: Partial<typeof physicsRawDataAtom>) => {
    const current = get(physicsRawDataAtom);
    set(physicsRawDataAtom, { ...current, ...update, lastUpdate: performance.now() });
  }
);

export const syncedGameStatesAtom = atom(
  (get) => get(gameStatesRawAtom),
  (get, set, update: Partial<typeof gameStatesRawAtom>) => {
    const current = get(gameStatesRawAtom);
    set(gameStatesRawAtom, { ...current, ...update, lastUpdate: performance.now() });
  }
);

// ============================================================================
// 📊 Physics Events (이벤트 기반 상태 변경)
// ============================================================================

export type PhysicsEvent = 
  | { type: 'PLAYER_MOVE'; moving: boolean; running: boolean }
  | { type: 'PLAYER_JUMP'; jumping: boolean; onGround: boolean }
  | { type: 'PLAYER_GROUND'; onGround: boolean; falling: boolean }
  | { type: 'PLAYER_POSITION'; position: THREE.Vector3; velocity: THREE.Vector3 }
  | { type: 'PLAYER_ROTATION'; euler: THREE.Euler; direction: THREE.Vector3 }
  | { type: 'PLAYER_RIDE'; riding: boolean; canRide: boolean };

// 이벤트 큐 (배치 처리용)
export const physicsEventQueueAtom = atom<PhysicsEvent[]>([]);

// 이벤트 디스패처 (useFrame에서 호출)
export const dispatchPhysicsEventAtom = atom(
  null,
  (get, set, event: PhysicsEvent) => {
    const queue = get(physicsEventQueueAtom);
    set(physicsEventQueueAtom, [...queue, event]);
  }
);

// 배치 이벤트 처리기 (useFrame 밖에서 호출)
export const processPhysicsEventsAtom = atom(
  null,
  (get, set) => {
    const events = get(physicsEventQueueAtom);
    if (events.length === 0) return;

    // 이벤트 배치 처리
    const currentActive = get(physicsRawDataAtom);
    const currentStates = get(gameStatesRawAtom);
    
    let newActive = { ...currentActive };
    let newStates = { ...currentStates };
    
    events.forEach(event => {
      switch (event.type) {
        case 'PLAYER_MOVE':
          newStates.isMoving = event.moving;
          newStates.isRunning = event.running;
          newStates.isNotMoving = !event.moving;
          newStates.isNotRunning = !event.running;
          break;
          
        case 'PLAYER_JUMP':
          newStates.isJumping = event.jumping;
          newStates.isOnTheGround = event.onGround;
          break;
          
        case 'PLAYER_GROUND':
          newStates.isOnTheGround = event.onGround;
          newStates.isFalling = event.falling;
          break;
          
        case 'PLAYER_POSITION':
          newActive.position.copy(event.position);
          newActive.velocity.copy(event.velocity);
          break;
          
        case 'PLAYER_ROTATION':
          newActive.euler.copy(event.euler);
          newActive.direction.copy(event.direction);
          break;
          
        case 'PLAYER_RIDE':
          newStates.isRiding = event.riding;
          newStates.canRide = event.canRide;
          break;
      }
    });
    
    // 한 번에 상태 업데이트
    set(physicsRawDataAtom, { ...newActive, lastUpdate: performance.now() });
    set(gameStatesRawAtom, { ...newStates, lastUpdate: performance.now() });
    
    // 이벤트 큐 클리어
    set(physicsEventQueueAtom, []);
  }
);

// ============================================================================
// 🎮 Physics Performance Monitor
// ============================================================================

export const physicsPerformanceAtom = atom({
  frameCount: 0,
  eventCount: 0,
  lastSync: 0,
  avgFrameTime: 0,
  syncInterval: 16.67, // ~60fps
});

// 성능 통계 업데이트
export const updatePerformanceAtom = atom(
  null,
  (get, set, frameTime: number) => {
    const perf = get(physicsPerformanceAtom);
    const newFrameCount = perf.frameCount + 1;
    const newAvgFrameTime = (perf.avgFrameTime * perf.frameCount + frameTime) / newFrameCount;
    
    set(physicsPerformanceAtom, {
      ...perf,
      frameCount: newFrameCount,
      avgFrameTime: newAvgFrameTime,
    });
  }
);

// ============================================================================
// 🔗 Legacy Bridge (기존 코드와 호환성)
// ============================================================================

// 기존 worldContext와 연결하는 브리지
export const legacyBridgeAtom = atom(
  null,
  (get, set, legacyData: { activeState: any; states: any }) => {
    // 레거시 데이터를 새 시스템으로 마이그레이션
    const { activeState, states } = legacyData;
    
    set(physicsRawDataAtom, {
      position: activeState.position,
      velocity: activeState.velocity,
      euler: activeState.euler,
      direction: activeState.direction,
      dir: activeState.dir,
      lastUpdate: performance.now(),
    });
    
    set(gameStatesRawAtom, {
      ...states,
      lastUpdate: performance.now(),
    });
  }
); 