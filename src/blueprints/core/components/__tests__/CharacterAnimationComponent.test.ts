import * as THREE from 'three';

import { CharacterAnimationComponent } from '../CharacterAnimationComponent';
import type { ComponentContext } from '../../types';
import { BlueprintFactory } from '../../../factory/BlueprintFactory';

test('uses the requested gait at custom speeds and stays idle when stationary', () => {
  const animationClips = Object.fromEntries(['idle', 'walk', 'run'].map(name => [name, new THREE.AnimationClip(name, 1, [])]));
  const clipAction = jest.spyOn(THREE.AnimationMixer.prototype, 'clipAction');
  const component = new CharacterAnimationComponent({
    animations: { idle: 'idle', walk: 'walk', run: 'run', jump: { start: '', loop: '', land: '' } },
    defaultAnimation: 'idle',
  });
  const velocity = { x: 5, y: 0, z: 0 };
  const context = {
    animationClips, rigidBodyRef: { current: { linvel: () => velocity } },
    innerGroupRef: { current: new THREE.Group() }, deltaTime: 1 / 60, entityId: 'gait',
    movementInput: { run: true, isGrounded: true },
  } as unknown as ComponentContext;
  try {
    component.initialize(context);
    const actions = new Map(clipAction.mock.results.map(result => {
      const action = result.value as THREE.AnimationAction;
      return [action.getClip().name, action];
    }));
    component.update(context);
    expect(actions.get('run')?.isRunning()).toBe(true);
    velocity.x = 7;
    context.movementInput = { isGrounded: true };
    component.update(context);
    expect(actions.get('walk')?.isRunning()).toBe(true);
    expect(actions.get('run')?.isRunning()).toBe(false);
    velocity.x = 0;
    context.movementInput.run = true;
    component.update(context);
    expect(actions.get('idle')?.isRunning()).toBe(true);
  } finally {
    component.dispose();
    clipAction.mockRestore();
  }
});

test('factory entities isolate same-named clips and disposing one preserves the other', () => {
  const factory = BlueprintFactory.getInstance();
  const firstRoot = new THREE.Group();
  const secondRoot = new THREE.Group();
  const definition = {
    id: 'isolated', name: 'isolated', type: 'character' as const,
    components: [{ type: 'CharacterAnimation', enabled: true, properties: {
      animations: { idle: 'idle', walk: '', run: '', jump: { start: '', loop: '', land: '' } },
      defaultAnimation: 'idle',
    } }],
  };
  const body = { current: null } as unknown as ComponentContext['rigidBodyRef'];
  const clips = (distance: number) => ({ idle: new THREE.AnimationClip('idle', 1, [
    new THREE.NumberKeyframeTrack('.position[x]', [0, 1], [0, distance]),
  ]) });
  const firstClips = clips(1);
  const secondClips = clips(4);
  const first = factory.createFromDefinition(definition, { rigidBodyRef: body, innerGroupRef: { current: firstRoot }, animationClips: firstClips });
  const second = factory.createFromDefinition(definition, { rigidBodyRef: body, innerGroupRef: { current: secondRoot }, animationClips: secondClips });
  try {
    first.update(0.25);
    second.update(0.25);
    expect(firstRoot.position.x).toBeCloseTo(0.25);
    expect(secondRoot.position.x).toBeCloseTo(1);
    first.dispose();
    second.update(0.25);
    expect(secondRoot.position.x).toBeCloseTo(2);
    expect(firstClips.idle.tracks).toHaveLength(1);
    expect(secondClips.idle.tracks).toHaveLength(1);
  } finally {
    first.dispose();
    second.dispose();
  }
});

test('plays takeoff once, loops through apex and descent, then completes landing', () => {
  const animationClips = Object.fromEntries(['idle', 'start', 'loop', 'land'].map(name => [name, new THREE.AnimationClip(name, 0.2, [])]));
  const clipAction = jest.spyOn(THREE.AnimationMixer.prototype, 'clipAction');
  const component = new CharacterAnimationComponent({
    animations: { idle: 'idle', walk: '', run: '', jump: { start: 'start', loop: 'loop', land: 'land' } },
    defaultAnimation: 'idle',
  });
  const velocity = { x: 0, y: 0, z: 0 };
  const context = {
    animationClips,
    rigidBodyRef: { current: { linvel: () => velocity } },
    innerGroupRef: { current: new THREE.Group() }, deltaTime: 0.1, entityId: 'jump',
    movementInput: { isGrounded: true },
  } as unknown as ComponentContext;
  try {
    component.initialize(context);
    const actions = new Map(clipAction.mock.results.map(result => {
      const action = result.value as THREE.AnimationAction;
      return [action.getClip().name, action];
    }));
    expect(actions.size).toBe(4);
    context.movementInput!.isGrounded = false;
    velocity.y = 3;
    component.update(context);
    expect(actions.get('start')?.isRunning()).toBe(true);
    component.update(context);
    component.update(context);
    expect(actions.get('start')?.isRunning()).toBe(false);
    expect(actions.get('loop')?.isRunning()).toBe(true);
    velocity.y = 0;
    component.update(context);
    expect(actions.get('loop')?.isRunning()).toBe(true);
    velocity.y = -3;
    component.update(context);
    expect(actions.get('loop')?.isRunning()).toBe(true);
    velocity.y = 0;
    context.movementInput!.isGrounded = true;
    component.update(context);
    expect(actions.get('land')?.isRunning()).toBe(true);
    expect(actions.get('loop')?.isRunning()).toBe(false);
    component.update(context);
    component.update(context);
    expect(actions.get('land')?.isRunning()).toBe(false);
    expect(actions.get('idle')?.isRunning()).toBe(true);
  } finally {
    component.dispose();
    clipAction.mockRestore();
  }
});

