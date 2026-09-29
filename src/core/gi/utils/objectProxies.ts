import { getDefaultBuildingObject } from '../../building/catalog/objects';
import type { BuildingTreeKind, PlacedObject } from '../../building/types';
import type { Vec3 } from '../../grid';
import { hexToLinearRgb } from '../core/color';
import type { Aabb, Rgb, VoxelSourceBox } from '../types';

/** A solid part of a proxy in the model's own space, as fractions of its bounding box. */
type Part = { from: readonly [number, number, number]; to: readonly [number, number, number]; color?: string; glow?: number };

const HALF = 0.5;
/** Models smaller than this in every direction are below a voxel's worth of occlusion. */
const MIN_EXTENT = 0.45;
const DEFAULT_COLOR = '#8a8a8a';
const LAMP_RADIANCE = 3;
const TRUNK_COLOR = '#6b4a2a';

/** The whole box, pulled in a little: rounded models do not fill their corners. */
const SOLID: Part[] = [{ from: [0.05, 0, 0.05], to: [0.95, 1, 0.95] }];

/**
 * Stand-in shapes by what the model is. Foliage, glass and thin pieces (flowers, windows, fences) are left out: as
 * solid voxels they would shade far more than they do.
 */
function partsFor(id: string, fallbackKind: string | undefined): Part[] | null {
  if (id.startsWith('nature-tree-')) {
    return [
      { from: [0.43, 0, 0.43], to: [0.57, 0.42, 0.57], color: TRUNK_COLOR },
      { from: [0.11, 0.36, 0.11], to: [0.89, 0.98, 0.89], color: '#5d8f45' },
    ];
  }
  if (/flower|lily|mushroom|fern/.test(id)) return null;
  if (/rock/.test(id)) return [{ ...SOLID[0]!, color: '#8f8b83' }];
  if (/bush/.test(id)) return [{ from: [0.1, 0, 0.1], to: [0.9, 0.85, 0.9], color: '#4f8a3c' }];
  if (/stump|log/.test(id)) return [{ ...SOLID[0]!, color: '#7a5534' }];
  switch (fallbackKind) {
    case 'door':
    case 'window':
    case 'fence':
      return null;
    case 'table':
      return [{ from: [0, 0.86, 0], to: [1, 1, 1] }];
    case 'chair':
      return [{ from: [0.05, 0, 0.05], to: [0.95, 0.55, 0.95] }];
    case 'lamp':
      return [{ from: [0.2, 0.7, 0.2], to: [0.8, 1, 0.8], glow: LAMP_RADIANCE }];
    case 'shop':
      return [
        { from: [0, 0, 0], to: [1, 0.45, 1] },
        { from: [0, 0.88, 0], to: [1, 1, 1] },
      ];
    default:
      return SOLID;
  }
}

function box(center: Vec3, rotation: number, local: Vec3, size: Vec3, albedo: Rgb, emissive?: Rgb): VoxelSourceBox {
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const x = center.x + local.x * cos + local.z * sin;
  const z = center.z - local.x * sin + local.z * cos;
  const halfX = (Math.abs(cos) * size.x + Math.abs(sin) * size.z) * HALF;
  const halfZ = (Math.abs(sin) * size.x + Math.abs(cos) * size.z) * HALF;
  return {
    min: { x: x - halfX, y: center.y + local.y - size.y * HALF, z: z - halfZ },
    max: { x: x + halfX, y: center.y + local.y + size.y * HALF, z: z + halfZ },
    albedo,
    ...(emissive ? { emissive } : {}),
  };
}

