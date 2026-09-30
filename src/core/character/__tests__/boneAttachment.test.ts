import * as THREE from 'three';

import { findAttachmentBone, updateBoneAttachmentMatrix } from '../boneAttachment';

describe('rigid bone attachments', () => {
  it('refuses absent or ambiguous names rather than attaching to an arbitrary joint', () => {
    const first = new THREE.Bone(); first.name = 'hand.R';
    const second = new THREE.Bone(); second.name = 'hand.R';
    expect(findAttachmentBone(null, 'hand.R')).toBeUndefined();
    expect(findAttachmentBone(new THREE.Skeleton([first]), 'hand.R')).toBe(first);
    expect(findAttachmentBone(new THREE.Skeleton([first]), 'missing')).toBeUndefined();
    expect(findAttachmentBone(new THREE.Skeleton([first, second]), 'hand.R')).toBeUndefined();
  });

  it('follows animated hand world transforms across different parents and keeps authored grip offsets', () => {
    const rig = new THREE.Group();
    rig.position.set(4, 2, -3);
    rig.rotation.set(0.2, 0.7, 0);
    rig.scale.setScalar(1.4);
    const hand = new THREE.Bone();
    hand.position.set(0.6, 1, 0);
    rig.add(hand);
    const renderParent = new THREE.Group();
    renderParent.position.set(-4, 1, 6);
    renderParent.rotation.y = -0.3;
    renderParent.scale.setScalar(0.8);
    const follower = new THREE.Group();
    const grip = new THREE.Group();
    grip.position.set(0, 0.12, 0.05);
    grip.rotation.z = Math.PI / 2;
    grip.scale.setScalar(0.5);
    follower.add(grip);
    renderParent.add(follower);
    for (const angle of [0, 0.6, -1.2]) {
      hand.rotation.z = angle;
      updateBoneAttachmentMatrix(follower, hand);
      grip.updateWorldMatrix(true, false);
      const expected = new THREE.Matrix4().multiplyMatrices(hand.matrixWorld, grip.matrix);
      grip.matrixWorld.elements.forEach((value, index) => expect(value).toBeCloseTo(expected.elements[index]!, 6));
    }
    expect(follower.matrixAutoUpdate).toBe(false);
    expect(grip.position.toArray()).toEqual([0, 0.12, 0.05]);
  });

  it('copies bone world space for a root attachment without changing the bone or allocating matrices', () => {
    const hand = new THREE.Bone(); hand.position.set(1, 2, 3);
    const follower = new THREE.Group();
    const matrix = follower.matrix;
    updateBoneAttachmentMatrix(follower, hand);
    expect(follower.matrix).toBe(matrix);
    expect(follower.matrix.equals(hand.matrixWorld)).toBe(true);
    expect(hand.position.toArray()).toEqual([1, 2, 3]);
  });
});
