import { AnimationClip, PropertyBinding } from 'three';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';

import {
  AvatarCompatibilityError,
  HUMANOID_BONES,
  type AvatarManifest,
  type HumanoidBone,
} from '../core/types';

/** Resolve track addresses through the manifest; source node labels carry no humanoid semantics. */
export function bindAvatarAnimationClips(gltf: GLTF, manifest: AvatarManifest): AnimationClip[] {
  const targets = new Map<string, HumanoidBone>();
  gltf.scene.traverse((object) => {
    const index = gltf.parser.associations.get(object)?.nodes;
    const key = HUMANOID_BONES.find((bone) => manifest.bones[bone] === index);
    if (key) {
      targets.set(object.name || object.uuid, key);
      targets.set(object.uuid, key);
    }
  });
  return gltf.animations.map(
    (clip) =>
      new AnimationClip(
        clip.name,
        clip.duration,
        clip.tracks.map((track) => {
          const address = PropertyBinding.parseTrackName(track.name);
          const bone = targets.get(address.nodeName);
          if (
            !bone ||
            !['position', 'quaternion', 'scale'].includes(address.propertyName) ||
            address.objectName ||
            address.propertyIndex
          )
            throw new AvatarCompatibilityError(
              `Unsupported canonical animation target: ${track.name}`,
            );
          const bound = track.clone();
          bound.name = `${bone}.${address.propertyName}`;
          return bound;
        }),
        clip.blendMode,
      ),
  );
}
