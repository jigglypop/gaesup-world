import { memo, useEffect, useLayoutEffect, useMemo } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import type { PlantKind } from './crops';
import { createPlantMesh } from './instances';
import { farmCropMaterial } from './materials';
import { CompileGate } from '../../../../rendering/CompileGate';
import { castNearShadowOnly } from '../../../../rendering/sky/nearShadow';
import { GRASS_FADE_BAND } from '../../../../rendering/tsl/grassMaterial';
import { rendererKind } from '../../../../rendering/webgpu';
import { CROP_LOD, isTallCrop, plantDraw } from '../../../terrain/farm/config';
import { cropLayout, weedLayout, type FarmChunk } from '../../../terrain/farm/layout';
import type { FarmStage } from '../../../types';
import type { GrassTileRenderState } from '../grass/manager';
import { useGrassManager } from '../grass/useGrassManager';

/** Plants never stop the camera or other ray probes. */
const PLANT_USER_DATA = { intangible: true, nonInteractive: true };
const disableRaycast = () => undefined;

type Props = { chunk: FarmChunk; kind: PlantKind; stage: FarmStage; toon: boolean };

/**
 * One crop at one stage, or the weeds, of a chunk's beds as one instanced mesh. The grass manager's frame tick culls
 * it and hands it the wind; each frame it draws the distance share of its plants with the near or far tier, and on
 * node renderers the shader shrinks the last of them away. Tall crops cast shadows into the nearest cascade.
 */
export const FarmPlants = memo(function FarmPlants({ chunk, kind, stage, toon }: Props) {
  const node = rendererKind(useThree((state) => state.gl)) !== 'webgl';
  const get = useThree((state) => state.get);
  const manager = useGrassManager();
  const tall = kind !== 'weed' && stage !== 'sprout' && isTallCrop(kind);
  const crop = farmCropMaterial(node, toon, tall ? 'tall' : 'low');
  const layout = useMemo(() => (kind === 'weed' ? weedLayout(chunk.squares) : cropLayout(chunk.squares)), [chunk, kind]);
  const plants = useMemo(
    () => (layout.count ? createPlantMesh(layout, kind, stage, crop.material) : null),
    [layout, kind, stage, crop.material],
  );
  useEffect(() => () => plants?.dispose(), [plants]);
  // Stalks are finer than a far cascade's texels: only the nearest cascade draws their shadows.
  useLayoutEffect(() => (plants && tall ? castNearShadowOnly(plants.mesh) : undefined), [plants, tall]);

  useLayoutEffect(() => {
    if (!plants) return undefined;
    const { mesh, tiers, box } = plants, total = layout.count, eye = new THREE.Vector3();
    const size = box.getSize(new THREE.Vector3());
    const cull = CROP_LOD[tall ? 'tall' : 'low'].far + Math.hypot(size.x, size.z) / 2;
    const apply = (state: GrassTileRenderState) => {
      const distance = box.distanceToPoint(eye.setFromMatrixPosition(get().camera.matrixWorld));
      const draw = state.visible ? plantDraw(total, distance, tall, node ? GRASS_FADE_BAND : 0) : { count: 0, tier: 1 as const };
      mesh.visible = draw.count > 0;
      mesh.count = draw.count;
      if (mesh.geometry !== tiers[draw.tier]) mesh.geometry = tiers[draw.tier];
      if (crop.uniforms) {
        crop.uniforms.time.value = state.time;
        crop.uniforms.wind.value = state.windScale;
      }
    };
    const handle = manager.register({
      width: Math.max(size.x, size.z), height: size.y, center: box.getCenter(new THREE.Vector3()),
      maxInstances: 1, lod: { near: cull, far: cull + 1, strength: 1 }, apply,
    });
    return () => manager.unregister(handle.id);
  }, [plants, layout, tall, node, crop, manager, get]);

  if (!plants) return null;
  return (
    <CompileGate>
      <primitive object={plants.mesh} castShadow={tall} receiveShadow raycast={disableRaycast} userData={PLANT_USER_DATA} />
    </CompileGate>
  );
});
