import * as THREE from 'three';

import { sweepSphereMesh } from '../sphereSweep';
import { TRIANGLE_GRID_MIN, triangleGrid, visitGridTriangles } from '../triangleGrid';

/** A flat 40 × 40 m floor of 64 × 64 quads: 8192 triangles, well past the grid threshold. */
function floor(): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(40, 40, 64, 64).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial());
  mesh.updateMatrixWorld(true);
  return mesh;
}

describe('triangleGrid', () => {
  it('visits only the triangles under the box, each once', () => {
    const { geometry } = floor();
    const index = geometry.index!;
    const grid = triangleGrid(geometry, geometry.getAttribute('position') as THREE.BufferAttribute, index);
    expect(index.count / 3).toBeGreaterThan(TRIANGLE_GRID_MIN);
    const seen: number[] = [];
    visitGridTriangles(grid, new THREE.Box3(new THREE.Vector3(-1, -1, -1), new THREE.Vector3(1, 1, 1)), 0, index.count, (offset) => seen.push(offset));
    expect(seen.length).toBeGreaterThan(0);
    expect(seen.length).toBeLessThan(200);
    expect(new Set(seen).size).toBe(seen.length);
  });

  it('keeps sweeps exact: a sphere dropped onto the floor stops a radius above it', () => {
    const mesh = floor();
    const ray = new THREE.Ray(new THREE.Vector3(3.3, 10, -2.7), new THREE.Vector3(0, -1, 0));
    const point = new THREE.Vector3();
    const distance = sweepSphereMesh(mesh, ray, 0.5, 20, point);
    expect(distance).toBeCloseTo(9.5, 5);
    expect(point.y).toBeCloseTo(0, 5);
  });

  it('builds again when the geometry moves its vertices', () => {
    const { geometry } = floor();
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute;
    const first = triangleGrid(geometry, positions, geometry.index);
    expect(triangleGrid(geometry, positions, geometry.index)).toBe(first);
    positions.needsUpdate = true;
    expect(triangleGrid(geometry, positions, geometry.index)).not.toBe(first);
  });
});
