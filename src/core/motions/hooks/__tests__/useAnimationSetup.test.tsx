import { StrictMode, type ReactNode } from 'react';

import { renderHook } from '@testing-library/react';
import { AnimationClip, AnimationMixer, Object3D, type AnimationAction } from 'three';

import { AnimationBridge } from '../../../animation/bridge/AnimationBridge';
import { getGlobalAnimationBridge } from '../../../animation/hooks/useAnimationBridge';
import { useAnimationSetup } from '../setup/useAnimationSetup';

jest.mock('../../../animation/hooks/useAnimationBridge', () => ({ getGlobalAnimationBridge: jest.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => <StrictMode>{children}</StrictMode>;

test('StrictMode owner cleanup preserves a newer registration', () => {
  const bridge = new AnimationBridge();
  jest.mocked(getGlobalAnimationBridge).mockReturnValue(bridge);
  const mixer = new AnimationMixer(new Object3D());
  const old = mixer.clipAction(new AnimationClip('old', 1, []));
  const replacement = mixer.clipAction(new AnimationClip('replacement', 1, []));
  const first = renderHook(() => useAnimationSetup({ walk: old }, 'character', true), { wrapper });
  const second = renderHook(() => useAnimationSetup({ walk: replacement }, 'character', true), { wrapper });
  try {
    bridge.execute('character', { type: 'play', animation: 'walk', duration: 0 });
    first.unmount();
    expect(replacement.isRunning()).toBe(true);
    expect(bridge.snapshot('character')?.availableAnimations).toEqual(['walk']);
    second.unmount();
    expect(replacement.isRunning()).toBe(false);
    expect(bridge.snapshot('character')?.availableAnimations).toEqual([]);
  } finally {
    first.unmount();
    second.unmount();
    bridge.dispose();
    mixer.stopAllAction();
  }
});

test('cleanup captures lazy actions before their source becomes unavailable', () => {
  const bridge = new AnimationBridge();
  jest.mocked(getGlobalAnimationBridge).mockReturnValue(bridge);
  const mixer = new AnimationMixer(new Object3D());
  const action = mixer.clipAction(new AnimationClip('walk', 1, []));
  let loaded: AnimationAction | null = action;
  const actions = { get walk() { return loaded; } };
  const hook = renderHook(() => useAnimationSetup(actions, 'character', true), { wrapper });
  try {
    bridge.execute('character', { type: 'play', animation: 'walk', duration: 0 });
    loaded = null;
    hook.unmount();
    expect(action.isRunning()).toBe(false);
    expect(bridge.snapshot('character')?.availableAnimations).toEqual([]);
  } finally {
    hook.unmount();
    bridge.dispose();
    mixer.stopAllAction();
  }
});
