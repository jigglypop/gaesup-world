import ReactThreeTestRenderer from '@react-three/test-renderer';
import type * as THREE from 'three';

import { SandBatch, type SandEntry } from '../sand';

const patch = (x: number, y = 0): SandEntry => ({ position: [x, y, 0], size: 4 });
// Each edge of a size-4 patch is 24 segments; a skirt segment is a double-sided quad of 12 vertices.
const SEGMENT_VERTICES = 24 * 12;

async function skirtSegments(entries: SandEntry[]): Promise<number> {
  const renderer = await ReactThreeTestRenderer.create(<SandBatch entries={entries} toon={false} />);
  try {
    const skirt = renderer.scene.findByProps({ name: 'sand-skirt' }).instance as unknown as THREE.Mesh;
    return skirt.geometry.getAttribute('position').count / SEGMENT_VERTICES;
  } finally {
    await renderer.unmount();
  }
}

test('patches side by side at one height share an edge without a skirt; a step between them keeps both skirts', async () => {
  expect(await skirtSegments([patch(0)])).toBe(4);
  expect(await skirtSegments([patch(0), patch(4)])).toBe(6);
  expect(await skirtSegments([patch(0), patch(4, 1)])).toBe(8);
});
