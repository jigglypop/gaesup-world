import * as THREE from 'three';

import { ThreeAnimatorBinding } from '../ThreeAnimatorBinding';
import type { AnimatorLayerDefinition } from '../types';

function createRig() {
  const root = new THREE.Object3D();
  root.name = 'Root';
  const hips = new THREE.Object3D();
  hips.name = 'Hips';
  const spine = new THREE.Object3D();
  spine.name = 'Spine';
  const arm = new THREE.Object3D();
  arm.name = 'Arm';
  root.add(hips);
  hips.add(spine);
  spine.add(arm);
  const mixer = new THREE.AnimationMixer(root);
  const makeClip = (name: string, value: number) =>
    new THREE.AnimationClip(name, 1, [
      new THREE.NumberKeyframeTrack('Hips.position[x]', [0, 1], [0, value]),
      new THREE.NumberKeyframeTrack('Arm.position[y]', [0, 1], [0, value]),
    ]);
  const actions = new Map<string, THREE.AnimationAction>([
    ['idle', mixer.clipAction(makeClip('idle', 2))],
    ['wave', mixer.clipAction(makeClip('wave', 4))],
  ]);
  return { root, hips, spine, arm, mixer, actions };
}

const baseLayer: AnimatorLayerDefinition = {
  name: 'base',
  defaultState: 'idle',
  states: [{ name: 'idle', motion: { kind: 'clip', clip: 'idle' } }],
};

describe('ThreeAnimatorBinding', () => {
  test('기록한 시간과 가중치를 액션에 반영하고 시간 진행은 Animator가 소유한다', () => {
    const { mixer, actions, hips } = createRig();
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer]);
    const idle = actions.get('idle')!;
    binding.beginFrame();
    binding.writeClip(0, 'idle', 0.5, 1, 1);
    binding.endFrame();
    expect(idle.isScheduled()).toBe(true);
    expect(idle.getEffectiveTimeScale()).toBe(0);
    expect(idle.getEffectiveWeight()).toBe(1);
    mixer.update(0.25);
    expect(idle.time).toBeCloseTo(0.5);
    expect(hips.position.x).toBeCloseTo(1);
  });

  test('같은 프레임의 같은 클립 기록은 가중치를 합치고 더 큰 기여의 시간을 쓴다', () => {
    const { actions } = createRig();
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer]);
    binding.beginFrame();
    binding.writeClip(0, 'idle', 0.2, 0.3, 1);
    binding.writeClip(0, 'idle', 0.8, 0.6, 1);
    binding.endFrame();
    const idle = actions.get('idle')!;
    expect(idle.getEffectiveWeight()).toBeCloseTo(0.9);
    expect(idle.time).toBeCloseTo(0.8);
  });

  test('이번 프레임에 기록되지 않은 활성 액션은 멈춘다', () => {
    const { actions } = createRig();
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer]);
    binding.beginFrame();
    binding.writeClip(0, 'idle', 0, 1, 1);
    binding.writeClip(0, 'wave', 0, 1, 1);
    binding.endFrame();
    binding.beginFrame();
    binding.writeClip(0, 'idle', 0.1, 1, 1);
    binding.endFrame();
    expect(actions.get('wave')!.isScheduled()).toBe(false);
    expect(actions.get('idle')!.isScheduled()).toBe(true);
  });

  test('없는 클립은 hasClip이 false이고 길이는 0이다', () => {
    const { actions } = createRig();
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer]);
    expect(binding.hasClip(0, 'idle')).toBe(true);
    expect(binding.getClipDuration(0, 'idle')).toBe(1);
    expect(binding.hasClip(0, 'missing')).toBe(false);
    expect(binding.getClipDuration(0, 'missing')).toBe(0);
  });

  test('마스크 레이어는 지정 본과 하위 본 트랙만 가진 별도 액션을 만든다', () => {
    const { mixer, actions, root, hips, arm } = createRig();
    const upper: AnimatorLayerDefinition = {
      name: 'upper',
      defaultState: 'wave',
      mask: { bones: ['Spine'], includeDescendants: true },
      states: [{ name: 'wave', motion: { kind: 'clip', clip: 'wave' } }],
    };
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer, upper]);
    binding.beginFrame();
    binding.writeClip(0, 'idle', 1, 1, 1);
    binding.writeClip(1, 'wave', 1, 1, 0.999);
    binding.endFrame();
    expect(actions.get('wave')!.isScheduled()).toBe(false);
    expect(root.getObjectByName('Spine')).toBeDefined();
    mixer.update(0);
    expect(hips.position.x).toBeCloseTo(2);
    expect(arm.position.y).toBeGreaterThan(3.9);
  });

  test('additive 레이어는 가산 블렌드 모드 액션을 쓴다', () => {
    const { actions, mixer } = createRig();
    const additive: AnimatorLayerDefinition = {
      name: 'breath',
      defaultState: 'wave',
      blending: 'additive',
      states: [{ name: 'wave', motion: { kind: 'clip', clip: 'wave' } }],
    };
    const spy = jest.spyOn(mixer, 'clipAction');
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer, additive]);
    binding.beginFrame();
    binding.writeClip(1, 'wave', 0.5, 1, 0.5);
    binding.endFrame();
    const created = spy.mock.results.at(-1)?.value as THREE.AnimationAction;
    expect(created.blendMode).toBe(THREE.AdditiveAnimationBlendMode);
    expect(created.getEffectiveWeight()).toBeCloseTo(0.5);
    spy.mockRestore();
  });

  test('invalidate는 기본 액션을 원래 재생 설정으로 돌리고 레이어 액션 캐시를 비운다', () => {
    const { actions, mixer } = createRig();
    const upper: AnimatorLayerDefinition = {
      name: 'upper',
      defaultState: 'wave',
      mask: { bones: ['Arm'] },
      states: [{ name: 'wave', motion: { kind: 'clip', clip: 'wave' } }],
    };
    const binding = new ThreeAnimatorBinding((clip) => actions.get(clip) ?? null, [baseLayer, upper]);
    const uncache = jest.spyOn(mixer, 'uncacheAction');
    binding.beginFrame();
    binding.writeClip(0, 'idle', 0.3, 0.4, 1);
    binding.writeClip(1, 'wave', 0.3, 1, 0.5);
    binding.endFrame();
    binding.invalidate();
    const idle = actions.get('idle')!;
    expect(idle.isScheduled()).toBe(false);
    expect(idle.getEffectiveTimeScale()).toBe(1);
    expect(idle.getEffectiveWeight()).toBe(1);
    expect(uncache).toHaveBeenCalledTimes(1);
    uncache.mockRestore();
  });
});
