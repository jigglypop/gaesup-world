import type * as THREE from 'three';

/** Resolve once per rig/part change; ambiguous names must never pick an arbitrary bone. */
export function findAttachmentBone(
  skeleton: THREE.Skeleton | null | undefined,
  name: string,
): THREE.Bone | undefined {
  let match: THREE.Bone | undefined;
  for (const bone of skeleton?.bones ?? []) {
    if (bone.name !== name) continue;
    if (match) return undefined;
    match = bone;
  }
  return match;
}

/** Follow an animated bone under a separate render parent, with no frame allocations. */
export function updateBoneAttachmentMatrix(object: THREE.Object3D, bone: THREE.Bone): void {
  bone.updateWorldMatrix(true, false);
  if (object.parent) {
    object.parent.updateWorldMatrix(true, false);
    object.matrix.copy(object.parent.matrixWorld).invert().multiply(bone.matrixWorld);
  } else {
    object.matrix.copy(bone.matrixWorld);
  }
  object.matrixAutoUpdate = false;
  object.matrixWorldNeedsUpdate = true;
}
