import * as THREE from 'three';

import type { GiEnvironment, Rgb } from '../../types';

/** A clear daytime sky, used when the scene has no sun or sky light to read. */
export const DEFAULT_WORLD_GI_ENVIRONMENT: GiEnvironment = {
  sunDirection: { x: 0.45, y: 0.75, z: 0.48 },
  sunIrradiance: [2.6, 2.45, 2.2],
  skyZenith: [0.35, 0.55, 0.95],
  skyHorizon: [0.75, 0.8, 0.85],
  skyGround: [0.18, 0.16, 0.14],
};

const HORIZON_GROUND_SHARE = 0.35;
const scratchDirection = new THREE.Vector3();

function scaled(color: THREE.Color, intensity: number): Rgb {
  return [color.r * intensity, color.g * intensity, color.b * intensity];
}

function blend(a: Rgb, b: Rgb, share: number): Rgb {
  return [a[0] + (b[0] - a[0]) * share, a[1] + (b[1] - a[1]) * share, a[2] + (b[2] - a[2]) * share];
}

/**
 * The sun and sky the scene itself is lit with: the first shadow-casting directional light (or the first directional
 * light) is the sun, pointing from its target towards it; the first hemisphere light is the sky. Missing parts keep
 * `fallback`. Light colours are already linear in three.js, so they go through as they are.
 */
export function readSceneLight(scene: THREE.Object3D, fallback: GiEnvironment = DEFAULT_WORLD_GI_ENVIRONMENT): GiEnvironment {
  let sun: THREE.DirectionalLight | null = null;
  let sky: THREE.HemisphereLight | null = null;
  scene.traverseVisible((object) => {
    if ((object as THREE.DirectionalLight).isDirectionalLight) {
      const light = object as THREE.DirectionalLight;
      if (!sun || (light.castShadow && !sun.castShadow)) sun = light;
    } else if (!sky && (object as THREE.HemisphereLight).isHemisphereLight) {
      sky = object as THREE.HemisphereLight;
    }
  });
  let environment = fallback;
  const foundSun = sun as THREE.DirectionalLight | null;
  if (foundSun && foundSun.intensity > 0) {
    foundSun.updateMatrixWorld();
    foundSun.target.updateMatrixWorld();
    const direction = scratchDirection
      .setFromMatrixPosition(foundSun.matrixWorld)
      .sub(new THREE.Vector3().setFromMatrixPosition(foundSun.target.matrixWorld));
    if (direction.lengthSq() > 0) {
      direction.normalize();
      environment = {
        ...environment,
        sunDirection: { x: direction.x, y: direction.y, z: direction.z },
        sunIrradiance: scaled(foundSun.color, foundSun.intensity),
      };
    }
  }
  const foundSky = sky as THREE.HemisphereLight | null;
  if (foundSky && foundSky.intensity > 0) {
    const zenith = scaled(foundSky.color, foundSky.intensity);
    const ground = scaled(foundSky.groundColor, foundSky.intensity);
    environment = { ...environment, skyZenith: zenith, skyGround: ground, skyHorizon: blend(zenith, ground, HORIZON_GROUND_SHARE) };
  }
  return environment;
}

/** Whether two environments light the probes differently enough to be worth passing on (1% of a channel). */
export function environmentChanged(a: GiEnvironment, b: GiEnvironment, epsilon = 0.01): boolean {
  const vectors = [
    [a.sunDirection.x, b.sunDirection.x],
    [a.sunDirection.y, b.sunDirection.y],
    [a.sunDirection.z, b.sunDirection.z],
  ];
  const colors = [
    [a.sunIrradiance, b.sunIrradiance],
    [a.skyZenith, b.skyZenith],
    [a.skyHorizon, b.skyHorizon],
    [a.skyGround, b.skyGround],
  ] as const;
  return (
    vectors.some(([left, right]) => Math.abs((left ?? 0) - (right ?? 0)) > epsilon) ||
    colors.some(([left, right]) => left.some((value, channel) => Math.abs(value - (right[channel] ?? 0)) > epsilon))
  );
}

type LitMaterial = THREE.Material & { isMeshStandardMaterial?: boolean; isMeshStandardNodeMaterial?: boolean };

/**
 * Materials that take indirect light: opaque standard (PBR) materials, classic or node, unless the material or its
 * mesh sets `userData.gi = false`. Transparent surfaces, unlit and custom shader materials are left alone.
 */
export function receivesWorldGi(mesh: THREE.Mesh, material: THREE.Material): boolean {
  const lit = material as LitMaterial;
  if (!lit.isMeshStandardMaterial && !lit.isMeshStandardNodeMaterial) return false;
  if (material.transparent || material.userData?.['gi'] === false || mesh.userData?.['gi'] === false) return false;
  return true;
}
