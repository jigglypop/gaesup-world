import {
  Group,
  Mesh,
  SkinnedMesh,
  Matrix4,
  Uint16BufferAttribute,
  type Bone,
  type BufferGeometry,
  type Skeleton,
  type Object3D,
} from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { AVATAR_SOCKETS, CANONICAL_AVATAR_RIG } from './skeleton';
import {
  AvatarCompatibilityError,
  HUMANOID_BONES,
  type AvatarManifest,
  type HumanoidBone,
  type AvatarMeshReference,
} from '../core/types';

export type AssembledAvatarAsset = { group: Group; meshes: Map<string, Mesh>; dispose: () => void };
export const avatarMeshKey = (ref: AvatarMeshReference): string => `${ref.node}:${ref.primitive}`;
const close = (a: Matrix4, b: Matrix4): boolean =>
  a.elements.every((v, i) => Math.abs(v - b.elements[i]!) < 0.0001);
const IDENTITY = new Matrix4();

export async function assembleAvatarAsset(
  gltf: GLTF,
  manifest: AvatarManifest,
  skeleton: Skeleton,
  bones: Record<HumanoidBone, Bone>,
): Promise<AssembledAvatarAsset> {
  const group = new Group();
  const meshes = new Map<string, Mesh>();
  const owned = new Set<BufferGeometry>();
  const dispose = () => {
    group.removeFromParent();
    group.clear();
    for (const geometry of owned) geometry.dispose();
    owned.clear();
  };
  try {
    gltf.scene.updateMatrixWorld(true);
    const nodes = new Map<number, Object3D>();
    gltf.scene.traverse((object) => {
      const index = gltf.parser.associations.get(object)?.nodes;
      if (index !== undefined) nodes.set(index, object);
    });
    const sourceBones = HUMANOID_BONES.map((key) => {
      const bone = nodes.get(manifest.bones[key]);
      if (!bone)
        throw new AvatarCompatibilityError(`Canonical bone is outside the default scene: ${key}`);
      return bone;
    });
    if (manifest.attachment.mode === 'skinned') {
      for (const [index, sourceBone] of sourceBones.entries()) {
        if (!close(sourceBone.matrixWorld.clone().invert(), skeleton.boneInverses[index]!))
          throw new AvatarCompatibilityError('Canonical rest pose mismatch');
        const parent = CANONICAL_AVATAR_RIG.bones[index]![1];
        if (parent && sourceBone.parent !== nodes.get(manifest.bones[parent as HumanoidBone]))
          throw new AvatarCompatibilityError('Canonical bone hierarchy mismatch');
      }
    }
    for (const ref of manifest.meshes) {
      const node = nodes.get(ref.node);
      if (!node)
        throw new AvatarCompatibilityError(`Mesh node is outside the default scene: ${ref.node}`);
      let source: Mesh | undefined;
      for (const object of node instanceof Mesh ? [node] : node.children) {
        const association = gltf.parser.associations.get(object);
        if (
          object instanceof Mesh &&
          association &&
          'primitives' in association &&
          association.primitives === ref.primitive
        )
          source = object;
      }
      if (!source || meshes.has(avatarMeshKey(ref)))
        throw new AvatarCompatibilityError(`Missing/duplicate mesh ${avatarMeshKey(ref)}`);
      let mesh: Mesh;
      if (manifest.attachment.mode === 'skinned') {
        if (
          !(source instanceof SkinnedMesh) ||
          !close(source.matrixWorld, IDENTITY) ||
          !close(source.bindMatrix, IDENTITY)
        )
          throw new AvatarCompatibilityError(
            'Skinned input must be normalized at canonical origin',
          );
        const skinnedSource = source;
        const map = skinnedSource.skeleton.bones.map((bone, i) => {
          const target = sourceBones.indexOf(bone);
          if (
            target < 0 ||
            !close(skinnedSource.skeleton.boneInverses[i]!, skeleton.boneInverses[target]!)
          )
            throw new AvatarCompatibilityError('Canonical inverse bind mismatch');
          return target;
        });
        const joints = source.geometry.getAttribute('skinIndex');
        const weights = source.geometry.getAttribute('skinWeight');
        if (
          !joints ||
          !weights ||
          joints.itemSize !== 4 ||
          weights.itemSize !== 4 ||
          joints.count !== weights.count ||
          joints.count !== source.geometry.getAttribute('position').count
        )
          throw new AvatarCompatibilityError('Expected four normalized skin influences');
        const remapped = new Uint16Array(joints.count * 4);
        for (let vertex = 0; vertex < joints.count; vertex++) {
          let sum = 0;
          for (let axis = 0; axis < 4; axis++) {
            const weight = weights.getComponent(vertex, axis);
            const joint = joints.getComponent(vertex, axis);
            const target = map[joint];
            if (
              !Number.isFinite(weight) ||
              weight < 0 ||
              !Number.isInteger(joint) ||
              target === undefined
            )
              throw new AvatarCompatibilityError('Invalid skin influence');
            sum += weight;
            remapped[vertex * 4 + axis] = target;
          }
          if (Math.abs(sum - 1) > 0.001)
            throw new AvatarCompatibilityError('Skin weights must sum to one');
        }
        let geometry = source.geometry;
        if (map.some((target, i) => target !== i)) {
          geometry = geometry.clone();
          owned.add(geometry);
          geometry.setAttribute('skinIndex', new Uint16BufferAttribute(remapped, 4));
        }
        const skinned = new SkinnedMesh(geometry, source.material);
        skinned.bind(skeleton, source.bindMatrix.clone());
        // Animated bounds must not use the source rest-pose bounding sphere.
        skinned.frustumCulled = false;
        mesh = skinned;
      } else {
        if (source instanceof SkinnedMesh)
          throw new AvatarCompatibilityError('Rigid attachment contains skinned geometry');
        mesh = new Mesh(source.geometry, source.material);
        source.matrixWorld.decompose(mesh.position, mesh.quaternion, mesh.scale);
      }
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      meshes.set(avatarMeshKey(ref), mesh);
      group.add(mesh);
    }
    if (manifest.bodyRegions) {
      const assigned = new Set<string>();
      for (const refs of Object.values(manifest.bodyRegions))
        for (const ref of refs) {
          const key = avatarMeshKey(ref);
          if (!meshes.has(key) || assigned.has(key))
            throw new AvatarCompatibilityError(
              'Body regions must reference distinct declared primitives',
            );
          assigned.add(key);
        }
      if (manifest.kind === 'avatar-body' && assigned.size !== meshes.size)
        throw new AvatarCompatibilityError('Unmapped body mesh');
    }
    if (manifest.attachment.mode !== 'skinned') {
      const attachment = manifest.attachment;
      const socket = attachment.mode === 'socket' ? AVATAR_SOCKETS[attachment.socket] : undefined;
      const bone = attachment.mode === 'bone' ? attachment.bone : socket!.bone;
      group.userData['avatarBone'] = bone;
      if (socket) group.position.fromArray(socket.position);
      if (attachment.transform) {
        group.position.x += attachment.transform.position[0];
        group.position.y += attachment.transform.position[1];
        group.position.z += attachment.transform.position[2];
        group.rotation.fromArray([...attachment.transform.rotation, 'XYZ']);
        group.scale.fromArray(attachment.transform.scale);
      }
      // Parent is assigned only at transaction commit.
      if (!bones[bone]) throw new AvatarCompatibilityError('Missing attachment bone');
    }
    return { group, meshes, dispose };
  } catch (error) {
    dispose();
    throw error;
  }
}
