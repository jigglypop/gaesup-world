import {
  abs, attribute, color, cos, exp, time as frameTime, length, max, min, mix, modelWorldMatrix, output, positionGeometry, positionWorld,
  pow, saturate, sin, smoothstep, step, texture, uniform, vec2, vec3, vec4,
} from 'three/tsl';
import { MeshLambertNodeMaterial, type Node, type Texture, type Vector4 } from 'three/webgpu';

import { getSharedWaterNormals } from '../../building/components/mesh/water/normals';
import {
  POND_FLOOR_OFFSET, WATER_BED, WATER_BED_MARK, WATER_COLORS, WATER_OPTICS, WATER_SHORE,
} from '../../building/components/mesh/water/shading';
import { SHORE_DISTANCE_RANGE } from '../../building/terrain/shoreField';

/** Shore coverage as water reads it: a texture and the transform from world xz to its uv. */
export type WaterFieldBinding = { readonly texture: Texture; readonly transform: Vector4 };

/** Shore coverage (0 land, 1 open water) and meters to the nearest land at a world xz. */
export type WaterShore = {
  coverageAt: (xz: Node<'vec2'>) => Node<'float'>;
  distanceAt: (xz: Node<'vec2'>) => Node<'float'>;
};

/** Reads the shore field, or without one the surface geometry's `waterCoverage` and `waterDistance` attributes. */
export function waterShore(field: WaterFieldBinding | null): WaterShore {
  if (!field) {
    return {
      coverageAt: () => attribute<'float'>('waterCoverage', 'float'),
      distanceAt: () => attribute<'float'>('waterDistance', 'float'),
    };
  }
  const transform = uniform(field.transform);
  const uvAt = (xz: Node<'vec2'>) => xz.sub(transform.xy).mul(transform.zw);
  return {
    coverageAt: (xz) => texture(field.texture, uvAt(xz)).r,
    distanceAt: (xz) => {
      const uv = uvAt(xz);
      // Past the field's border the sea keeps getting farther from land.
      const outside = length(max(abs(uv.sub(0.5)).sub(0.5), 0).div(transform.zw));
      return texture(field.texture, uv).g.mul(SHORE_DISTANCE_RANGE).add(outside);
    },
  };
}

/** Coverage bent off the tile grid by a fixed world-space wobble: where the visible shoreline runs. */
export const shoreEdge = (xz: Node<'vec2'>, coverage: Node<'float'>): Node<'float'> => coverage.add(
  sin(xz.x.mul(0.9).add(sin(xz.y.mul(0.63)).mul(1.4))).mul(cos(xz.y.mul(0.77).sub(xz.x.mul(0.21)))).mul(WATER_SHORE.wobble),
);

/** `waterDepth` on the GPU: how deep the water reads, in meters. */
export function waterDepthAt(distance: Node<'float'>, open: boolean): Node<'float'> {
  if (open) {
    const { shore, slope, curve, max: deepest } = WATER_BED.sea;
    const d = max(distance, 0);
    return min(d.mul(d.mul(curve).add(slope)).add(shore), deepest);
  }
  return smoothstep(0, WATER_BED.pond.ramp, distance).mul(WATER_BED.pond.depth);
}

/** Light the ripples focus on the floor: bright where two drifting ripple layers cancel out, fading with depth. */
function caustics(normals: Texture, xz: Node<'vec2'>, depth: Node<'float'>): Node<'float'> {
  const { scale, strength, fade } = WATER_OPTICS.caustics;
  const p = xz.mul(scale);
  const a = texture(normals, p.add(vec2(frameTime.mul(0.021), frameTime.mul(0.013)))).xy;
  const b = texture(normals, p.mul(1.37).add(vec2(frameTime.mul(-0.017), frameTime.mul(0.019)))).xy;
  return pow(saturate(length(a.add(b).sub(1)).mul(6).oneMinus()), 3).mul(exp(depth.mul(-fade))).mul(strength);
}

/**
 * The floor under a water surface, drawn with the surface's own grid and transform: sand off the shore that darkens as
 * it falls away, under drifting caustics. A pond floor covers the tile it lies on and ends at the bank, where the
 * water turns see-through over the ground. The floor marks the framebuffer alpha with `WATER_BED_MARK` for the surface.
 */
export function createWaterBedMaterial(
  field: WaterFieldBinding | null,
  open: boolean,
  normalMap: Texture = getSharedWaterNormals(),
): MeshLambertNodeMaterial {
  const shore = waterShore(field);
  const local = positionGeometry;
  const material = new MeshLambertNodeMaterial();
  material.name = 'water-bed';
  // The surface grid lies in its local xy plane; +z is up once it is turned flat.
  const floorDepth = open ? waterDepthAt(shore.distanceAt(modelWorldMatrix.mul(vec4(local, 1)).xz), true) : WATER_BED.pond.floor;
  material.positionNode = vec3(local.x, local.y, local.z.sub(floorDepth));
  const world = positionWorld.xz;
  const depth = waterDepthAt(shore.distanceAt(world), open);
  const [shallow, deep] = open ? [WATER_COLORS.seaBed, WATER_COLORS.seaBedDeep] : [WATER_COLORS.pondBed, WATER_COLORS.pondBedDeep];
  const ground = mix(color(shallow), color(deep), smoothstep(0, open ? 4 : WATER_BED.pond.depth, depth));
  material.colorNode = ground.mul(caustics(normalMap, world, depth).add(1));
  if (!open) {
    // Past the bank the pond's surface is see-through, and the ground there must show, not the floor.
    material.opacityNode = step(WATER_SHORE.edge[1], shoreEdge(world, shore.coverageAt(world)));
    material.alphaTest = 0.5;
    // It lies on the tile top, a few millimeters over the tile's own surface, and has to win against it.
    Object.assign(material, POND_FLOOR_OFFSET);
  }
  material.outputNode = vec4(output.rgb, WATER_BED_MARK);
  return material;
}
