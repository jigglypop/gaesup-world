import { tileHalfSize } from '../../building/model';
import type { BuildingWallKind, WallConfig, WallGroupConfig } from '../../building/types';
import { TILE_CONSTANTS } from '../../building/types/constants';
import type { Vec3 } from '../../grid';
import { hexToLinearRgb } from '../core/color';
import type { Aabb, Rgb, VoxelSourceBox } from '../types';
import { objectProxyBoxes } from './objectProxies';
import type { BuildingVoxelSource, WallPiece } from './types';

const { GRID_CELL_SIZE, HEIGHT_STEP, WALL_SIZES } = TILE_CONSTANTS;
const HALF = 0.5;
const HALF_WALL_RATIO = 0.46;
const DOOR_SIDE_RATIO = 0.24;
const DOOR_HEADER_RATIO = 0.22;
const ARCH_HEADER_RATIO = 0.34;
const WINDOW_SIDE_RATIO = 0.22;
const WINDOW_BAND_RATIO = 0.24;
const FIRE_RADIANCE = 6;
const FIRE_DEFAULT_WIDTH = 0.6;
const FIRE_DEFAULT_HEIGHT = 1;
const FIRE_DEFAULT_COLOR = '#ff8a3d';
const FIRE_ALBEDO: Rgb = [0.02, 0.02, 0.02];

function albedoOf(source: BuildingVoxelSource, meshId: string | undefined): Rgb | null {
  const mesh = meshId ? source.meshes.get(meshId) : undefined;
  if (mesh && (mesh.material === 'GLASS' || mesh.transparent === true)) return null;
  return hexToLinearRgb(mesh?.color);
}

export function wallPieces(
  kind: BuildingWallKind,
  width: number,
  height: number,
  depth: number,
): WallPiece[] {
  const z = width * HALF;
  const centerY = height * HALF;
  if (kind === 'solid') return [{ center: [0, centerY, z], size: [width, height, depth] }];
  if (kind === 'half') {
    const rail = height * HALF_WALL_RATIO;
    return [{ center: [0, rail * HALF, z], size: [width, rail, depth] }];
  }
  if (kind === 'door' || kind === 'arch') {
    const side = width * DOOR_SIDE_RATIO;
    const opening = width - side * 2;
    const header = height * (kind === 'arch' ? ARCH_HEADER_RATIO : DOOR_HEADER_RATIO);
    const offset = (opening + side) * HALF;
    return [
      { center: [-offset, centerY, z], size: [side, height, depth] },
      { center: [offset, centerY, z], size: [side, height, depth] },
      { center: [0, height - header * HALF, z], size: [opening, header, depth] },
    ];
  }
  if (kind === 'window') {
    const side = width * WINDOW_SIDE_RATIO;
    const band = height * WINDOW_BAND_RATIO;
    const opening = width - side * 2;
    const offset = (opening + side) * HALF;
    return [
      { center: [-offset, centerY, z], size: [side, height, depth] },
      { center: [offset, centerY, z], size: [side, height, depth] },
      { center: [0, band * HALF, z], size: [opening, band, depth] },
      { center: [0, height - band * HALF, z], size: [opening, band, depth] },
    ];
  }
  return [];
}

function pieceBox(
  piece: WallPiece,
  position: Vec3,
  rotationY: number,
  albedo: Rgb,
): VoxelSourceBox {
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const [cx, cy, cz] = piece.center;
  const [sx, sy, sz] = piece.size;
  const centerX = position.x + cx * cos + cz * sin;
  const centerY = position.y + cy;
  const centerZ = position.z - cx * sin + cz * cos;
  const halfX = (Math.abs(cos) * sx + Math.abs(sin) * sz) * HALF;
  const halfZ = (Math.abs(sin) * sx + Math.abs(cos) * sz) * HALF;
  const halfY = sy * HALF;
  return {
    min: { x: centerX - halfX, y: centerY - halfY, z: centerZ - halfZ },
    max: { x: centerX + halfX, y: centerY + halfY, z: centerZ + halfZ },
    albedo,
  };
}