test.each([false, true])('missing transitions preserve playback and loaded alternatives are selected (array=%s)', (useAlternatives) => {
  const animationClips = {
    idle: new THREE.AnimationClip('idle', 1, [new THREE.NumberKeyframeTrack('.position[x]', [0, 1], [0, 1])]),
    run: new THREE.AnimationClip('run', 1, [new THREE.NumberKeyframeTrack('.position[x]', [0, 1], [0, 2])]),
  };
  const clipAction = jest.spyOn(THREE.AnimationMixer.prototype, 'clipAction');
  const component = new CharacterAnimationComponent({
    animations: {
      idle: useAlternatives ? ['unloaded-idle', 'idle'] : 'idle',
      walk: 'unloaded-walk',
      run: useAlternatives ? ['unloaded-run', 'run'] : 'run',
      jump: { start: 'unloaded-start', loop: 'unloaded-loop', land: 'unloaded-land' },
    },
    defaultAnimation: 'idle',
  });
  const velocity = { x: 0, y: 0, z: 0 };
  const root = new THREE.Group();
  const context = {
    animationClips,
    rigidBodyRef: { current: { linvel: () => velocity } },
    innerGroupRef: { current: root }, deltaTime: 0.25, entityId: 'transitions',
  } as unknown as ComponentContext;
  try {
    component.initialize(context);
    expect(clipAction).toHaveBeenCalledTimes(2);
    const idle = clipAction.mock.results[0]!.value as THREE.AnimationAction;
    const run = clipAction.mock.results[1]!.value as THREE.AnimationAction;
    component.update(context);
    expect(root.position.x).toBeCloseTo(0.25);
    velocity.y = 1;
    component.update(context);
    expect(idle.isRunning()).toBe(true);
    expect(root.position.x).toBeCloseTo(0.5);
    velocity.y = 0;
    velocity.x = 2;
    component.update(context);
    expect(idle.isRunning()).toBe(true);
    expect(root.position.x).toBeCloseTo(0.75);
    velocity.x = 10;
    component.update(context);
    expect(idle.isRunning()).toBe(false);
    expect(run.isRunning()).toBe(true);
    component.update(context);
    expect(root.position.x).toBeCloseTo(0.5);
  } finally {
    component.dispose();
    clipAction.mockRestore();
  }
});

test('reinitialization and disposal release owned mixer roots and stop further updates', () => {
  const animationClips = {
    idle: new THREE.AnimationClip('idle', 1, [
      new THREE.NumberKeyframeTrack('.position[x]', [0, 1], [0, 1]),
    ]),
  };
  const uncacheRoot = jest.spyOn(THREE.AnimationMixer.prototype, 'uncacheRoot');
  const update = jest.spyOn(THREE.AnimationMixer.prototype, 'update');
  const clipAction = jest.spyOn(THREE.AnimationMixer.prototype, 'clipAction');
  const component = new CharacterAnimationComponent({
    animations: { idle: 'idle', walk: 'walk', run: 'run', jump: { start: '', loop: '', land: '' } },
    defaultAnimation: 'idle',
  });
  const first = new THREE.Group();
  const second = new THREE.Group();
  const context = {
    animationClips,
    rigidBodyRef: { current: null },
    innerGroupRef: { current: first },
    deltaTime: 0.25,
    entityId: 'animation',
  } as unknown as ComponentContext;
  try {
    component.initialize(context);
    component.update(context);
    expect(first.position.x).toBeCloseTo(0.25);
    component.initialize({ ...context, innerGroupRef: { current: second } });
    expect(uncacheRoot).toHaveBeenCalledWith(first);
    component.update(context);
    expect(second.position.x).toBeCloseTo(0.25);
    component.dispose();
    expect(uncacheRoot).toHaveBeenCalledWith(second);
    expect(uncacheRoot).toHaveBeenCalledTimes(2);
    update.mockClear();
    component.update(context);
    component.dispose();
    expect(update).not.toHaveBeenCalled();
    expect(uncacheRoot).toHaveBeenCalledTimes(2);
    clipAction.mockImplementationOnce(() => { throw new Error('invalid clip'); });
    expect(() => component.initialize(context)).toThrow('invalid clip');
    expect(uncacheRoot).toHaveBeenCalledTimes(3);
    component.update(context);
    expect(update).not.toHaveBeenCalled();
  } finally {
    component.dispose();
    uncacheRoot.mockRestore();
    update.mockRestore();
    clipAction.mockRestore();
  }
});
