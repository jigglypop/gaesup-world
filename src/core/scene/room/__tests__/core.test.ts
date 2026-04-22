import { computeVisibleRoomIds, findContainingRoomId, pointInRoomBounds } from '../core';
import type { RoomDescriptor, RoomPortalDescriptor } from '../../types';

const rooms: RoomDescriptor[] = [
  {
    id: 'foyer',
    sceneId: 'home',
    bounds: { min: [-4, -1, 1], max: [4, 3, 4] },
  },
  {
    id: 'living',
    sceneId: 'home',
    bounds: { min: [-4, -1, -1], max: [4, 3, 1] },
  },
  {
    id: 'studio',
    sceneId: 'home',
    bounds: { min: [-4, -1, -4], max: [4, 3, -1] },
  },
];

const portals: RoomPortalDescriptor[] = [
  {
    id: 'foyer-living',
    sceneId: 'home',
    fromRoomId: 'foyer',
    toRoomId: 'living',
    position: [0, 1, 1],
    revealDistance: 3,
  },
  {
    id: 'living-studio',
    sceneId: 'home',
    fromRoomId: 'living',
    toRoomId: 'studio',
    position: [0, 1, -1],
    revealDistance: 3,
  },
];

describe('scene room visibility core', () => {
  it('detects whether a point is inside room bounds', () => {
    expect(pointInRoomBounds({ x: 0, y: 0, z: 2 }, rooms[0].bounds)).toBe(true);
    expect(pointInRoomBounds({ x: 0, y: 0, z: -3 }, rooms[0].bounds)).toBe(false);
  });

  it('finds the containing room', () => {
    expect(findContainingRoomId('home', rooms, { x: 0, y: 0, z: 2.5 })).toBe('foyer');
    expect(findContainingRoomId('home', rooms, { x: 0, y: 0, z: -2.5 })).toBe('studio');
  });

  it('shows only the current room when far from a portal', () => {
    const visible = computeVisibleRoomIds({
      sceneId: 'home',
      rooms,
      portals,
      position: { x: 0, y: 0, z: 3.95 },
    });

    expect(Array.from(visible)).toEqual(['foyer']);
  });

  it('reveals the adjacent room when close to a portal', () => {
    const visible = computeVisibleRoomIds({
      sceneId: 'home',
      rooms,
      portals,
      position: { x: 0, y: 0, z: 1.4 },
    });

    expect(visible.has('foyer')).toBe(true);
    expect(visible.has('living')).toBe(true);
    expect(visible.has('studio')).toBe(false);
  });
});
