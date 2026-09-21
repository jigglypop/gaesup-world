import { Group, InstancedMesh, Matrix4, Mesh, type MeshStandardMaterial } from 'three';

type Part = { owner: Group; mesh: Mesh; matrix: Matrix4 };
type Batch = { mesh: InstancedMesh; parts: Part[] };

/** Logical furniture stays separate for commands/export; matching parts share GPU draw calls. */
export class RoomBatches {
  readonly root = new Group();
  private batches: Batch[] = [];
  private identity = '';
  private matrix = new Matrix4();

  update(groups: ReadonlyMap<string, Group>): void {
    const identity = [...groups].map(([id, group]) => `${id}:${group.uuid}`).join('|');
    if (identity !== this.identity) {
      this.dispose(); this.identity = identity;
      const buckets = new Map<string, Part[]>();
      for (const owner of groups.values()) {
        owner.updateMatrix();
        owner.traverse(object => {
          if (!(object instanceof Mesh)) return;
          object.updateMatrix();
          const material = object.material as MeshStandardMaterial;
          const key = `${object.geometry.uuid}:${material.uuid}`;
          const parts = buckets.get(key) ?? [];
          parts.push({ owner, mesh: object, matrix: object.matrix.clone() }); buckets.set(key, parts);
        });
      }
      for (const parts of buckets.values()) {
        const first = parts[0]!;
        const mesh = new InstancedMesh(first.mesh.geometry, first.mesh.material, parts.length);
        mesh.name = `가구 배치 · ${first.owner.name} · ${(first.mesh.material as MeshStandardMaterial).name}`;
        mesh.castShadow = true; mesh.receiveShadow = true;
        mesh.userData['owners'] = parts.map(part => String(part.owner.userData['objectId']));
        this.root.add(mesh); this.batches.push({ mesh, parts });
      }
    }
    for (const owner of groups.values()) owner.updateMatrix();
    for (const batch of this.batches) {
      const owners: string[] = []; let count = 0;
      for (const part of batch.parts) {
        if (!part.owner.visible) continue;
        this.matrix.multiplyMatrices(part.owner.matrix, part.matrix);
        batch.mesh.setMatrixAt(count++, this.matrix); owners.push(String(part.owner.userData['objectId']));
      }
      batch.mesh.count = count; batch.mesh.visible = count > 0;
      batch.mesh.userData['owners'] = owners;
      batch.mesh.instanceMatrix.needsUpdate = true;
      batch.mesh.computeBoundingBox(); batch.mesh.computeBoundingSphere();
    }
  }

  dispose(): void {
    for (const batch of this.batches) { batch.mesh.removeFromParent(); batch.mesh.dispose(); }
    this.batches = []; this.identity = '';
  }
}
