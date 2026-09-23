import { renderHook } from '@testing-library/react';
import * as THREE from 'three';

import { createDefaultCharacterAnimator } from '../../core/animator/defaultCharacterAnimator';
import { getGlobalAnimationBridge } from '../useAnimationBridge';
import { useAnimatorEvent } from '../useAnimatorEvent';

describe('useAnimatorEvent', () => {
  const bridge = getGlobalAnimationBridge();

  afterEach(() => {
    bridge.unregisterAnimations('character');
  });

  test('지정한 이름의 Animator 이벤트만 받고 언마운트하면 구독을 해제한다', () => {
    const mixer = new THREE.AnimationMixer(new THREE.Object3D());
    bridge.registerAnimations('character', {
      idle: mixer.clipAction(new THREE.AnimationClip('idle', 1, [])),
    });
    const controller = createDefaultCharacterAnimator('event.test');
    controller.layers[0]!.states[0]!.events = [
      { name: 'footstep', time: 0.25 },
      { name: 'breath', time: 0.5 },
    ];
    const lease = bridge.acquireAnimator('character', controller)!;
    const listener = jest.fn();
    const view = renderHook(() => useAnimatorEvent(listener, 'character', 'footstep'));
    bridge.tickAnimator('character', 0.6, lease);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'footstep', controllerId: 'event.test' }));
    view.unmount();
    bridge.tickAnimator('character', 1, lease);
    expect(listener).toHaveBeenCalledTimes(1);
    bridge.releaseAnimator('character', lease);
  });
});
