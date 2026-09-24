import { isNPCInLodRange } from '../lod';

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
