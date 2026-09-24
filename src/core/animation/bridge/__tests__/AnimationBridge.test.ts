import { AnimationClip, AnimationMixer, Object3D } from 'three';

import { AnimationBridge } from '../AnimationBridge';

// Real AnimationSystem engines: a mocked engine only proved that calls were forwarded.
const mixer = new AnimationMixer(new Object3D());
const action = (name: string) => mixer.clipAction(new AnimationClip(name, 1, []));

describe('AnimationBridge', () => {
  let bridge: AnimationBridge;

  beforeEach(() => {
    bridge = new AnimationBridge();
  });

  afterEach(() => {
    bridge.dispose();
    mixer.stopAllAction();
  });

  test('owns one engine per animation type and keeps their actions apart', () => {
    bridge.registerAnimations('character', { walk: action('walk') });
    bridge.registerAnimations('vehicle', { drive: action('drive') });

    expect(bridge.snapshot('character')?.availableAnimations).toEqual(['walk']);
    expect(bridge.snapshot('vehicle')?.availableAnimations).toEqual(['drive']);
    expect(bridge.snapshot('airplane')?.availableAnimations).toEqual([]);
  });

  test('a play command runs the action for that type only', () => {
    const drive = action('drive');
    bridge.registerAnimations('vehicle', { drive });
    bridge.execute('vehicle', { type: 'play', animation: 'drive', duration: 0 });

    expect(drive.isRunning()).toBe(true);
    expect(bridge.snapshot('vehicle')).toMatchObject({ currentAnimation: 'drive', isPlaying: true });
    expect(bridge.snapshot('character')).toMatchObject({ currentAnimation: 'idle', isPlaying: false });
  });

  test('listeners get the changed engine type with its snapshot', () => {
    const updates: Array<[string, string[]]> = [];
    bridge.subscribe((snapshot, type) => updates.push([type, [...snapshot.availableAnimations]]));

    bridge.registerAnimations('airplane', { fly: action('fly') });

    expect(updates).toEqual([['airplane', ['fly']]]);
  });

  test('dispose releases every engine and stops notifying', () => {
    const listener = jest.fn();
    bridge.subscribe(listener);
    bridge.dispose();

    bridge.registerAnimations('character', { walk: action('walk') });
    expect(['character', 'vehicle', 'airplane'].map((type) => bridge.getEngine(type))).toEqual([undefined, undefined, undefined]);
    expect(listener).not.toHaveBeenCalled();
  });
});