function modelProxies(object: PlacedObject, bounds: Aabb): VoxelSourceBox[] {
  const config = object.config ?? {};
  const scale = config.modelScale ?? 1;
  const size = {
    x: (bounds.max.x - bounds.min.x) * scale,
    y: (bounds.max.y - bounds.min.y) * scale,
    z: (bounds.max.z - bounds.min.z) * scale,
  };
  if (Math.max(size.x, size.y, size.z) < MIN_EXTENT) return [];
  const id = config.modelId ?? '';
  const catalog = getDefaultBuildingObject(id);
  const parts = partsFor(id, config.modelFallbackKind ?? catalog?.fallbackKind);
  if (!parts) return [];
  const base = config.modelColor ?? catalog?.defaultColor ?? DEFAULT_COLOR;
  return parts.map((part) => {
    const color = hexToLinearRgb(part.color ?? base);
    const partSize = {
      x: size.x * (part.to[0] - part.from[0]),
      y: size.y * (part.to[1] - part.from[1]),
      z: size.z * (part.to[2] - part.from[2]),
    };
    const local = {
      x: (bounds.min.x * scale) + size.x * (part.from[0] + part.to[0]) * HALF,
      y: (bounds.min.y * scale) + size.y * (part.from[1] + part.to[1]) * HALF,
      z: (bounds.min.z * scale) + size.z * (part.from[2] + part.to[2]) * HALF,
    };
    const glow = part.glow ?? 0;
    const emissive: Rgb | undefined = glow > 0 ? [color[0] * glow, color[1] * glow, color[2] * glow] : undefined;
    return box(object.position, object.rotation ?? 0, local, partSize, color, emissive);
  });
}

/** Crown and trunk proportions of the procedural trees, as sakura.tsx builds them (computeSpecs). */
const TREE_SHAPES: Record<BuildingTreeKind, { radius: number; height: number; trunk: number; color: string }> = {
  sakura: { radius: 1, height: 1, trunk: 1, color: '#f7bfd2' },
  oak: { radius: 1.12, height: 0.86, trunk: 1, color: '#4f8f3a' },
  pine: { radius: 0.92, height: 1.5, trunk: 1.18, color: '#2f6f45' },
  maple: { radius: 1.02, height: 0.78, trunk: 0.96, color: '#d05a2d' },
  birch: { radius: 0.82, height: 1.08, trunk: 1.14, color: '#87b95a' },
  willow: { radius: 1.2, height: 1.28, trunk: 0.88, color: '#7fae55' },
  cypress: { radius: 0.78, height: 1.65, trunk: 1.24, color: '#315f3a' },
  dead: { radius: 0.7, height: 0.7, trunk: 1.08, color: '#8b7a61' },
};

function treeProxies(object: PlacedObject): VoxelSourceBox[] {
  const kind: BuildingTreeKind = object.type === 'sakura' ? 'sakura' : object.config?.treeKind ?? 'oak';
  const shape = TREE_SHAPES[kind] ?? TREE_SHAPES.oak;
  const size = object.config?.size ?? 4;
  const s = Math.min(Math.max(size / 4, 0.95), 1.85);
  const trunkHeight = 3.8 * s * shape.trunk;
  const crownRadius = (1.65 * s + Math.min(size * 0.08, 0.55)) * shape.radius;
  const crownHeight = (2.15 * s + Math.min(size * 0.04, 0.35)) * shape.height;
  const crownBase = trunkHeight * 0.58;
  const crown = crownRadius * 1.6;
  const trunk = 0.3 * s;
  return [
    box(object.position, 0, { x: 0, y: crownBase * HALF, z: 0 }, { x: trunk, y: crownBase, z: trunk }, hexToLinearRgb(TRUNK_COLOR)),
    box(
      object.position,
      0,
      { x: 0, y: crownBase + crownHeight * HALF, z: 0 },
      { x: crown, y: crownHeight, z: crown },
      hexToLinearRgb(shape.color),
    ),
  ];
}

/**
 * GI stand-ins for placed objects: procedural trees from their size, glTF models from their file's bounding box
 * (`modelBounds`, keyed by model URL) cut into a few solid parts by what the model is (a table's top, a tree's trunk and
 * crown, a lamp's glowing head). Models whose bounds are not known yet are skipped until they are.
 */
export function objectProxyBoxes(
  object: PlacedObject,
  modelBounds: ReadonlyMap<string, Aabb | null>,
): VoxelSourceBox[] {
  if (object.type === 'tree' || object.type === 'sakura') return treeProxies(object);
  if (object.type !== 'model') return [];
  const url = object.config?.modelUrl;
  const bounds = url ? modelBounds.get(url) : undefined;
  return bounds ? modelProxies(object, bounds) : [];
}
