import * as THREE from 'three';

import { getToonGradient } from '../../../../rendering/toon';
import { createFarmSoilMaterial, createPaddyWaterMaterial, FarmCropMaterial } from '../../../../rendering/tsl/farm';
import { CROP_LOD } from '../../../terrain/farm/config';

export type GroundMaterials = { soil: THREE.Material; water: THREE.Material; boards: THREE.Material };
export type CropMaterial = { material: THREE.Material; uniforms: FarmCropMaterial['uniforms'] | null };

const grounds = new Map<string, GroundMaterials>();
const crops = new Map<string, CropMaterial>();

const shading = (toon: boolean) => (toon ? { toon, gradientMap: getToonGradient(4) } : { toon });

function classicSurface(toon: boolean, options: THREE.MeshStandardMaterialParameters = {}): THREE.Material {
  return toon
    ? new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: getToonGradient(4), ...(options.side ? { side: options.side } : {}) })
    : new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, ...options });
}

/**
 * Soil, paddy water and wooden edging, shared by every farm of the page. Node renderers shade soil and water with the
 * farm node materials; the classic renderer draws the soil's vertex colors and a plain translucent water.
 */
export function farmGroundMaterials(node: boolean, toon: boolean): GroundMaterials {
  const key = `${node}|${toon}`;
  let entry = grounds.get(key);
  if (!entry) {
    entry = {
      soil: node ? createFarmSoilMaterial(CROP_LOD.low, shading(toon)) : classicSurface(toon),
      water: node
        ? createPaddyWaterMaterial(shading(toon))
        : new THREE.MeshStandardMaterial({ color: '#4d6a55', transparent: true, opacity: 0.72, roughness: 0.08, metalness: 0, depthWrite: false }),
      boards: classicSurface(toon, { roughness: 0.8 }),
    };
    entry.soil.name = 'farm-soil';
    grounds.set(key, entry);
  }
  return entry;
}

/** Classic plants take their bloom colors and shade from the instance tint, as the node material does. */
function tintedPlants(material: THREE.Material): THREE.Material {
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <color_pars_vertex>', '#include <color_pars_vertex>\nattribute vec4 farmTint;\nattribute vec2 farmPlant;')
      .replace('#include <color_vertex>', '#include <color_vertex>\nvColor.rgb = mix(vColor.rgb, farmTint.rgb, farmPlant.y) * (0.88 + 0.22 * farmTint.w);');
  };
  material.customProgramCacheKey = () => 'farm-crop';
  return material;
}

/** The crop material of a LOD curve: swaying, rank-thinned node plants, or static vertex-colored plants on classic WebGL. */
export function farmCropMaterial(node: boolean, toon: boolean, curve: keyof typeof CROP_LOD): CropMaterial {
  const key = `${node}|${toon}|${curve}`;
  let entry = crops.get(key);
  if (!entry) {
    if (node) {
      const created = new FarmCropMaterial(CROP_LOD[curve], shading(toon));
      entry = { material: created.material, uniforms: created.uniforms };
    } else {
      entry = { material: tintedPlants(classicSurface(toon, { side: THREE.DoubleSide, roughness: 0.85 })), uniforms: null };
    }
    crops.set(key, entry);
  }
  return entry;
}
