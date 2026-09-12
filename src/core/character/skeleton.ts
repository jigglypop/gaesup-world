import * as THREE from 'three';

import { logger } from '../utils/logger';

/**
 * Canonical humanoid skeleton contract.
 *
 * Wearable GLBs may ship their own armature for authoring convenience, but at
 * runtime every SkinnedMesh of a character must share the character's single
 * skeleton. Sharing is only safe when the wearable's joint indices agree with
 * the target skeleton — bone *names* matching is not enough, because glTF
 * JOINTS_0 stores indices, not names. These helpers validate compatibility and
 * remap joint indices when the same bones appear in a different order.
 */
export const GAESUP_SKELETON_ID = 'gaesup-humanoid-v1';

/**
 * Recommended naming vocabulary for base-model body nodes. `hideBodyRegions`
 * matches base-model node names literally — there is no region→node mapping
 * layer — so base meshes should name their nodes from this list for wearable
 * masks to work out of the box.
 */
export const BODY_REGIONS = [
  'head',
  'neck',
  'torso_upper',
  'torso_lower',
  'arm_upper_left',
  'arm_lower_left',
  'arm_upper_right',
  'arm_lower_right',
  'pelvis',
  'leg_upper_left',
  'leg_lower_left',
  'leg_upper_right',
  'leg_lower_right',
  'feet',
] as const;

export type BodyRegion = (typeof BODY_REGIONS)[number];

/** How a wearable deforms with the character. */
export type WearableDeformation =
  /** Attached to a single bone/socket (glasses, hat, sword). No skinning. */
  | 'rigid'
  /** SkinnedMesh bound to the shared character skeleton (shirt, pants). */
  | 'skinned'
  /** Skinned + garment-only secondary bones driven after animation (skirt, coat, hair). */
  | 'secondary';

/**
 * Wearable asset metadata contract (stored in `AssetRecord.metadata`).
 * Produced by the asset pipeline; consumed by the runtime wearable system.
 */
export type WearableMetadata = {
  /** Skeleton contract id the asset was rigged against, e.g. 'gaesup-humanoid-v1'. */
  skeleton?: string;
  deformation?: WearableDeformation;
  /** Bind pose fingerprint from `getBindPoseHash` — mismatch means the garment will deform wrong. */
  bindPoseHash?: string;
  /**
   * Base-model node names hidden while this wearable is equipped. Matched
   * literally against glTF node names — name base-model nodes after
   * BODY_REGIONS so wearables can target them portably.
   */
  hideBodyRegions?: string[];
};

export type SkeletonCompatibility =
  /** Same bones in the same order — the target skeleton can be shared as-is. */
  | 'identical'
  /** Same bone names in a different order — share after `remapSkinnedGeometryJoints`. */
  | 'remappable'
  /** Bones missing or duplicated — sharing would corrupt the deformation. */
  | 'incompatible';

export type SkeletonCompatibilityReport = {
  compatibility: SkeletonCompatibility;
  /** Bones the wearable references that the target skeleton does not have. */
  missingBones: string[];
  /** Same name but different rest transforms cannot share inverse bind matrices. */
  bindPoseMismatches?: string[];
};

export function getSkeletonBoneNames(skeleton: THREE.Skeleton): string[] {
  return skeleton.bones.map((bone) => bone.name);
}

/**
 * Stable fingerprint of a skeleton's bind pose (bone inverse matrices).
 * Two assets rigged against the same rest pose produce the same hash.
 */
