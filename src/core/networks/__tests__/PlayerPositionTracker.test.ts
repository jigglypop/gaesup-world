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
