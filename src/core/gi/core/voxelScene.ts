import type { Vec3 } from '../../grid';
import type { Aabb, Rgb, VoxelDims, VoxelGrid, VoxelSourceBox } from '../types';
import {
  DEFAULT_MATERIAL_ID,
  MAX_MATERIAL_ID,
  clearVoxelGrid,
  createVoxelGrid,
  fillVoxelBox,
  registerVoxelMaterial,
  resetVoxelMaterials,
} from './voxelGrid';

const MATERIAL_KEY_PRECISION = 1000;
const ZERO_RGB: Rgb = [0, 0, 0];

function materialKey(albedo: Rgb, emissive: Rgb): string {
  return [...albedo, ...emissive]
    .map((value) => Math.round(value * MATERIAL_KEY_PRECISION))
    .join(',');
}

/**
 * 그리드를 비우고 박스 목록을 순서대로 채운다. 같은 색은 팔레트 항목 하나를 공유하며,
 * 팔레트가 가득 차면 기본 재질로 대체한다. 나중 박스가 이전 박스를 덮어쓴다.
 */
export function rebuildVoxelGrid(grid: VoxelGrid, boxes: readonly VoxelSourceBox[]): void {
  clearVoxelGrid(grid);
  resetVoxelMaterials(grid);
  const ids = new Map<string, number>();
  for (const box of boxes) {
    const emissive = box.emissive ?? ZERO_RGB;
    const key = materialKey(box.albedo, emissive);
    let id = ids.get(key);
    if (id === undefined) {
      id =
        grid.materials.length <= MAX_MATERIAL_ID
          ? registerVoxelMaterial(grid, { albedo: box.albedo, emissive })
          : DEFAULT_MATERIAL_ID;
      ids.set(key, id);
    }
    fillVoxelBox(grid, box, id);
  }
}

export function computeBoxBounds(boxes: readonly Aabb[]): Aabb | null {
  const first = boxes[0];
  if (!first) return null;
  const min = { ...first.min };
  const max = { ...first.max };
  for (const box of boxes) {
    min.x = Math.min(min.x, box.min.x);
    min.y = Math.min(min.y, box.min.y);
    min.z = Math.min(min.z, box.min.z);
    max.x = Math.max(max.x, box.max.x);
    max.y = Math.max(max.y, box.max.y);
    max.z = Math.max(max.z, box.max.z);
  }
  return { min, max };
}

/**
 * 경계를 step의 배수로 바깥쪽 정렬한다. 편집 중 경계가 조금씩 변해도 그리드가 매번 재생성되지 않게 한다.
 */
export function expandBounds(bounds: Aabb, step: number): Aabb {
  const floor = (value: number) => Math.floor(value / step) * step;
  const ceil = (value: number) => Math.ceil(value / step) * step;
  return {
    min: { x: floor(bounds.min.x), y: floor(bounds.min.y), z: floor(bounds.min.z) },
    max: { x: ceil(bounds.max.x), y: ceil(bounds.max.y), z: ceil(bounds.max.z) },
  };
}

export function computeGridSpec(
  bounds: Aabb,
  voxelSize: number,
  padding: number,
): { origin: Vec3; dims: VoxelDims } {
  const span = (min: number, max: number) =>
    Math.max(1, Math.ceil((max - min + padding * 2) / voxelSize));
  return {
    origin: { x: bounds.min.x - padding, y: bounds.min.y - padding, z: bounds.min.z - padding },
    dims: [
      span(bounds.min.x, bounds.max.x),
      span(bounds.min.y, bounds.max.y),
      span(bounds.min.z, bounds.max.z),
    ],
  };
}

export function createGridForBounds(bounds: Aabb, voxelSize: number, padding: number): VoxelGrid {
  const spec = computeGridSpec(bounds, voxelSize, padding);
  return createVoxelGrid(spec.origin, voxelSize, spec.dims);
}

/**
 * 월드 좌표에 정렬된 프로브 격자를 만든다. offset은 축마다 격자 원점에서 얼마나 어긋나게 둘지 정한다.
 * 건물 표면(벽 평면, 타일 윗면)과 겹치지 않는 값을 고르는 것은 호출자의 몫이다.
 */
export function alignedProbeLayout(
  bounds: Aabb,
  spacing: number,
  offset: Vec3,
): { origin: Vec3; counts: VoxelDims } {
  const axis = (min: number, max: number, shift: number) => {
    const origin = Math.floor(min / spacing) * spacing + shift;
    return { origin, count: Math.max(1, Math.floor((max - origin) / spacing) + 1) };
  };
  const x = axis(bounds.min.x, bounds.max.x, offset.x);
  const y = axis(bounds.min.y, bounds.max.y, offset.y);
  const z = axis(bounds.min.z, bounds.max.z, offset.z);
  return { origin: { x: x.origin, y: y.origin, z: z.origin }, counts: [x.count, y.count, z.count] };
}
