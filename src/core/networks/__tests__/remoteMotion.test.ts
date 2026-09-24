import { createRemoteMotion, syncRemoteMotion } from '../core/remoteMotion';
import type { PlayerState } from '../types';

const state = (x: number, speed = 0, animation?: string): PlayerState => ({
  name: 'peer',
  color: '#fff',
  position: [x, 0, 0],
  rotation: [1, 0, 0, 0],
  velocity: [speed, 0, 0],
  ...(animation ? { animation } : {}),
});

test('the first state places the avatar; later ones only move the targets', () => {
  const motion = createRemoteMotion();
  expect(syncRemoteMotion(motion, state(3), 0.5)).toBe(true);
  expect(motion.position.x).toBe(3);
  const next = state(8);
  expect(syncRemoteMotion(motion, next, 0.5)).toBe(false);
  expect(syncRemoteMotion(motion, next, 0.5)).toBe(false);
  expect(motion.target.x).toBe(8);
  expect(motion.position.x).toBe(3);
});

test('peers without an animation run or idle by speed, with hysteresis', () => {
  const motion = createRemoteMotion();
  syncRemoteMotion(motion, state(0, 0), 0.5);
  expect(motion.appearance.animation).toBe('idle');
  expect(syncRemoteMotion(motion, state(0, 0.6), 0.5)).toBe(true);
  expect(motion.appearance.animation).toBe('run');
  expect(syncRemoteMotion(motion, state(0, 0.4), 0.5)).toBe(false);
  expect(syncRemoteMotion(motion, state(0, 0.2), 0.5)).toBe(true);
  expect(motion.appearance.animation).toBe('idle');
  expect(syncRemoteMotion(motion, state(0, 0.2, 'wave'), 0.5)).toBe(true);
  expect(motion.appearance.animation).toBe('wave');
});
