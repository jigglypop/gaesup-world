import { Box3, DefaultLoadingManager, Matrix4, Quaternion, Vector3 } from 'three';

import type { Aabb } from '../types';

type GltfAccessor = { min?: number[]; max?: number[]; normalized?: boolean; componentType?: number };
type GltfNode = {
  children?: number[];
  mesh?: number;
  matrix?: number[];
  translation?: number[];
  rotation?: number[];
  scale?: number[];
};
type GltfJson = {
  scene?: number;
  scenes?: { nodes?: number[] }[];
  nodes?: GltfNode[];
  meshes?: { primitives?: { attributes?: { POSITION?: number } }[] }[];
  accessors?: GltfAccessor[];
};

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const GLB_HEADER = 12;
const CHUNK_HEADER = 8;
/** Normalized integer positions (KHR_mesh_quantization) keep raw integers in min/max; these divide them back. */
const NORMALIZED_RANGE: Record<number, number> = { 5120: 127, 5121: 255, 5122: 32767, 5123: 65535 };

const cache = new Map<string, Promise<Aabb | null>>();

function accessorCorner(accessor: GltfAccessor, values: number[]): number[] {
  const range = accessor.normalized && accessor.componentType ? NORMALIZED_RANGE[accessor.componentType] : undefined;
  return range ? values.map((value) => Math.max(value / range, -1)) : values;
}

/** Local bounding box of a glTF's default scene from the accessors' min/max; no geometry is decoded. */
export function gltfBounds(json: GltfJson): Aabb | null {
  const box = new Box3();
  const part = new Box3();
  const translation = new Vector3();
  const rotation = new Quaternion();
  const scale = new Vector3();
  const visit = (index: number, parent: Matrix4, depth: number) => {
    const node = json.nodes?.[index];
    if (!node || depth > 64) return;
    const local = node.matrix
      ? new Matrix4().fromArray(node.matrix)
      : new Matrix4().compose(
          translation.fromArray(node.translation ?? [0, 0, 0]),
          rotation.fromArray(node.rotation ?? [0, 0, 0, 1]),
          scale.fromArray(node.scale ?? [1, 1, 1]),
        );
    const world = parent.clone().multiply(local);
    const mesh = node.mesh === undefined ? undefined : json.meshes?.[node.mesh];
    for (const primitive of mesh?.primitives ?? []) {
      const position = primitive.attributes?.POSITION;
      const accessor = position === undefined ? undefined : json.accessors?.[position];
      if (!accessor?.min || !accessor.max) continue;
      part.min.fromArray(accessorCorner(accessor, accessor.min));
      part.max.fromArray(accessorCorner(accessor, accessor.max));
      box.union(part.applyMatrix4(world));
    }
    for (const child of node.children ?? []) visit(child, world, depth + 1);
  };
  const scene = json.scenes?.[json.scene ?? 0];
  for (const root of scene?.nodes ?? []) visit(root, new Matrix4(), 0);
  if (box.isEmpty()) return null;
  return {
    min: { x: box.min.x, y: box.min.y, z: box.min.z },
    max: { x: box.max.x, y: box.max.y, z: box.max.z },
  };
}

/** The same box for a binary glTF, read from its JSON chunk alone. */
export function glbBounds(buffer: ArrayBuffer): Aabb | null {
  const view = new DataView(buffer);
  if (view.byteLength < GLB_HEADER + CHUNK_HEADER || view.getUint32(0, true) !== GLB_MAGIC) return null;
  const length = view.getUint32(GLB_HEADER, true);
  if (view.getUint32(GLB_HEADER + 4, true) !== JSON_CHUNK) return null;
  const start = GLB_HEADER + CHUNK_HEADER;
  if (start + length > view.byteLength) return null;
  try {
    return gltfBounds(JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, start, length))) as GltfJson);
  } catch {
    return null;
  }
}

/**
 * A model's local bounds, fetched once per URL (resolved like the engine's glTF loader, so the HTTP cache usually
 * answers). null when the file cannot be read; GI then leaves that model out.
 */
export function loadModelBounds(uri: string): Promise<Aabb | null> {
  let pending = cache.get(uri);
  if (!pending) {
    pending = fetch(DefaultLoadingManager.resolveURL(uri))
      .then(async (response) => {
        if (!response.ok) return null;
        if (/\.gltf(\?|$)/i.test(uri)) return gltfBounds((await response.json()) as GltfJson);
        return glbBounds(await response.arrayBuffer());
      })
      .catch(() => null);
    cache.set(uri, pending);
  }
  return pending;
}
