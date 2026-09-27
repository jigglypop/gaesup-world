import { isNPCInLodRange, selectVisibleNPCs } from '../lod';

test('hidden NPCs appear inside the far ring and visible NPCs leave only past the hysteresis band', () => {
  expect(isNPCInLodRange(100, false)).toBe(true);
  expect(isNPCInLodRange(125, false)).toBe(false);
  expect(isNPCInLodRange(125, true)).toBe(true);
  expect(isNPCInLodRange(140, true)).toBe(false);
});

test('an NPC pacing across the far ring stays mounted once visible', () => {
  let visible = isNPCInLodRange(110, false);
  let flips = 0;
  for (const distance of [118, 122, 119, 124, 117, 126]) {
    const next = isNPCInLodRange(distance, visible);
    if (next !== visible) flips++;
    visible = next;
  }
  expect(flips).toBe(0);
});

test('the visible cap keeps the nearest NPCs and does not swap two walkers at its edge', () => {
  const distances = new Map([['a', 10], ['b', 20], ['c', 30], ['d', 40]]);
  const shown = selectVisibleNPCs(distances, new Set(), 2);
  expect([...shown].sort()).toEqual(['a', 'b']);
  // c edges nearer than b, but not by the hysteresis: b keeps its place.
  distances.set('c', 18);
  expect([...selectVisibleNPCs(distances, shown, 2)].sort()).toEqual(['a', 'b']);
  distances.set('c', 12);
  expect([...selectVisibleNPCs(distances, shown, 2)].sort()).toEqual(['a', 'c']);
});
