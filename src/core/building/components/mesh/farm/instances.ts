import * as THREE from 'three';

import { plantHeight, plantTemplate, type PlantKind } from './crops';
import type { PlantLayout } from '../../../terrain/farm/layout';
import type { FarmStage } from '../../../types';

/** Room around the roots for leaves, lean and gusts (m). */
const REACH = 0.6;
const TEMPLATE_ATTRIBUTES = ['position', 'normal', 'color', 'farmPlant'] as const;

export type PlantMesh = {
  mesh: THREE.InstancedMesh;
  /** Near and far geometries; both carry the layout's instance attributes. */
  tiers: [THREE.BufferGeometry, THREE.BufferGeometry];
  /** World box around every plant. */
  box: THREE.Box3;
  dispose: () => void;
};

/** A tier's geometry: its own copy of the template buffers, so disposing one chunk never drops another's GPU data. */
function tierGeometry(template: THREE.BufferGeometry, root: THREE.InstancedBufferAttribute, tint: THREE.InstancedBufferAttribute): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  for (const name of TEMPLATE_ATTRIBUTES) geometry.setAttribute(name, template.getAttribute(name).clone());
  geometry.setIndex(template.index!.clone());
  geometry.setAttribute('farmRoot', root);
  geometry.setAttribute('farmTint', tint);
  geometry.boundingSphere = template.boundingSphere!.clone();
  return geometry;
}

/**
 * One instanced mesh for a chunk's plants, sorted by draw rank: setting `count` draws an evenly spread prefix. Each
 * instance stands at its root, turned by its yaw and scaled; the root and rank also go to the shader, which sways and
 * thins the plants.
 */
export function createPlantMesh(layout: PlantLayout, kind: PlantKind, stage: FarmStage, material: THREE.Material): PlantMesh {
  const root = new THREE.InstancedBufferAttribute(layout.roots, 4);
  const tint = new THREE.InstancedBufferAttribute(layout.tints, 4);
  const tiers: [THREE.BufferGeometry, THREE.BufferGeometry] = [
    tierGeometry(plantTemplate(kind, stage, 0), root, tint),
    tierGeometry(plantTemplate(kind, stage, 1), root, tint),
  ];
  const mesh = new THREE.InstancedMesh(tiers[0], material, layout.count);
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), turn = new THREE.Quaternion(), scale = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0), box = new THREE.Box3();
  const top = plantHeight(kind, stage) * 1.2 + REACH;
  for (let i = 0; i < layout.count; i++) {
    position.fromArray(layout.roots, i * 4);
    turn.setFromAxisAngle(up, layout.turns[i * 2]!);
    scale.setScalar(layout.turns[i * 2 + 1]!);
    mesh.setMatrixAt(i, matrix.compose(position, turn, scale));
    box.expandByPoint(position);
  }
  box.min.add(new THREE.Vector3(-REACH, -0.1, -REACH));
  box.max.add(new THREE.Vector3(REACH, top, REACH));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.boundingBox = box.clone();
  mesh.boundingSphere = box.getBoundingSphere(new THREE.Sphere());
  mesh.name = `farm-${kind}`;
  return {
    mesh, tiers, box,
    dispose: () => {
      for (const geometry of tiers) geometry.dispose();
      mesh.dispose();
    },
  };
}
