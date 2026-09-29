import { hexToLinearRgb, type VoxelSourceBox } from 'gaesup-world';

import type { GiSceneItem, Triple } from './types';

const WALL_COLOR = '#e8e0d2';
const ROOF_COLOR = '#cfc6b8';
const ROOM_HALF = 6;
const WALL_THICKNESS = 0.5;
const WALL_BOTTOM = 1.5;
const WALL_TOP = 5.5;
const ROOF_TOP = 6;
const WINDOW_HALF_WIDTH = 3;
const WINDOW_BOTTOM = 2.5;
const WINDOW_TOP = 4.5;
const GROUND_HALF = 16;
const LAMP_EMISSIVE: Triple = [3, 1.9, 0.9];
const FINE_MARGIN = 0.5;

export const FINE_BOUNDS = {
  min: { x: -ROOM_HALF - FINE_MARGIN, y: 1, z: -ROOM_HALF - FINE_MARGIN },
  max: { x: ROOM_HALF + FINE_MARGIN, y: ROOF_TOP, z: ROOM_HALF + FINE_MARGIN },
};

function box(min: Triple, max: Triple, color: string, emissive?: Triple): GiSceneItem {
  return emissive ? { min, max, color, emissive } : { min, max, color };
}

export function createGiSceneItems(roof: boolean): GiSceneItem[] {
  const near = ROOM_HALF - WALL_THICKNESS;
  const items: GiSceneItem[] = [
    box([-GROUND_HALF, 0, -GROUND_HALF], [GROUND_HALF, 1, GROUND_HALF], '#6b8f47'),
    box([-ROOM_HALF, 1, -ROOM_HALF], [ROOM_HALF, WALL_BOTTOM, ROOM_HALF], '#d9c7a0'),
    box([-ROOM_HALF, WALL_BOTTOM, -ROOM_HALF], [ROOM_HALF, WALL_TOP, -near], WALL_COLOR),
    box([-ROOM_HALF, WALL_BOTTOM, -ROOM_HALF], [-near, WALL_TOP, ROOM_HALF], '#c0392b'),
    box([near, WALL_BOTTOM, -ROOM_HALF], [ROOM_HALF, WALL_TOP, ROOM_HALF], '#2f9e44'),
    box([-ROOM_HALF, WALL_BOTTOM, near], [ROOM_HALF, WINDOW_BOTTOM, ROOM_HALF], WALL_COLOR),
    box([-ROOM_HALF, WINDOW_TOP, near], [ROOM_HALF, WALL_TOP, ROOM_HALF], WALL_COLOR),
    box([-ROOM_HALF, WINDOW_BOTTOM, near], [-WINDOW_HALF_WIDTH, WINDOW_TOP, ROOM_HALF], WALL_COLOR),
    box([WINDOW_HALF_WIDTH, WINDOW_BOTTOM, near], [ROOM_HALF, WINDOW_TOP, ROOM_HALF], WALL_COLOR),
    box([-1, WALL_BOTTOM, -2], [1, 3, 0], '#f2f2f2'),
    box([3.5, WALL_BOTTOM, 2], [4.1, 2.1, 2.6], '#ffd9a0', LAMP_EMISSIVE),
    box([-10, 1, 8], [-8, 5, 10], '#8a6a4a'),
  ];
  if (roof) {
    const min: Triple = [-ROOM_HALF, WALL_TOP, -ROOM_HALF];
    items.push(box(min, [ROOM_HALF, ROOF_TOP, ROOM_HALF], ROOF_COLOR));
  }
  return items;
}

export function toVoxelBoxes(items: readonly GiSceneItem[]): VoxelSourceBox[] {
  return items.map((item) => ({
    min: { x: item.min[0], y: item.min[1], z: item.min[2] },
    max: { x: item.max[0], y: item.max[1], z: item.max[2] },
    albedo: hexToLinearRgb(item.color),
    ...(item.emissive ? { emissive: item.emissive } : {}),
  }));
}
