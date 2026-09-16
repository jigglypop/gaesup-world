import { Bone, Group, Skeleton } from 'three';

import definition from '../core/rig.json';
import { HUMANOID_BONES, type HumanoidBone, type AvatarSocket } from '../core/types';

for (const bone of definition.bones) Object.freeze(bone);
Object.freeze(definition.bones);
export const CANONICAL_AVATAR_RIG = Object.freeze(definition);
export const AVATAR_SOCKETS: Record<
  AvatarSocket,
  { bone: HumanoidBone; position: [number, number, number] }
> = {
  head: { bone: 'head', position: [0, 0.28, 0] },
  face: { bone: 'head', position: [0, 0, 0.25] },
  handL: { bone: 'handL', position: [0, 0, 0] },
  handR: { bone: 'handR', position: [0, 0, 0] },
  back: { bone: 'upperChest', position: [0, -0.04, -0.15] },
  waist: { bone: 'hips', position: [0, 0, 0] },
  chest: { bone: 'chest', position: [0, 0, 0.15] },
};

export function createAvatarSkeleton(root: Group) {
  const bones = {} as Record<HumanoidBone, Bone>;
  for (const [key, parent, x, y, z] of definition.bones) {
    const bone = new Bone();
    bone.name = String(key);
    bone.position.set(Number(x), Number(y), Number(z));
    bones[key as HumanoidBone] = bone;
    if (parent) bones[parent as HumanoidBone].add(bone);
    else root.add(bone);
  }
  root.updateMatrixWorld(true);
  const skeleton = new Skeleton(HUMANOID_BONES.map((key) => bones[key]));
  return { bones, skeleton };
}