function wallKind(wall: WallConfig, group: WallGroupConfig): BuildingWallKind {
  return wall.wallKind ?? group.defaultWallKind ?? 'solid';
}

/**
 * 건축 스토어의 타일, 블록, 벽, 불 오브젝트를 GI용 복셀 박스로 변환한다.
 * 문·창 벽은 개구부를 남기고 유리와 난간은 빛이 통과하도록 생략한다.
 * `modelBounds`(모델 URL별 경계 상자)를 주면 나무·가구·바위 같은 배치 오브젝트도 대리 박스로 넣어 빛을 가리게 하고,
 * 조명의 머리는 발광체로 넣는다(objectProxies.ts).
 */
export function buildingToVoxelBoxes(
  source: BuildingVoxelSource,
  modelBounds?: ReadonlyMap<string, Aabb | null>,
): VoxelSourceBox[] {
  const boxes: VoxelSourceBox[] = [];
  for (const group of source.tileGroups.values()) {
    for (const tile of group.tiles) {
      const albedo = albedoOf(source, tile.materialId ?? group.floorMeshId);
      if (!albedo) continue;
      const half = tileHalfSize(tile.size ?? 1);
      const { x, y, z } = tile.position;
      boxes.push({
        min: { x: x - half, y, z: z - half },
        max: { x: x + half, y: y + HEIGHT_STEP, z: z + half },
        albedo,
      });
    }
  }
  for (const block of source.blocks) {
    const albedo = albedoOf(source, block.materialId);
    if (!albedo) continue;
    const width = Math.max(1, Math.round(block.size?.x ?? 1)) * GRID_CELL_SIZE;
    const height = Math.max(1, Math.round(block.size?.y ?? 1)) * HEIGHT_STEP;
    const depth = Math.max(1, Math.round(block.size?.z ?? 1)) * GRID_CELL_SIZE;
    const minX = block.position.x - GRID_CELL_SIZE * HALF;
    const minZ = block.position.z - GRID_CELL_SIZE * HALF;
    boxes.push({
      min: { x: minX, y: block.position.y, z: minZ },
      max: { x: minX + width, y: block.position.y + height, z: minZ + depth },
      albedo,
    });
  }
  for (const group of source.wallGroups.values()) {
    for (const wall of group.walls) {
      const meshId = wall.materialId ?? group.frontMeshId ?? group.backMeshId ?? group.sideMeshId;
      const albedo = albedoOf(source, meshId);
      if (!albedo) continue;
      // Walls are one size, set by the grid edge they stand on.
      const pieces = wallPieces(wallKind(wall, group), WALL_SIZES.WIDTH, WALL_SIZES.HEIGHT, WALL_SIZES.THICKNESS);
      for (const piece of pieces) {
        boxes.push(pieceBox(piece, wall.position, wall.rotation.y, albedo));
      }
    }
  }
  for (const object of source.objects) {
    if (modelBounds && object.type !== 'fire') {
      boxes.push(...objectProxyBoxes(object, modelBounds));
      continue;
    }
    if (object.type !== 'fire') continue;
    const config = object.config;
    const width = config?.fireWidth ?? FIRE_DEFAULT_WIDTH;
    const height = config?.fireHeight ?? FIRE_DEFAULT_HEIGHT;
    const radiance = FIRE_RADIANCE * (config?.fireIntensity ?? 1);
    const [r, g, b] = hexToLinearRgb(config?.fireColor ?? FIRE_DEFAULT_COLOR);
    const { x, y, z } = object.position;
    boxes.push({
      min: { x: x - width * HALF, y, z: z - width * HALF },
      max: { x: x + width * HALF, y: y + height, z: z + width * HALF },
      albedo: FIRE_ALBEDO,
      emissive: [r * radiance, g * radiance, b * radiance],
    });
  }
  return boxes;
}
