import { useEffect, useLayoutEffect, useMemo, useRef, type RefObject } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { sceneLighting } from './zones';
import { useEngineFrame } from '../../runtime/frame';

type Caster = { object: THREE.Object3D; radius: number; ground: number; lastY: number; still: number };

/** Every registered caster; each `ContactShadows` draws the ones in its own scene. */
const casters = new Set<Caster>();

const sceneOf = (object: THREE.Object3D) => {
  let root = object;
  while (root.parent) root = root.parent;
  return root;
};

/** Seconds a caster must hold its height before that height counts as its ground: a jump's apex is shorter. */
const SETTLE_SECONDS = 0.15;
/** Meters above its ground at which a caster's shadow has shrunk away. */
const FADE_HEIGHT = 2.5;

/**
 * Gives the object at `ref` a contact shadow while `ContactShadows` is in the scene. The object's origin is its feet,
 * as a character's visual root is.
 */
export function useContactShadow(ref: RefObject<THREE.Object3D | null>, radius = 0.45): void {
  useLayoutEffect(() => {
    const object = ref.current;
    if (!object) return undefined;
    const caster: Caster = { object, radius, ground: Number.NaN, lastY: Number.NaN, still: 0 };
    casters.add(caster);
    return () => {
      casters.delete(caster);
    };
  }, [radius, ref]);
}

function blobTexture(): THREE.DataTexture {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = Math.hypot((x + 0.5) / size - 0.5, (y + 0.5) / size - 0.5) * 2;
      const t = Math.min(1, Math.max(0, 1 - r));
      const index = (y * size + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = 255;
      data[index + 3] = Math.round(255 * t * t * (3 - 2 * t));
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export type ContactShadowsProps = {
  /** Most shadows drawn, nearest the camera first. */
  max?: number;
  opacity?: number;
  /**
   * Draw them everywhere, as where no shadow map is drawn at all. By default they show in step with a
   * `LightingZone`: indoors, where the sun's shadows fade with its light.
   */
  always?: boolean;
};

/**
 * Soft round shadows under the characters that `useContactShadow` registers (the player and residents): one instanced
 * draw, shrinking as a character leaves the ground. Nothing draws while they are faded out.
 */
export function ContactShadows({ max = 32, opacity = 0.34, always = false }: ContactShadowsProps) {
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { geometry, material } = useMemo(() => ({
    geometry: new THREE.CircleGeometry(1, 24).rotateX(-Math.PI / 2),
    material: new THREE.MeshBasicMaterial({
      name: 'contact-shadow', color: '#0b0f14', map: blobTexture(), transparent: true, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    }),
  }), []);
  useEffect(() => () => {
    geometry.dispose();
    material.map?.dispose();
    material.dispose();
  }, [geometry, material]);
  const scratch = useMemo(() => ({ matrix: new THREE.Matrix4(), position: new THREE.Vector3(), scale: new THREE.Vector3(), rotation: new THREE.Quaternion(), order: [] as Caster[] }), []);

  useEngineFrame('effects', (delta) => {
    const target = mesh.current;
    if (!target) return;
    const strength = always ? 1 : sceneLighting(scene).blend();
    target.visible = strength > 0.001;
    if (!target.visible) return;
    material.opacity = opacity * strength;
    const order = scratch.order;
    order.length = 0;
    for (const caster of casters) {
      if (!caster.object.visible || sceneOf(caster.object) !== scene) continue;
      caster.object.getWorldPosition(scratch.position);
      const y = scratch.position.y;
      caster.still = Math.abs(y - caster.lastY) < 0.004 ? caster.still + delta : 0;
      caster.lastY = y;
      if (Number.isNaN(caster.ground) || y < caster.ground || caster.still > SETTLE_SECONDS) caster.ground = y;
      order.push(caster);
    }
    if (order.length > max) {
      const eye = camera.position;
      const distance = (caster: Caster) => caster.object.getWorldPosition(scratch.position).distanceToSquared(eye);
      order.sort((a, b) => distance(a) - distance(b));
    }
    const count = Math.min(order.length, max);
    for (let index = 0; index < count; index++) {
      const caster = order[index]!;
      caster.object.getWorldPosition(scratch.position);
      const shrink = Math.max(0, 1 - Math.max(0, scratch.position.y - caster.ground) / FADE_HEIGHT);
      scratch.position.y = caster.ground + 0.02;
      scratch.scale.set(caster.radius * shrink, 1, caster.radius * shrink);
      target.setMatrixAt(index, scratch.matrix.compose(scratch.position, scratch.rotation, scratch.scale));
    }
    target.count = count;
    target.instanceMatrix.needsUpdate = true;
  }, { label: 'lighting:contact-shadows' });

  return <instancedMesh ref={mesh} args={[geometry, material, max]} frustumCulled={false} renderOrder={1} visible={false} />;
}
