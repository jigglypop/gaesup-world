import { BoxGeometry, Color, GridHelper, Group, InstancedMesh, Matrix4, MeshBasicMaterial, MeshStandardMaterial, Mesh, PlaneGeometry, type Scene } from 'three';

import { createRoomSurface } from './roomSurface';
import { TILES, WORLD_SIZE, brushIndices, tilePosition, terrainHeight, type RoomTerrain, type TileKind } from './terrain';

// Instances per stair tile; a flat tile is one.
const STAIR_STEPS = 4;
const MIN_CAPACITY = 64;

export function createRoomTerrain(scene: Scene) {
  const root = new Group(); root.name = '타일'; scene.add(root);
  const geometry = new BoxGeometry(1, 1, 1);
  let current: RoomTerrain;
  let size = WORLD_SIZE;
  const tint = new Color();
  const batches = new Map<TileKind, InstancedMesh>(); const matrix = new Matrix4();
  const materials = new Map<TileKind, MeshStandardMaterial>();
  /** A kind's batch holding at least `count` instances; grows by powers of two, so painting rarely reallocates. */
  function batch(kind: TileKind, count: number): InstancedMesh {
    const existing = batches.get(kind);
    if (existing && existing.instanceMatrix.count >= count) return existing;
    let material = materials.get(kind);
    if (!material) {
      material = new MeshStandardMaterial({ ...createRoomSurface(kind), roughness: kind === 'snow' ? 0.72 : kind === 'wood' ? 0.82 : 0.95 });
      material.name = TILES[kind].name; materials.set(kind, material);
    }
    let capacity = MIN_CAPACITY; while (capacity < count) capacity *= 2;
    const mesh = new InstancedMesh(geometry, material, capacity); mesh.name = `타일 · ${TILES[kind].name}`;
    mesh.castShadow = true; mesh.receiveShadow = true; mesh.count = 0; root.add(mesh); batches.set(kind, mesh);
    if (existing) { existing.removeFromParent(); existing.dispose(); }
    return mesh;
  }
  const needed = new Map<TileKind, number>();
  let grid = new GridHelper(WORLD_SIZE, WORLD_SIZE, '#567582', '#567582'); grid.position.y = 0.035;
  grid.material.transparent = true; grid.material.opacity = 0.27; grid.visible = false; scene.add(grid);
  const cursorGeometry = new PlaneGeometry(0.96, 0.96);
  const cursorMaterial = new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false });
  const cursor = new InstancedMesh(cursorGeometry, cursorMaterial, 25); cursor.count = 0; cursor.name = '타일 브러시'; scene.add(cursor);
  const pose = new Mesh(); pose.rotation.x = -Math.PI / 2;
  const counts: Record<string, number> = {};
  return {
    root,
    update(terrain: RoomTerrain) {
      current = terrain;
      if (size !== terrain.size) {
        const visible = grid.visible; grid.dispose(); grid.removeFromParent(); size = terrain.size;
        grid = new GridHelper(size, size, '#567582', '#567582'); grid.position.y = 0.035;
        grid.material.transparent = true; grid.material.opacity = 0.27; grid.visible = visible; scene.add(grid);
      }
      for (const kind of Object.keys(TILES)) counts[kind] = 0;
      needed.clear();
      terrain.tiles.forEach((kind, index) => {
        counts[kind]!++;
        if (kind !== 'water') needed.set(kind, (needed.get(kind) ?? 0) + (terrain.stairs?.[index] ? STAIR_STEPS : 1));
      });
      for (const [kind, count] of needed) batch(kind, count);
      for (const mesh of batches.values()) mesh.count = 0;
      terrain.tiles.forEach((kind, index) => {
        if (kind === 'water') return; // The shared R3F ocean is visible through water cells.
        const mesh = batches.get(kind)!; const [x, , z] = tilePosition(index, size);
        const height = terrain.heights?.[index] ?? 0; const stair = terrain.stairs?.[index];
        const count = stair ? STAIR_STEPS : 1;
        for (let step = 0; step < count; step++) {
          const top = height + (stair ? (step + 1) * 0.125 : 0); const thickness = top + 0.45;
          const offset = -0.375 + step * 0.25;
          matrix.makeScale(stair === 'east' || stair === 'west' ? 0.25 : 1, thickness, stair === 'north' || stair === 'south' ? 0.25 : 1);
          matrix.setPosition(x + (stair === 'east' ? offset : stair === 'west' ? -offset : 0), top - thickness / 2, z + (stair === 'south' ? offset : stair === 'north' ? -offset : 0));
          mesh.setMatrixAt(mesh.count, matrix);
          mesh.setColorAt(mesh.count, tint.setScalar(0.96 + ((index * 7 + Math.floor(index / size)) % 5) * 0.018)); mesh.count++;
        }
      });
      // Upload only the used instances, not the whole capacity.
      for (const mesh of batches.values()) {
        mesh.visible = mesh.count > 0;
        mesh.instanceMatrix.clearUpdateRanges(); mesh.instanceMatrix.addUpdateRange(0, mesh.count * 16); mesh.instanceMatrix.needsUpdate = true;
        if (mesh.instanceColor) { mesh.instanceColor.clearUpdateRanges(); mesh.instanceColor.addUpdateRange(0, mesh.count * 3); mesh.instanceColor.needsUpdate = true; }
        mesh.computeBoundingSphere();
      }
    },
    setGrid(visible: boolean) { grid.visible = visible; },
    cursor(index: number, brush: number, color = '#ffffff') {
      cursor.count = 0; cursorMaterial.color.set(color);
      for (const cell of brushIndices(index, brush, size)) {
        const [x, , z] = tilePosition(cell, size); pose.position.set(x, terrainHeight(current, x, z) + 0.045, z); pose.updateMatrix(); cursor.setMatrixAt(cursor.count++, pose.matrix);
      }
      cursor.visible = cursor.count > 0; cursor.instanceMatrix.needsUpdate = true; cursor.computeBoundingSphere();
    },
    diagnostics: () => ({ tiles: size ** 2, size, batches: [...batches.values()].filter(mesh => mesh.count > 0).length, counts: { ...counts } }),
    dispose() {
      for (const mesh of batches.values()) mesh.dispose();
      for (const material of materials.values()) { material.map?.dispose(); material.normalMap?.dispose(); material.dispose(); }
      geometry.dispose(); root.removeFromParent(); grid.dispose(); grid.removeFromParent(); cursor.dispose(); cursorGeometry.dispose(); cursorMaterial.dispose(); cursor.removeFromParent();
    },
  };
}
