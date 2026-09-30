import { useEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

export type SkyEnvironmentProps = {
  /** Color straight up. */
  sky?: THREE.ColorRepresentation;
  /** Color at the horizon, the brightest band. */
  horizon?: THREE.ColorRepresentation;
  /** Color below the horizon, as bounced light from the ground. */
  ground?: THREE.ColorRepresentation;
  /** `scene.environmentIntensity`: how strongly every PBR material picks up this light. */
  intensity?: number;
};

const WIDTH = 64;
const HEIGHT = 32;

/** A tiny equirectangular sky gradient; both renderers prefilter it for image-based lighting on their own. */
export function createSkyEnvironmentTexture(
  sky: THREE.ColorRepresentation,
  horizon: THREE.ColorRepresentation,
  ground: THREE.ColorRepresentation,
): THREE.DataTexture {
  const top = new THREE.Color(sky);
  const middle = new THREE.Color(horizon);
  const bottom = new THREE.Color(ground);
  const row = new THREE.Color();
  const data = new Float32Array(WIDTH * HEIGHT * 4);
  for (let y = 0; y < HEIGHT; y++) {
    // Rows run bottom to top; `elevation` is the sine of the angle above the horizon.
    const elevation = Math.sin(((y + 0.5) / HEIGHT - 0.5) * Math.PI);
    if (elevation >= 0) row.copy(middle).lerp(top, THREE.MathUtils.smoothstep(elevation, 0, 0.7));
    else row.copy(middle).lerp(bottom, THREE.MathUtils.smoothstep(-elevation, 0, 0.25));
    for (let x = 0; x < WIDTH; x++) {
      const i = (y * WIDTH + x) * 4;
      data[i] = row.r;
      data[i + 1] = row.g;
      data[i + 2] = row.b;
      data[i + 3] = 1;
    }
  }
  const texture = new THREE.DataTexture(data, WIDTH, HEIGHT, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.LinearSRGBColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

/**
 * Soft daylight from every direction as `scene.environment`. PBR materials get sky-colored fill and reflections, so
 * shaded sides keep their color instead of falling to the ambient term alone.
 */
export function SkyEnvironment({ sky = '#bfe2ff', horizon = '#f3f9ff', ground = '#6f8a57', intensity = 0.35 }: SkyEnvironmentProps) {
  const scene = useThree((state) => state.scene);
  const skyKey = new THREE.Color(sky).getHex();
  const horizonKey = new THREE.Color(horizon).getHex();
  const groundKey = new THREE.Color(ground).getHex();
  const texture = useMemo(() => createSkyEnvironmentTexture(skyKey, horizonKey, groundKey), [skyKey, horizonKey, groundKey]);

  useEffect(() => {
    const previous = scene.environment;
    scene.environment = texture;
    return () => {
      if (scene.environment === texture) scene.environment = previous;
      texture.dispose();
    };
  }, [scene, texture]);

  useEffect(() => {
    const previous = scene.environmentIntensity;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environmentIntensity = previous;
    };
  }, [scene, intensity]);

  return null;
}
