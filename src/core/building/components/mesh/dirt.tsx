import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { dot, float, floor, fract, length, mix, positionWorld, sin, smoothstep, vec2, vec3, vec4 } from 'three/tsl';
import { MeshStandardNodeMaterial, type Node } from 'three/webgpu';

import { paintCover } from './cover/geometry';
import { SAND, SNOW } from './cover/looks';
import { useCoverMaterial } from './cover/material';
import { getDefaultToonMode, getToonGradient } from '../../../rendering/toon';
import { rendererKind } from '../../../rendering/webgpu';
import { buildDirtCover, COVER_REACH, type CoverSpread } from '../../terrain/dirt';

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

function dirtMaterial(detail: boolean, toon: boolean): THREE.Material {
  const key = `${detail}:${toon}`;
  let material = covers.get(key);
  if (!material) {
    material = toon
      ? new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: getToonGradient(4) })
      : detail ? nodeDirtMaterial() : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
    // The cover fades over the floor: blended, no depth writes, drawn a hair above it.
    Object.assign(material, { transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 });
    material.name = 'dirt-cover';
    covers.set(key, material);
  }
  return material;
}

/**
 * A cover's soft layer over its tiles (`coverSpreads`): packed earth over dirt paths, whose edge wanders onto the
 * neighboring tiles and fades out with rounded corners, and the same fringe of sand or snow around a beach or snowfield.
 * One draw for each cover of a tile group; it receives shadows. On node renderers dirt adds fine grit and pebbles, and
 * sand and snow fringes shade like the cover they spread from.
 */
export function DirtCover({ spread, toon }: { spread: CoverSpread; toon?: boolean | undefined }) {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const useToon = toon ?? getDefaultToonMode();
  const fringe = useCoverMaterial(spread.cover === 'snowfield' ? 'snow' : 'sand', useToon, { fringe: true, enabled: spread.cover !== 'dirt' });
  const { squares, ground, color, accent, cover } = spread;
  const geometry = useMemo(() => {
    // A beach or snowfield fringe takes the paint of its surface, so the two meet without a seam.
    const look = cover === 'sand' ? SAND : cover === 'snowfield' ? SNOW : null;
    const tile = new THREE.Color(color), tint = new THREE.Color(accent);
    return buildDirtCover({
      dirt: squares, ground, color, accent, reach: COVER_REACH[cover],
      ...(look ? { paint: (x: number, z: number, target: THREE.Color) => paintCover(look, x, z, tile, tint, target) } : {}),
    });
  }, [squares, ground, color, accent, cover]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  if (!geometry) return null;
  return (
    <mesh
      name="dirt-cover"
      geometry={geometry}
      material={fringe ?? dirtMaterial(node && spread.cover === 'dirt', useToon)}
      receiveShadow
      raycast={disableRaycast}
      userData={{ nonInteractive: true }}
    />
  );
}
