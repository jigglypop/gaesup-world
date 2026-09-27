import { AnimationClip, Box3, type Mesh, type Object3D, type SkinnedMesh } from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { applyClipPose, findClipKey, holdUnkeyedTracks, makeClipInPlace } from '../../../animation/core/clips';
import { normalizeImportedMaterials, type ImportedMaterialPolicy } from '../../../assets/materialPolicy';

/** Clips an NPC walks or runs with; their root motion is removed, since the simulation moves the NPC. */
const MOVE_CLIP = /walk|run|jog|sprint/i;

/** An NPC model's clips, prepared once per loaded model, and the ground speed each move clip was authored at. */
export type NPCClips = { clips: AnimationClip[]; groundSpeed: ReadonlyMap<string, number> };

const preparedClips = new WeakMap<readonly AnimationClip[], NPCClips>();
const measured = new WeakMap<Object3D, { bottom: number; height: number }>();

export function findClip(clips: readonly AnimationClip[], name: string): AnimationClip | undefined {
  const key = findClipKey(clips.map((clip) => clip.name), name);
  return key === undefined ? undefined : clips.find((clip) => clip.name === key);
}

/**
 * Copies of the model's clips that never show the rest pose: move clips play in place, and every clip holds the bones
 * it leaves unkeyed at the idle's first frame (a model without an idle, at its walk's). Other users of the model keep
 * its clips as authored.
 */
export function prepareNPCClips(scene: Object3D, animations: readonly AnimationClip[]): NPCClips {
  let prepared = preparedClips.get(animations);
  if (!prepared) {
    const clips = animations.map((clip) => {
      const copy = new AnimationClip(clip.name, clip.duration, clip.tracks.slice(), clip.blendMode);
      copy.userData = { ...clip.userData };
      return copy;
    });
    const groundSpeed = new Map<string, number>();
    for (const clip of clips) if (MOVE_CLIP.test(clip.name)) groundSpeed.set(clip.name, makeClipInPlace(scene, clip));
    holdUnkeyedTracks(scene, clips, { pose: findClip(clips, 'idle') ? 'idle' : 'walk' });
    prepared = { clips, groundSpeed };
    preparedClips.set(animations, prepared);
  }
  return prepared;
}

/** Frees what the renderer holds for a clone (render objects, bone textures); geometry and materials stay with the source. */
export function disposeNPCFigure(root: Object3D): void {
  const skeletons = new Set<SkinnedMesh['skeleton']>();
  root.traverse((object) => {
    if ((object as SkinnedMesh).isSkinnedMesh) skeletons.add((object as SkinnedMesh).skeleton);
  });
  skeletons.forEach((skeleton) => skeleton.dispose());
  root.traverse((object) => object.dispose());
}

/**
 * The NPC's own copy of a model with its materials adjusted by `policy`. Its meshes are never culled one by one: skinned
 * bounds stay in the bind pose, so the NPC system culls the whole figure by its pose instead.
 */
export function cloneNPCFigure(scene: Object3D, policy: ImportedMaterialPolicy): Object3D {
  const figure = SkeletonUtils.clone(scene);
  normalizeImportedMaterials(figure, policy);
  figure.traverse((object) => {
    if ((object as Mesh).isMesh) object.frustumCulled = false;
  });
  return figure;
}

/** Scale and lift that draw the model `height` tall with its lowest point on the ground, measured once per model. */
export function fitNPCFigure(scene: Object3D, clips: readonly AnimationClip[], height: number): { scale: number; y: number } {
  let extent = measured.get(scene);
  if (!extent) {
    const model = SkeletonUtils.clone(scene);
    const idle = findClip(clips, 'idle');
    if (idle) applyClipPose(model, idle);
    else model.updateMatrixWorld(true);
    const box = new Box3().setFromObject(model, true);
    extent = box.isEmpty() ? { bottom: 0, height: 0 } : { bottom: box.min.y, height: box.max.y - box.min.y };
    disposeNPCFigure(model);
    measured.set(scene, extent);
  }
  const scale = extent.height > 1e-6 ? height / extent.height : 1;
  return { scale, y: -extent.bottom * scale };
}
