import { BoxGeometry, Group, Matrix4, Mesh, MeshStandardMaterial } from 'three';

import { createDemandLoop } from '../demandLoop';
import { RoomBatches } from '../roomBatches';

test('demand frames coalesce, settle, suspend and stop after disposal', () => {
  const pending = new Map<number, (time: number) => void>(); let id = 0; let draws = 0;
  const loop = createDemandLoop(() => ++draws < 3, { request: callback => { pending.set(++id, callback); return id; }, cancel: key => { pending.delete(key); } });
  const advance = () => { const callbacks = [...pending.values()]; pending.clear(); callbacks.forEach(callback => callback(id * 16)); };
  loop.invalidate(); loop.invalidate(); expect(pending.size).toBe(1); advance(); advance(); advance();
  expect(draws).toBe(3); expect(pending.size).toBe(0); expect(loop.pending).toBe(false);
  loop.invalidate(); loop.setActive(false); expect(pending.size).toBe(0); loop.invalidate(); expect(pending.size).toBe(0);
  loop.setActive(true); expect(pending.size).toBe(1); advance(); expect(draws).toBe(4);
  loop.invalidate(); loop.dispose(); loop.setActive(true); loop.invalidate(); expect(pending.size).toBe(0);
});

test('furniture instances preserve owner IDs, full transforms, visibility and shared asset lifetime', () => {
  const geometry = new BoxGeometry(); const material = new MeshStandardMaterial(); const groups = new Map<string, Group>();
  for (const id of ['a', 'b']) { const owner = new Group(); owner.userData['objectId'] = id; const part = new Mesh(geometry, material); part.position.x = 1; owner.add(part); groups.set(id, owner); }
  groups.get('b')!.position.x = 3; groups.get('b')!.scale.setScalar(2);
  const batches = new RoomBatches(); const disposeGeometry = jest.spyOn(geometry, 'dispose'); const disposeMaterial = jest.spyOn(material, 'dispose');
  batches.update(groups); expect(batches.root.children).toHaveLength(1);
  const mesh = batches.root.children[0] as import('three').InstancedMesh; const matrix = new Matrix4();
  mesh.getMatrixAt(1, matrix); expect(matrix.elements[12]).toBe(5); expect(matrix.elements[0]).toBe(2); expect(mesh.count).toBe(2);
  groups.get('a')!.visible = false; batches.update(groups); expect(mesh.count).toBe(1); expect(mesh.userData['owners']).toEqual(['b']);
  mesh.getMatrixAt(0, matrix); expect(matrix.elements[12]).toBe(5);
  const release = jest.spyOn(mesh, 'dispose'); groups.delete('a'); batches.update(groups); expect(release).toHaveBeenCalledTimes(1);
  batches.dispose(); batches.dispose(); expect(batches.root.children).toHaveLength(0); expect(disposeGeometry).not.toHaveBeenCalled(); expect(disposeMaterial).not.toHaveBeenCalled();
  geometry.dispose(); material.dispose();
});
