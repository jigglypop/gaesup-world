import * as THREE from 'three';

import { AnimationBridge } from '../../bridge/AnimationBridge';
import { AnimationSystem } from '../AnimationSystem';
import { createDefaultCharacterAnimator } from '../animator/defaultCharacterAnimator';
import type { AnimatorControllerDefinition } from '../animator/types';

function createActions(names: string[]) {
  const root = new THREE.Object3D();
  const mixer = new THREE.AnimationMixer(root);
  const actions: Record<string, THREE.AnimationAction> = {};
  names.forEach((name) => {
    actions[name] = mixer.clipAction(new THREE.AnimationClip(name, 1, []));
  });
  return actions;
}

function register(system: AnimationSystem, actions: Record<string, THREE.AnimationAction>) {
  Object.entries(actions).forEach(([name, action]) => system.registerAction(name, action));
}

describe('AnimationSystem Animator 연동', () => {
  test('첫 lease만 Animator를 갱신하고 해제하면 다음 lease가 소유한다', () => {
    const system = new AnimationSystem('character');
    register(system, createActions(['idle', 'walk', 'run']));
    const first = system.acquireAnimator(createDefaultCharacterAnimator());
    const second = system.acquireAnimator(createDefaultCharacterAnimator('other'));
    const animator = system.getAnimator();
    expect(animator?.controllerId).toBe('gaesup.character');
    expect(system.isAnimatorOwner(first)).toBe(true);
    expect(system.isAnimatorOwner(second)).toBe(false);
    const update = jest.spyOn(animator!, 'update');
    system.updateAnimation(0.1, second);
    expect(update).not.toHaveBeenCalled();
    system.updateAnimation(0.1, first);
    expect(update).toHaveBeenCalledTimes(1);
    system.releaseAnimator(first);
    expect(system.getAnimator()?.controllerId).toBe('other');
    system.releaseAnimator(second);
    expect(system.getAnimator()).toBeNull();
  });

  test('Animator가 액션을 구동하고 해제하면 액션 재생 설정을 복원한다', () => {
    const system = new AnimationSystem('character');
    const actions = createActions(['idle', 'walk', 'run']);
    register(system, actions);
    const lease = system.acquireAnimator(createDefaultCharacterAnimator());
    system.updateAnimation(0.1, lease);
    expect(actions['idle']!.isScheduled()).toBe(true);
    expect(actions['idle']!.getEffectiveTimeScale()).toBe(0);
    expect(system.getCurrentAnimation()).toBe('idle');
    system.releaseAnimator(lease);
    expect(actions['idle']!.isScheduled()).toBe(false);
    expect(actions['idle']!.getEffectiveTimeScale()).toBe(1);
  });

  test('액션이 나중에 등록되면 바인딩을 다시 해석한다', () => {
    const system = new AnimationSystem('character');
    const lease = system.acquireAnimator(createDefaultCharacterAnimator());
    system.updateAnimation(0.1, lease);
    expect(system.getState().isPlaying).toBe(false);
    const actions = createActions(['Idle']);
    register(system, actions);
    system.updateAnimation(0.1, lease);
    expect(actions['Idle']!.isScheduled()).toBe(true);
    expect(system.getState().isPlaying).toBe(true);
  });

  test('play, stop, weight, speed 명령은 Animator로 전달된다', () => {
    const system = new AnimationSystem('character');
    const actions = createActions(['idle', 'walk', 'run', 'dance']);
    register(system, actions);
    const lease = system.acquireAnimator(createDefaultCharacterAnimator());
    const animator = system.getAnimator()!;
    system.playAnimation('dance', 0);
    expect(system.getCurrentAnimation()).toBe('dance');
    system.updateAnimation(0.1, lease);
    expect(actions['dance']!.isScheduled()).toBe(true);
    expect(actions['idle']!.isScheduled()).toBe(false);
    system.stopAnimation();
    expect(animator.isEnabled()).toBe(false);
    expect(actions['dance']!.isScheduled()).toBe(false);
    expect(system.getState().isPlaying).toBe(false);
    system.playAnimation('locomotion', 0);
    expect(animator.isEnabled()).toBe(true);
    system.setTimeScale(2);
    expect(animator.getSpeed()).toBe(2);
    system.setWeight(0.5);
    expect(animator.getLayerWeight(0)).toBe(0.5);
    expect(system.getState().currentWeight).toBe(0.5);
  });

  test('잘못된 컨트롤러는 lease를 남기지 않고 오류를 던진다', () => {
    const system = new AnimationSystem('character');
    const invalid: AnimatorControllerDefinition = { id: 'bad', layers: [] };
    expect(() => system.acquireAnimator(invalid)).toThrow('[AnimationSystem Error]');
    expect(system.getAnimator()).toBeNull();
  });

  test('Animator 이벤트를 엔진 리스너로 전달한다', () => {
    const system = new AnimationSystem('character');
    register(system, createActions(['idle']));
    const controller = createDefaultCharacterAnimator();
    controller.layers[0]!.states[0]!.events = [{ name: 'footstep', time: 0.5 }];
    const lease = system.acquireAnimator(controller);
    const listener = jest.fn();
    const unsubscribe = system.onAnimatorEvent(listener);
    system.updateAnimation(0.6, lease);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ name: 'footstep', state: 'locomotion' }));
    unsubscribe();
    system.updateAnimation(1, lease);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('dispose는 Animator와 lease를 정리한다', () => {
    const system = new AnimationSystem('character');
    const actions = createActions(['idle']);
    register(system, actions);
    const lease = system.acquireAnimator(createDefaultCharacterAnimator());
    system.updateAnimation(0.1, lease);
    system.dispose();
    expect(system.getAnimator()).toBeNull();
  });
});

describe('AnimationBridge Animator API', () => {
  test('lease, 파라미터 명령, 트리거 명령, 스냅샷 상태를 제공한다', () => {
    const bridge = new AnimationBridge();
    const actions = createActions(['idle', 'walk', 'run', 'jump']);
    bridge.registerAnimations('character', actions);
    const lease = bridge.acquireAnimator('character', createDefaultCharacterAnimator());
    expect(lease).not.toBeNull();
    bridge.execute('character', { type: 'setParameter', parameter: 'jumping', value: true });
    bridge.update('character', 0.1, lease!);
    expect(bridge.snapshot('character')?.animatorState).toBe('jump');
    bridge.setAnimatorParameter('character', 'jumping', false);
    bridge.update('character', 0.1, lease!);
    expect(bridge.getAnimator('character')?.getCurrentState()).toBe('locomotion');
    bridge.releaseAnimator('character', lease!);
    expect(bridge.getAnimator('character')).toBeNull();
    bridge.dispose();
  });

  test('잘못된 컨트롤러 연결은 null을 반환한다', () => {
    const bridge = new AnimationBridge();
    expect(bridge.acquireAnimator('character', { id: 'bad', layers: [] })).toBeNull();
    bridge.dispose();
  });
});
