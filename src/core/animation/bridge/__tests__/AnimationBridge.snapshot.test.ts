import { AnimationClip, AnimationMixer, LoopOnce, Object3D } from 'three';

import { AnimationBridge } from '../AnimationBridge';

test('scoped cleanup preserves replacement and unrelated actions and refreshes equal-count name changes', () => {
  const bridge = new AnimationBridge();
  const mixer = new AnimationMixer(new Object3D());
  const old = mixer.clipAction(new AnimationClip('old', 1, []));
  const replacement = mixer.clipAction(new AnimationClip('replacement', 1, []));
  const wave = mixer.clipAction(new AnimationClip('wave', 1, []));
  try {
    bridge.registerAnimations('character', { '\bwalk': old });
    bridge.execute('character', { type: 'play', animation: 'walk', duration: 0 });
    bridge.registerAnimations('character', { walk: replacement, wave });
    expect(old.isRunning()).toBe(false);
    bridge.execute('character', { type: 'play', animation: 'walk', duration: 0 });
    bridge.unregisterAnimations('character', { '\bwalk': old });
    expect(replacement.isRunning()).toBe(true);
    expect(bridge.snapshot('character')?.availableAnimations).toEqual(['walk', 'wave']);
    bridge.unregisterAnimations('character', { walk: replacement });
    bridge.registerAnimations('character', { run: old });
    expect(bridge.snapshot('character')?.availableAnimations).toEqual(['wave', 'run']);
    const names = bridge.snapshot('character')?.availableAnimations;
    bridge.update('character', 1 / 60);
    expect(bridge.snapshot('character')?.availableAnimations).toBe(names);
    bridge.unregisterAnimations('character');
    expect(bridge.snapshot('character')?.availableAnimations).toEqual([]);
  } finally {
    bridge.dispose();
    mixer.stopAllAction();
  }
});

test.each([false, true])('publishes natural completion and allows replay with clampWhenFinished=%s', (clampWhenFinished) => {
  const bridge = new AnimationBridge();
  const mixer = new AnimationMixer(new Object3D());
  const action = mixer.clipAction(new AnimationClip('wave', 1, []));
  action.setLoop(LoopOnce, 1);
  action.clampWhenFinished = clampWhenFinished;
  const playingStates: boolean[] = [];
  const unsubscribe = bridge.subscribe((snapshot, type) => {
    if (type === 'character' && snapshot) playingStates.push(snapshot.isPlaying);
  });
  try {
    bridge.registerAnimations('character', { wave: action });
    bridge.execute('character', { type: 'play', animation: 'wave', duration: 0 });
    mixer.update(0.5);
    bridge.update('character', 0.5);
    expect(bridge.snapshot('character')?.isPlaying).toBe(true);
    mixer.update(0.6);
    bridge.update('character', 0.6);
    expect(action.isRunning()).toBe(false);
    expect(bridge.snapshot('character')?.isPlaying).toBe(false);
    expect(bridge.snapshot('character')?.currentAnimation).toBe('wave');
    expect(playingStates.at(-1)).toBe(false);
    bridge.execute('character', { type: 'play', animation: 'wave', duration: 0 });
    expect(action.isRunning()).toBe(true);
    expect(bridge.snapshot('character')?.isPlaying).toBe(true);
  } finally {
    unsubscribe();
    bridge.dispose();
    mixer.stopAllAction();
  }
});

test('reports action speed and stops both sides of a crossfade without stopping unrelated mixer actions', () => {
  const bridge = new AnimationBridge();
  const mixer = new AnimationMixer(new Object3D());
  const walk = mixer.clipAction(new AnimationClip('walk', 2, []));
  const run = mixer.clipAction(new AnimationClip('run', 2, []));
  const unrelated = mixer.clipAction(new AnimationClip('unrelated', 2, [])).play();
  try {
    bridge.registerAnimations('character', { walk, run });
    bridge.execute('character', { type: 'play', animation: 'walk', duration: 0 });
    bridge.execute('character', { type: 'setSpeed', speed: 2 });
    expect(bridge.snapshot('character')?.speed).toBe(2);
    bridge.execute('character', { type: 'play', animation: 'run', duration: 1 });
    expect(bridge.snapshot('character')?.speed).toBe(1);
    expect(walk.isRunning()).toBe(true);
    expect(run.isRunning()).toBe(true);
    bridge.execute('character', { type: 'stop' });
    expect(walk.isRunning()).toBe(false);
    expect(run.isRunning()).toBe(false);
    expect(unrelated.isRunning()).toBe(true);
    expect(bridge.snapshot('character')?.metrics.activeAnimations).toBe(0);
    expect(bridge.snapshot('character')?.isPlaying).toBe(false);
  } finally {
    bridge.dispose();
    mixer.stopAllAction();
  }
});

test('registration and commands publish current state within the same clock tick', () => {
  const clock = jest.spyOn(Date, 'now').mockReturnValue(1000);
  const bridge = new AnimationBridge();
  const mixer = new AnimationMixer(new Object3D());
  const action = mixer.clipAction(new AnimationClip('walk', 1, []));
  try {
    expect(bridge.snapshot('character')?.availableAnimations).toEqual([]);
    bridge.registerAnimations('character', { walk: action });
    expect(bridge.snapshot('character')?.availableAnimations).toEqual(['walk']);
    bridge.execute('character', { type: 'play', animation: 'walk' });
    expect(bridge.snapshot('character')?.isPlaying).toBe(true);
    expect(bridge.snapshot('character')?.currentAnimation).toBe('walk');
    const snapshot = bridge.snapshot('character');
    const names = snapshot?.availableAnimations;
    for (let frame = 0; frame < 20; frame++) {
      bridge.update('character', 1 / 60);
      expect(bridge.snapshot('character')).toBe(snapshot);
      expect(bridge.snapshot('character')?.availableAnimations).toBe(names);
    }
    bridge.execute('character', { type: 'stop' });
    expect(bridge.snapshot('character')?.isPlaying).toBe(false);
    bridge.unregisterAnimations('character');
    expect(bridge.snapshot('character')?.availableAnimations).toEqual([]);
  } finally {
    bridge.dispose();
    mixer.stopAllAction();
    clock.mockRestore();
  }
});
