import { BoxGeometry, Color, GridHelper, Group, InstancedMesh, Matrix4, MeshBasicMaterial, MeshStandardMaterial, Mesh, PlaneGeometry, type Scene } from 'three';

import { TILES, WORLD_SIZE, brushIndices, tilePosition, type RoomTerrain, type TileKind } from './terrain';

export function createRoomTerrain(scene: Scene) {
  const root = new Group(); root.name = '타일'; scene.add(root);
  const geometry = new BoxGeometry(0.995, 0.12, 0.995);
  const batches = new Map<TileKind, InstancedMesh>(); const matrix = new Matrix4();
  for (const kind of Object.keys(TILES) as TileKind[]) {
    const material = new MeshStandardMaterial({ color: TILES[kind].color, roughness: kind === 'water' ? 0.23 : 0.9, metalness: kind === 'water' ? 0.15 : 0 });
    material.name = TILES[kind].name;
    const mesh = new InstancedMesh(geometry, material, WORLD_SIZE ** 2); mesh.name = `타일 · ${TILES[kind].name}`;
    mesh.receiveShadow = true; mesh.count = 0; root.add(mesh); batches.set(kind, mesh);
  }
  const grid = new GridHelper(WORLD_SIZE, WORLD_SIZE, '#567582', '#567582'); grid.position.y = 0.035;
  grid.material.transparent = true; grid.material.opacity = 0.27; grid.visible = false; scene.add(grid);
  const cursorGeometry = new PlaneGeometry(0.96, 0.96);
  const cursorMaterial = new MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.4, depthWrite: false });
  const cursor = new InstancedMesh(cursorGeometry, cursorMaterial, 25); cursor.count = 0; cursor.name = '타일 브러시'; scene.add(cursor);
  const pose = new Mesh(); pose.rotation.x = -Math.PI / 2;
  const counts: Record<string, number> = {};
  return {
    root,
    update(terrain: RoomTerrain) {
      for (const [kind, mesh] of batches) { mesh.count = 0; counts[kind] = 0; }
      terrain.tiles.forEach((kind, index) => {
        const mesh = batches.get(kind)!; const [x, , z] = tilePosition(index);
        matrix.makeTranslation(x, kind === 'water' ? -0.07 : -0.06, z); mesh.setMatrixAt(mesh.count, matrix);
        mesh.setColorAt(mesh.count, new Color().setScalar(0.96 + ((index * 7 + Math.floor(index / WORLD_SIZE)) % 5) * 0.018));
        mesh.count++; counts[kind]!++;
      });
      for (const mesh of batches.values()) { mesh.visible = mesh.count > 0; mesh.instanceMatrix.needsUpdate = true; if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true; mesh.computeBoundingSphere(); }
    },
    setGrid(visible: boolean) { grid.visible = visible; },
    cursor(index: number, brush: number, color = '#ffffff') {
      cursor.count = 0; cursorMaterial.color.set(color);
      for (const cell of brushIndices(index, brush)) {
        const [x, , z] = tilePosition(cell); pose.position.set(x, 0.045, z); pose.updateMatrix(); cursor.setMatrixAt(cursor.count++, pose.matrix);
      }
      cursor.visible = cursor.count > 0; cursor.instanceMatrix.needsUpdate = true; cursor.computeBoundingSphere();
    },
    diagnostics: () => ({ tiles: WORLD_SIZE ** 2, batches: [...batches.values()].filter(mesh => mesh.count > 0).length, counts: { ...counts } }),
    dispose() {
      for (const mesh of batches.values()) { (mesh.material as MeshStandardMaterial).dispose(); mesh.dispose(); }
      geometry.dispose(); root.removeFromParent(); grid.dispose(); grid.removeFromParent(); cursor.dispose(); cursorGeometry.dispose(); cursorMaterial.dispose(); cursor.removeFromParent();
    },
  };
}