export function getBindPoseHash(skeleton: THREE.Skeleton): string {
  let hash = 0x811c9dc5;
  const mix = (value: number) => {
    // Quantize to survive float noise between exporters.
    const quantized = Math.round(value * 10000);
    hash ^= quantized & 0xff;
    hash = Math.imul(hash, 0x01000193);
    hash ^= (quantized >> 8) & 0xff;
    hash = Math.imul(hash, 0x01000193);
  };
  for (const inverse of skeleton.boneInverses) {
    for (const element of inverse.elements) {
      mix(element);
    }
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function compareSkeletons(
  source: THREE.Skeleton,
  target: THREE.Skeleton,
): SkeletonCompatibilityReport {
  const sourceNames = getSkeletonBoneNames(source);
  const targetNames = getSkeletonBoneNames(target);
  const targetSet = new Set(targetNames);
  const hasDuplicates =
    targetSet.size !== targetNames.length || new Set(sourceNames).size !== sourceNames.length;
  const missingBones = sourceNames.filter((name) => !targetSet.has(name));
  if (hasDuplicates || missingBones.length > 0 || sourceNames.length === 0 ||
    sourceNames.some((name) => !name.trim()) || targetNames.some((name) => !name.trim())) {
    return { compatibility: 'incompatible', missingBones };
  }
  const targetIndex = new Map(targetNames.map((name, index) => [name, index]));
  const bindPoseMismatches = sourceNames.filter((name, index) => {
    const sourceInverse = source.boneInverses[index];
    const targetInverse = target.boneInverses[targetIndex.get(name)!];
    if (!sourceInverse || !targetInverse) return true;
    return sourceInverse.elements.some((value, element) => {
      const other = targetInverse.elements[element]!;
      return !Number.isFinite(value) || !Number.isFinite(other) || Math.abs(value - other) > 1e-4;
    });
  });
  if (bindPoseMismatches.length > 0) {
    return { compatibility: 'incompatible', missingBones, bindPoseMismatches };
  }
  const identical = sourceNames.length === targetNames.length &&
    sourceNames.every((name, index) => name === targetNames[index]);
  return { compatibility: identical ? 'identical' : 'remappable', missingBones };
}

/**
 * Rewrite a skinned geometry's JOINTS_0 (skinIndex) from `source` bone order to
 * `target` bone order. Returns a cloned geometry — the caller owns disposal.
 * Only valid when `compareSkeletons(source, target)` is 'remappable'.
 */
export function remapSkinnedGeometryJoints(
  geometry: THREE.BufferGeometry,
  source: THREE.Skeleton,
  target: THREE.Skeleton,
): THREE.BufferGeometry {
  if (compareSkeletons(source, target).compatibility === 'incompatible') {
    throw new Error('Cannot remap geometry between incompatible skeletons.');
  }
  if (target.bones.length > 65536) throw new Error('Target skeleton exceeds the supported joint index range.');
  const targetIndexByName = new Map<string, number>();
  target.bones.forEach((bone, index) => targetIndexByName.set(bone.name, index));

  const indexMap = source.bones.map((bone) => targetIndexByName.get(bone.name)!);
  const skinIndex = geometry.getAttribute('skinIndex');
  if (skinIndex) {
    for (let i = 0; i < skinIndex.count; i += 1) {
      for (let c = 0; c < skinIndex.itemSize; c += 1) {
        const original = skinIndex.getComponent(i, c);
        if (!Number.isInteger(original) || indexMap[original] === undefined) {
          throw new Error(`Invalid skin joint index ${original}; re-export the wearable.`);
        }
      }
    }
  }
  const remapped = geometry.clone();
  // A small source rig may use Uint8 indices but map into a target with >255
  // joints. Widen the output instead of silently wrapping indices.
  if (skinIndex) {
    const indices = new Uint16Array(skinIndex.count * skinIndex.itemSize);
    for (let i = 0; i < skinIndex.count; i += 1) {
      for (let c = 0; c < skinIndex.itemSize; c += 1) {
        indices[i * skinIndex.itemSize + c] = indexMap[skinIndex.getComponent(i, c)]!;
      }
    }
    remapped.setAttribute('skinIndex', new THREE.BufferAttribute(indices, skinIndex.itemSize));
  }
  return remapped;
}

export type SharedSkeletonBinding = {
  geometry: THREE.BufferGeometry;
  skeleton: THREE.Skeleton;
  /** True when `geometry` is a remapped clone the caller must dispose. */
  ownsGeometry: boolean;
  compatibility: SkeletonCompatibility;
};

const warnedIncompatible = new Set<string>();

/**
 * Decide how a wearable SkinnedMesh binds to the character's shared skeleton.
 * - identical: share the target skeleton directly.
 * - remappable: share it with a joint-remapped geometry clone.
 * - incompatible: keep the mesh's own skeleton with a one-time dev warning.
 *   Its bones are not in the scene graph, so the garment renders frozen in
 *   bind pose — visible breakage that points at an asset pipeline bug to fix
 *   upstream, instead of silently corrupted deformation.
 */
export function resolveSharedSkeletonBinding(
  mesh: THREE.SkinnedMesh,
  target: THREE.Skeleton | null | undefined,
  label?: string,
): SharedSkeletonBinding {
  if (!target || mesh.skeleton === target) {
    return {
      geometry: mesh.geometry,
      skeleton: target ?? mesh.skeleton,
      ownsGeometry: false,
      compatibility: 'identical',
    };
  }

  const report = compareSkeletons(mesh.skeleton, target);
  if (report.compatibility === 'identical') {
    return { geometry: mesh.geometry, skeleton: target, ownsGeometry: false, compatibility: 'identical' };
  }
  if (report.compatibility === 'remappable') {
    return {
      geometry: remapSkinnedGeometryJoints(mesh.geometry, mesh.skeleton, target),
      skeleton: target,
      ownsGeometry: true,
      compatibility: 'remappable',
    };
  }

  const key = `${label ?? ''}:${mesh.name}`;
  if (!warnedIncompatible.has(key)) {
    warnedIncompatible.add(key);
    logger.warn(
      `[gaesup] wearable "${mesh.name}" skeleton is incompatible with the character skeleton ` +
        `(missing bones: ${report.missingBones.join(', ') || 'none'}; ` +
        `rest-pose mismatches: ${report.bindPoseMismatches?.join(', ') || 'none'}; ` +
        `bone names must be unique and nonempty). ` +
        `It will render frozen in bind pose; re-export the asset against ${GAESUP_SKELETON_ID}.`,
    );
  }
  return {
    geometry: mesh.geometry,
    skeleton: mesh.skeleton,
    ownsGeometry: false,
    compatibility: 'incompatible',
  };
}
