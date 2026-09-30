import { useEffect, useMemo, useRef, useState } from 'react';

import { useThree } from '@react-three/fiber';
import type * as THREE from 'three';

import { DEFAULT_WORLD_GI_ENVIRONMENT, environmentChanged, readSceneLight, receivesWorldGi } from './sceneLight';
import type { WorldGiProps } from './types';
import { useEngineFrame } from '../../../runtime/frame';
import { useBuildingVoxelBoxes } from '../../hooks/useBuildingVoxelBoxes';
import { useGi } from '../../hooks/useGi';
import type { GiEnvironment } from '../../types';
import { GiVolume } from '../GiVolume';

/** Scene lights and new meshes are looked at twice a second, not every frame. */
const SCAN_INTERVAL_MS = 500;
/** A whole island's probes are a large upload; five times a second is smooth enough for light that settles slowly. */
const WORLD_UPLOAD_INTERVAL_MS = 200;

function materialsOf(mesh: THREE.Mesh): THREE.Material[] {
  return Array.isArray(mesh.material) ? mesh.material : [mesh.material];
}

/** Gives every receiving surface in the scene the probe irradiance, as meshes come and go. */
function SceneGiBinder({ intensity, receives }: { intensity: number; receives: WorldGiProps['receives'] | undefined }) {
  const gi = useGi();
  const scene = useThree((state) => state.scene);
  const receivesRef = useRef(receives);
  receivesRef.current = receives;

  useEffect(() => {
    gi?.setIntensity(intensity);
  }, [gi, intensity]);

  useEngineFrame(
    'effects',
    () => {
      if (!gi) return;
      const accepts = receivesRef.current;
      scene.traverse((object) => {
        const mesh = object as THREE.Mesh;
        if (!mesh.isMesh) return;
        for (const material of materialsOf(mesh)) {
          if (receivesWorldGi(mesh, material) && (!accepts || accepts(mesh, material))) gi.applyToMaterial(material);
        }
      });
    },
    { throttleMs: SCAN_INTERVAL_MS, label: 'world-gi-bind' },
  );
  return null;
}

/**
 * Dynamic global illumination for a gaesup world: the building store becomes the voxel scene, the scene's own sun and
 * sky light the probes, and every opaque standard material receives the indirect light. Mount it inside the world's
 * Canvas (for example under `GaesupWorldContent`). With it on, a flat ambient or hemisphere light counts the sky twice;
 * turn those down. WebGPU renderers only; elsewhere the scene renders without it.
 */
export function WorldGi({
  environment,
  intensity = 1,
  receives,
  uploadIntervalMs = WORLD_UPLOAD_INTERVAL_MS,
  ...volume
}: WorldGiProps) {
  const boxes = useBuildingVoxelBoxes();
  const scene = useThree((state) => state.scene);
  const [sceneLight, setSceneLight] = useState<GiEnvironment>(DEFAULT_WORLD_GI_ENVIRONMENT);
  const latest = useRef(sceneLight);

  useEngineFrame(
    'effects',
    () => {
      const next = readSceneLight(scene);
      if (!environmentChanged(latest.current, next)) return;
      latest.current = next;
      setSceneLight(next);
    },
    { throttleMs: SCAN_INTERVAL_MS, label: 'world-gi-light' },
  );

  const overrides = JSON.stringify(environment ?? {});
  const merged = useMemo<GiEnvironment>(
    () => ({ ...sceneLight, ...(JSON.parse(overrides) as Partial<GiEnvironment>) }),
    [sceneLight, overrides],
  );

  return (
    <GiVolume boxes={boxes} environment={merged} uploadIntervalMs={uploadIntervalMs} {...volume}>
      <SceneGiBinder intensity={intensity} receives={receives} />
    </GiVolume>
  );
}

export type { WorldGiProps } from './types';
