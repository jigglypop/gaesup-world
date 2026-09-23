import { StrictMode } from 'react';

import { useFrame } from '@react-three/fiber';
import { renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { getGlobalAnimationBridge } from '../../../animation/hooks/useAnimationBridge';
import { CHARACTER_ANIMATOR_FRAME_PRIORITY, useCharacterAnimator } from '../useCharacterAnimator';
import { getGlobalStateManager } from '../useStateSystem';

jest.mock('@react-three/fiber', () => ({ useFrame: jest.fn() }));

type FrameCallback = (state: object, delta: number) => void;

const mockUseFrame = jest.mocked(useFrame);

function registerCharacterClips(names: string[]) {
  const root = new THREE.Object3D();
  const mixer = new THREE.AnimationMixer(root);
  const actions: Record<string, THREE.AnimationAction> = {};
  names.forEach((name) => {
    actions[name] = mixer.clipAction(new THREE.AnimationClip(name, 1, []));
  });
  getGlobalAnimationBridge().registerAnimations('character', actions);
  return actions;
}

function runFrames(frames: number, delta: number) {
  const callbacks = mockUseFrame.mock.calls.map((call) => call[0] as FrameCallback);
  for (let i = 0; i < frames; i++) {
    callbacks.forEach((callback) => callback({}, delta));
  }
}

describe('useCharacterAnimator', () => {
  const bridge = getGlobalAnimationBridge();

  beforeEach(() => {
    mockUseFrame.mockClear();
    getGlobalStateManager().resetGameStates();
    bridge.unregisterAnimations('character');
  });

  afterEach(() => {
    bridge.unregisterAnimations('character');
    getGlobalStateManager().resetGameStates();
  });

  test('활성화되면 기본 Animator를 연결하고 해제되면 반납한다', () => {
    registerCharacterClips(['idle', 'walk', 'run']);
    const view = renderHook(({ enabled }) => useCharacterAnimator({ enabled }), {
      initialProps: { enabled: true },
    });
    expect(bridge.getAnimator('character')?.controllerId).toBe('gaesup.character');
    expect(mockUseFrame).toHaveBeenCalledWith(expect.any(Function), CHARACTER_ANIMATOR_FRAME_PRIORITY);
    view.rerender({ enabled: false });
    expect(bridge.getAnimator('character')).toBeNull();
    view.unmount();
  });

  test('StrictMode 재실행 후에도 Animator를 하나만 남긴다', () => {
    registerCharacterClips(['idle']);
    const view = renderHook(() => useCharacterAnimator({ enabled: true }), { wrapper: StrictMode });
    expect(bridge.getAnimator('character')).not.toBeNull();
    view.unmount();
    expect(bridge.getAnimator('character')).toBeNull();
  });

  test('걷기 입력은 walk, 달리기 입력은 run 클립으로 부드럽게 수렴한다', () => {
    registerCharacterClips(['idle', 'walk', 'run']);
    const view = renderHook(() => useCharacterAnimator({ enabled: true }));
    const stateManager = getGlobalStateManager();
    stateManager.updateGameStates({ isMoving: true, isNotMoving: false });
    runFrames(60, 1 / 60);
    expect(bridge.snapshot('character')?.currentAnimation).toBe('walk');
    stateManager.updateGameStates({ isRunning: true, isNotRunning: false });
    runFrames(60, 1 / 60);
    expect(bridge.snapshot('character')?.currentAnimation).toBe('run');
    view.unmount();
  });

  test('자동화 큐가 없는 클릭 달리기도 run으로 재생한다', () => {
    registerCharacterClips(['idle', 'walk', 'run']);
    const view = renderHook(() => useCharacterAnimator({ enabled: true }));
    getGlobalStateManager().updateGameStates({
      isMoving: true,
      isNotMoving: false,
      isRunning: true,
      isNotRunning: false,
    });
    runFrames(60, 1 / 60);
    expect(bridge.snapshot('character')?.currentAnimation).toBe('run');
    view.unmount();
  });

  test('라이딩, 점프, 낙하 상태를 우선순위대로 반영한다', () => {
    registerCharacterClips(['idle', 'walk', 'run', 'jump', 'fall', 'ride']);
    const view = renderHook(() => useCharacterAnimator({ enabled: true }));
    const stateManager = getGlobalStateManager();
    stateManager.updateGameStates({ isJumping: true, isFalling: true });
    runFrames(1, 1 / 60);
    expect(bridge.snapshot('character')?.animatorState).toBe('jump');
    stateManager.updateGameStates({ isRiding: true });
    runFrames(1, 1 / 60);
    expect(bridge.snapshot('character')?.animatorState).toBe('ride');
    stateManager.updateGameStates({ isRiding: false, isJumping: false, isFalling: false });
    runFrames(1, 1 / 60);
    expect(bridge.snapshot('character')?.animatorState).toBe('locomotion');
    view.unmount();
  });

  test('구동기가 둘이어도 한 프레임에 한 번만 시간이 진행된다', () => {
    const actions = registerCharacterClips(['idle']);
    const first = renderHook(() => useCharacterAnimator({ enabled: true }));
    const second = renderHook(() => useCharacterAnimator({ enabled: true }));
    runFrames(1, 0.25);
    expect(actions['idle']!.time).toBeCloseTo(0.25);
    first.unmount();
    second.unmount();
  });

  test('선언되지 않은 파라미터는 건너뛰는 사용자 컨트롤러도 구동한다', () => {
    const actions = registerCharacterClips(['pose']);
    const controller = {
      id: 'custom.pose',
      layers: [
        {
          name: 'base',
          defaultState: 'pose',
          states: [{ name: 'pose', motion: { kind: 'clip' as const, clip: 'pose' } }],
        },
      ],
    };
    const view = renderHook(() => useCharacterAnimator({ enabled: true, controller }));
    runFrames(1, 0.5);
    expect(actions['pose']!.time).toBeCloseTo(0.5);
    view.unmount();
  });
});
