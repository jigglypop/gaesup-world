import type { RapierRigidBody } from '@react-three/rapier';

import { PlayerPositionTracker } from '../core/PlayerPositionTracker';

const PLAYER_REF = {
  current: {
    translation: () => ({ x: 0, y: 0, z: 0 }),
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    linvel: () => ({ x: 0, y: 0, z: 0 }),
  } as unknown as RapierRigidBody,
};

test('stationary identity updates are sent once and reset sends a fresh snapshot', () => {
  const tracker = new PlayerPositionTracker({ updateRate: 30, velocityThreshold: 0.1, sendRateLimit: 0 });
  const track = (name = 'player', color = 'red', model = 'old.glb') =>
    tracker.trackPosition(PLAYER_REF, name, color, model, 'idle');

  expect(track()?.modelUrl).toBe('old.glb');
  expect(track()).toBeNull();
  expect(track('player', 'red', 'new.glb')?.modelUrl).toBe('new.glb');
  expect(track('player', 'red', 'new.glb')).toBeNull();
  expect(track('renamed', 'red', 'new.glb')?.name).toBe('renamed');
  expect(track('renamed', 'blue', 'new.glb')?.color).toBe('blue');
  expect(track('renamed', 'blue', 'new.glb')).toBeNull();
  tracker.reset();
  expect(track('renamed', 'blue', 'new.glb')).not.toBeNull();
});

test('sends velocity-only changes including a stop without repeating unchanged snapshots', () => {
  const tracker = new PlayerPositionTracker({ updateRate: 30, velocityThreshold: 0.1, sendRateLimit: 0 });
  let speed = 1;
  const playerRef = {
    current: {
      translation: PLAYER_REF.current.translation,
      rotation: PLAYER_REF.current.rotation,
      linvel: () => ({ x: 0, y: speed, z: 0 }),
    } as unknown as RapierRigidBody,
  };
  const track = () => tracker.trackPosition(playerRef, 'player', 'red', undefined, 'jump');
  expect(track()?.velocity).toEqual([0, 1, 0]);
  expect(track()).toBeNull();
  speed = 0;
  expect(track()?.velocity).toEqual([0, 0, 0]);
  expect(track()).toBeNull();
});

describe('send thresholds', () => {
  beforeEach(() => jest.useFakeTimers({ now: 0 }));
  afterEach(() => jest.useRealTimers());

  const identity = () => ({ x: 0, y: 0, z: 0, w: 1 });
  const bodyAt = (position: () => { x: number; y: number; z: number }, rotation = identity) => ({
    current: { translation: position, rotation, linvel: () => ({ x: 0, y: 0, z: 0 }) } as unknown as RapierRigidBody,
  });
  const tracker = () => new PlayerPositionTracker({ updateRate: 20, velocityThreshold: 0.5, sendRateLimit: 50 });

  test('sub-centimetre steps go out once they add up to 1 cm', () => {
    let x = 0;
    const ref = bodyAt(() => ({ x, y: 0, z: 0 }));
    const subject = tracker();
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')).not.toBeNull();
    const sentSteps: number[] = [];
    for (let step = 1; step <= 12; step++) {
      x = step * 0.003;
      jest.advanceTimersByTime(50);
      if (subject.trackPosition(ref, 'p', 'red', undefined, 'idle')) sentSteps.push(step);
    }
    expect(sentSteps).toEqual([4, 8, 12]);
  });

  test('rotation below 1e-3 per component waits for the keepalive', () => {
    let y = 0;
    const ref = bodyAt(() => ({ x: 0, y: 0, z: 0 }), () => ({ x: 0, y, z: 0, w: Math.sqrt(1 - y * y) }));
    const subject = tracker();
    subject.trackPosition(ref, 'p', 'red', undefined, 'idle');
    y = 5e-4;
    jest.advanceTimersByTime(50);
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')).toBeNull();
    y = 2e-3;
    jest.advanceTimersByTime(50);
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')?.rotation).toEqual([1, 0, 0.002, 0]);
    jest.advanceTimersByTime(999);
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')).toBeNull();
    jest.advanceTimersByTime(1);
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')).not.toBeNull();
  });

  test('an early sample is not dropped; the send path owns the rate limit', () => {
    let x = 0;
    const ref = bodyAt(() => ({ x, y: 0, z: 0 }));
    const subject = tracker();
    subject.trackPosition(ref, 'p', 'red', undefined, 'idle');
    x = 1;
    jest.advanceTimersByTime(49);
    expect(subject.trackPosition(ref, 'p', 'red', undefined, 'idle')?.position).toEqual([1, 0, 0]);
  });

  test('wire values keep 1 mm, 1e-4 and 1 cm/s precision', () => {
    const ref = {
      current: {
        translation: () => ({ x: 1.23456789, y: 0.52049, z: -87.6543 }),
        rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
        linvel: () => ({ x: 0.123456, y: 1.005, z: 0 }),
      } as unknown as RapierRigidBody,
    };
    const update = tracker().trackPosition(ref, 'p', 'red', undefined, 'idle')!;
    expect(update.position).toEqual([1.235, 0.52, -87.654]);
    expect(update.velocity).toEqual([0.12, 1, 0]);
    expect(update.rotation.map((component) => Math.round(component * 1e4) / 1e4)).toEqual(update.rotation);
  });
});
