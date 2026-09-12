import { useEffect, useMemo, useRef } from 'react';

import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import type { PartsGroupRefProps } from './types';
import { findAttachmentBone, updateBoneAttachmentMatrix } from '../../../character/boneAttachment';
import type { CharacterBoneAttachment } from '../../../character/attachments';
import { logger } from '../../../utils/logger';

type RigidPartRefProps = PartsGroupRefProps & { attachment: CharacterBoneAttachment };

export function RigidPartRef({ url, color, skeleton, attachment }: RigidPartRefProps) {
  const { scene } = useGLTF(url);
  const follower = useRef<THREE.Group>(null);
  const bone = useMemo(() => findAttachmentBone(skeleton, attachment.bone), [skeleton, attachment.bone]);
  const { clone, ownedMaterials, hasSkin } = useMemo(() => {
    // Keep imported node transforms and shared GLTF geometry/textures intact.
    const clone = scene.clone(true);
    const materials = new Map<THREE.Material, THREE.Material>();
    let hasSkin = false;
    const tint = (source: THREE.Material) => {
      const cached = materials.get(source);
      if (cached) return cached;
      const material = source.clone();
      if ('color' in material && material.color instanceof THREE.Color) material.color.set(color!);
      materials.set(source, material);
      return material;
    };
    clone.traverse((node) => {
      if (!(node instanceof THREE.Mesh)) return;
      if (node instanceof THREE.SkinnedMesh) hasSkin = true;
      node.castShadow = true;
      node.receiveShadow = true;
      if (color) node.material = Array.isArray(node.material) ? node.material.map(tint) : tint(node.material);
    });
    return { clone, ownedMaterials: [...materials.values()], hasSkin };
  }, [scene, color]);

  useEffect(() => () => {
    ownedMaterials.forEach((material) => material.dispose());
  }, [ownedMaterials]);

  useEffect(() => {
    if (!bone) logger.warn(`Rigid part ${url}: missing or ambiguous bone "${attachment.bone}".`);
    if (hasSkin) logger.warn(`Rigid part ${url}: skinned meshes require the shared-skeleton garment path.`);
  }, [attachment.bone, bone, hasSkin, url]);

  useFrame(() => {
    if (follower.current && bone && !hasSkin) updateBoneAttachmentMatrix(follower.current, bone);
  });

  if (!bone || hasSkin) return null;
  return (
    <group ref={follower} matrixAutoUpdate={false} dispose={null}>
      <group position={attachment.position}
        {...(attachment.rotation ? { rotation: attachment.rotation } : {})}
        {...(attachment.scale ? { scale: attachment.scale } : {})}>
        <primitive object={clone} dispose={null} />
      </group>
    </group>
  );
}
