import { gameStore } from './gameStore';
import * as THREE from 'three';
import { modeStateAtom } from '../atoms/coreStateAtoms';
import { getDefaultStore } from 'jotai';

// 개발 환경에서 카메라 테스트용 전역 함수 추가
if (import.meta.env.DEV) {
  // gameActions가 정의된 후에 설정하기 위해 setTimeout 사용
  setTimeout(() => {
    (window as any).setCameraMode = (mode: string) => {
      console.log('🎮 Testing camera mode:', mode);
      gameActions.setCameraControl(mode as any);
    };

    (window as any).getCameraState = () => {
      return {
        mode: gameStore.ui.mode,
        cameraOption: gameStore.ui.cameraOption,
        physics: gameStore.physics.activeState,
      };
    };
  }, 0);
}

export const gameActions = {
  updatePhysics(data: {
    position?: THREE.Vector3;
    velocity?: THREE.Vector3;
    euler?: THREE.Euler;
    quat?: THREE.Quaternion;
    direction?: THREE.Vector3;
    dir?: THREE.Vector3;
  }) {
    const activeState = gameStore.physics.activeState;
    if (data.position) activeState.position.copy(data.position);
    if (data.velocity) activeState.velocity.copy(data.velocity);
    if (data.euler) activeState.euler.copy(data.euler);
    if (data.quat) activeState.quat.copy(data.quat);
    if (data.direction) activeState.direction.copy(data.direction);
    if (data.dir) activeState.dir.copy(data.dir);
  },

  updateGameStates(updates: Partial<typeof gameStore.gameStates>) {
    Object.assign(gameStore.gameStates, updates);
  },

  setMovementState(isMoving: boolean, isRunning: boolean = false) {
    gameStore.gameStates.isMoving = isMoving;
    gameStore.gameStates.isNotMoving = !isMoving;
    gameStore.gameStates.isRunning = isRunning;
  },

  updateKeyboard(updates: Partial<typeof gameStore.input.keyboard>) {
    Object.assign(gameStore.input.keyboard, updates);
  },

  updatePointer(updates: Partial<typeof gameStore.input.pointer>) {
    Object.assign(gameStore.input.pointer, updates);
  },

  updateBlocks(updates: Partial<typeof gameStore.input.blocks>) {
    Object.assign(gameStore.input.blocks, updates);
  },

  updateClickerOption(updates: Partial<typeof gameStore.input.clickerOption>) {
    Object.assign(gameStore.input.clickerOption, updates);
  },

  changeMode(type: 'character' | 'vehicle' | 'airplane') {
    gameStore.ui.mode.type = type;
  },

  updateMode(updates: Partial<typeof gameStore.ui.mode>) {
    // Valtio store 업데이트
    Object.assign(gameStore.ui.mode, updates);

    // Jotai atom도 동기화 (기존 Context와의 호환성)
    const jotaiStore = getDefaultStore();
    const currentMode = jotaiStore.get(modeStateAtom);
    jotaiStore.set(modeStateAtom, { ...currentMode, ...updates } as any);

    console.log('🔄 Mode updated:', gameStore.ui.mode);
  },

  setCameraControl(
    control:
      | 'firstPerson'
      | 'thirdPerson'
      | 'chase'
      | 'topDown'
      | 'shoulder'
      | 'sideScroll'
      | 'isometric',
  ) {
    console.log('🎮 Setting camera control to:', control);

    // Valtio store 업데이트
    gameStore.ui.mode.control = control;

    // Jotai atom도 동기화 (기존 Context와의 호환성)
    const jotaiStore = getDefaultStore();
    const currentMode = jotaiStore.get(modeStateAtom);
    jotaiStore.set(modeStateAtom, { ...currentMode, control } as any);

    console.log('🔄 Camera control updated to:', control);
  },

  updateRideable(objectkey: string, updates: any) {
    if (!gameStore.resources.rideable[objectkey]) {
      gameStore.resources.rideable[objectkey] = {} as any;
    }
    Object.assign(gameStore.resources.rideable[objectkey], updates);
  },

  updateAnimation(type: 'character' | 'vehicle' | 'airplane', updates: any) {
    Object.assign(gameStore.ui.animation[type], updates);
  },

  updateUrls(updates: Partial<typeof gameStore.resources.urls>) {
    Object.assign(gameStore.resources.urls, updates);
  },

  updateSizes(updates: Record<string, THREE.Vector3>) {
    Object.assign(gameStore.resources.sizes, updates);
  },

  updateCameraState(updates: Partial<typeof gameStore.camera>) {
    Object.assign(gameStore.camera, updates);
  },

  updateCameraOption(updates: Partial<typeof gameStore.ui.cameraOption>) {
    Object.assign(gameStore.ui.cameraOption, updates);
  },

  setRefs(refs: Partial<typeof gameStore.physics.refs>) {
    Object.assign(gameStore.physics.refs, refs);
  },

  reset() {
    gameStore.physics.activeState.position.set(0, 5, 5);
    gameStore.physics.activeState.velocity.set(0, 0, 0);
    gameStore.physics.activeState.euler.set(0, 0, 0);
    gameStore.physics.activeState.quat.identity();
    gameStore.physics.activeState.direction.set(0, 0, 0);
    gameStore.physics.activeState.dir.set(0, 0, 0);

    gameStore.input.keyboard.forward = false;
    gameStore.input.keyboard.backward = false;
    gameStore.input.keyboard.leftward = false;
    gameStore.input.keyboard.rightward = false;
    gameStore.input.keyboard.shift = false;
    gameStore.input.keyboard.space = false;
    gameStore.input.keyboard.keyZ = false;
    gameStore.input.keyboard.keyR = false;
    gameStore.input.keyboard.keyF = false;
    gameStore.input.keyboard.keyE = false;
    gameStore.input.keyboard.escape = false;

    gameStore.input.pointer.isActive = false;
    gameStore.gameStates.isMoving = false;
    gameStore.gameStates.isRunning = false;
    gameStore.gameStates.isJumping = false;
  },
};
