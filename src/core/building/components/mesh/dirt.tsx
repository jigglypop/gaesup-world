import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { dot, float, floor, fract, length, mix, positionWorld, sin, smoothstep, vec2, vec3, vec4 } from 'three/tsl';
import { MeshStandardNodeMaterial, type Node } from 'three/webgpu';

import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';
import { rendererKind } from '../../../rendering/webgpu';
import { buildDirtCover, type GroundSquare } from '../../terrain/dirt';

/** Warm packed earth when the tiles name no colors. */
export const DIRT_COLORS = { color: '#dcbb86', accent: '#b98f5c' } as const;

const disableRaycast = () => undefined;
const covers = new Map<string, THREE.Material>();

const gritHash = (p: Node<'vec2'>) => fract(sin(dot(p, vec2(127.1, 311.7))).mul(43758.5453));

/** Packed dirt: vertex color and alpha from the cover, fine grit and a few round pebbles in world space on top. */
function nodeDirtMaterial(): THREE.Material {
  const material = new MeshStandardNodeMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  const ground = positionWorld.xz;
  const fine = ground.mul(6), cell = floor(fine), blend = smoothstep(0, 1, fract(fine));
  const grit = mix(
    mix(gritHash(cell), gritHash(cell.add(vec2(1, 0))), blend.x),
    mix(gritHash(cell.add(vec2(0, 1))), gritHash(cell.add(1)), blend.x),
    blend.y,
  );
  // One jittered dot in a few of the 45 cm cells.
  const coarse = ground.mul(2.2), stone = floor(coarse);
  const spot = vec2(gritHash(stone.add(17)), gritHash(stone.add(29))).mul(0.6).add(0.2);
  const pebble = float(1).sub(smoothstep(0.07, 0.11, length(fract(coarse).sub(spot)))).mul(smoothstep(0.8, 0.83, gritHash(stone.add(41))));
  material.colorNode = vec4(vec3(mix(float(0.955), float(1.03), grit).mul(float(1).sub(pebble.mul(0.16)))), 1);
  return material;
}

function dirtMaterial(node: boolean, toon: boolean): THREE.Material {
  const key = `${node}:${toon}`;
  let material = covers.get(key);
  if (!material) {
    material = toon
      ? new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: getToonGradient(4) })
      : node ? nodeDirtMaterial() : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    // The cover fades over the floor: blended, no depth writes, drawn a hair above it.
    Object.assign(material, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    material.name = 'dirt-cover';
    covers.set(key, material);
  }
  return material;
}

/**
 * Dirt path tiles (`objectType: 'dirt'`) drawn as one soft cover over their floor: packed earth whose edge wanders onto
 * the neighboring tiles and fades out, with rounded corners. One draw for a tile group; it receives shadows.
 */
export function DirtCover({ dirt, ground, color, accent, toon }: {
  dirt: readonly GroundSquare[];
  ground: readonly GroundSquare[];
  color?: string | undefined;
  accent?: string | undefined;
  toon?: boolean | undefined;
}) {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const geometry = useMemo(
    () => buildDirtCover({ dirt, ground, color: color ?? DIRT_COLORS.color, accent: accent ?? DIRT_COLORS.accent }),
    [dirt, ground, color, accent],
  );
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;
  return (
    <mesh
      name="dirt-cover"
      geometry={geometry}
      material={dirtMaterial(node, toon ?? getDefaultToonMode())}
      receiveShadow
      raycast={disableRaycast}
      userData={{ nonInteractive: true }}
    />
  );
}
