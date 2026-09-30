import * as THREE from 'three';

import { findClipKey, holdUnkeyedTracks, makeClipInPlace } from '../clips';

function rig() {
  const root = new THREE.Group();
  const hips = new THREE.Bone();
  hips.name = 'hips';
  const arm = new THREE.Bone();
  arm.name = 'arm';
  root.add(hips);
  hips.add(arm);
  return { root, hips, arm };
}

test('clip names resolve exactly, then ignoring case, then by containment', () => {
  expect(findClipKey(['Idle', 'Walking', 'Run'], 'Idle')).toBe('Idle');
  expect(findClipKey(['Idle', 'Walking', 'Run'], 'idle')).toBe('Idle');
  expect(findClipKey(['Idle', 'Walking', 'Run'], 'walk')).toBe('Walking');
  expect(findClipKey(['Idle'], 'jump')).toBeUndefined();
});

test('every clip holds the bones it leaves unkeyed at the idle pose, so a crossfade never passes the bind pose', () => {
  const { root } = rig();
  const down = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -1.2));
  const idle = new THREE.AnimationClip('Idle', 2, [new THREE.QuaternionKeyframeTrack('arm.quaternion', [0, 2], [...down.toArray(), ...down.toArray()])]);
  const walk = new THREE.AnimationClip('Walking', 1, [new THREE.VectorKeyframeTrack('hips.position', [0, 1], [0, 1, 0, 0, 1.1, 0])]);
  holdUnkeyedTracks(root, [idle, walk]);

  const heldArm = walk.tracks.find((track) => track.name === 'arm.quaternion')!;
  // Track values are float32.
  down.toArray().forEach((value, index) => {
    expect(heldArm.values[index]).toBeCloseTo(value, 6);
    expect(heldArm.values[index + 4]).toBeCloseTo(value, 6);
  });
  // Idle takes the walk's first hips key, the only clip keying it.
  const heldHips = idle.tracks.find((track) => track.name === 'hips.position')!;
  expect(Array.from(heldHips.values.slice(0, 3))).toEqual([0, 1, 0]);
});

test('a looping walk loses its root travel, keeps its bob, and reports the ground speed it was authored at', () => {
  const { root } = rig();
  const walk = new THREE.AnimationClip('Walking', 1, [
    new THREE.VectorKeyframeTrack('hips.position', [0, 0.5, 1], [0, 1, 0, 0, 1.05, 0.7, 0, 1, 1.4]),
  ]);
  const original = walk.tracks[0]!;
  const speed = makeClipInPlace(root, walk);
  expect(speed).toBeCloseTo(1.4);
  const values = Array.from(walk.tracks[0]!.values);
  expect(values[2]).toBeCloseTo(0);
  expect(values[5]).toBeCloseTo(0);
  expect(values[8]).toBeCloseTo(0);
  expect(values[4]).toBeCloseTo(1.05);
  // The authored track is untouched; other clips sharing it keep their motion.
  expect(original.values[8]).toBeCloseTo(1.4);
});

test('a clip that barely drifts stays as authored and reports no stride', () => {
  const { root } = rig();
  const idle = new THREE.AnimationClip('Idle', 1, [new THREE.VectorKeyframeTrack('hips.position', [0, 1], [0, 1, 0, 0, 1, 0.05])]);
  expect(makeClipInPlace(root, idle)).toBe(0);
});
