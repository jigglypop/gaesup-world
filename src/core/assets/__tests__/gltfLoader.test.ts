import * as THREE from 'three';

import { createGLTFLoader } from '../gltfLoader';

const FLOAT_COMPONENT = 5126;
const VERTEX_STRIDE = 12;
const POSITIONS = [0, 0, 0, 1, 0, 0, 0, 1, 0];
const VERTEX_COUNT = POSITIONS.length / 3;
/** `MeshoptEncoder.encodeGltfBuffer(POSITIONS, 3, 12, 'ATTRIBUTES')` from the `meshoptimizer` devDependency. */
const ENCODED_POSITIONS = 'oAAAATwAAAD//wE8AAAAfn0AAAEMAAAA/wEMAAAAfgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==';
const ENCODED_BYTE_LENGTH = 67;
const GLB_MAGIC = 0x46546c67;
const GLB_VERSION = 2;
const GLB_HEADER_BYTES = 12;
const GLB_CHUNK_HEADER_BYTES = 8;
const GLB_JSON_CHUNK = 0x4e4f534a;
const GLB_BIN_CHUNK = 0x004e4942;
const SPACE = 0x20;

function padded(bytes: Uint8Array, fill: number): Uint8Array {
  const length = Math.ceil(bytes.length / 4) * 4;
  const out = new Uint8Array(length).fill(fill);
  out.set(bytes);
  return out;
}

function toGlb(json: string, bin: Uint8Array): ArrayBuffer {
  const jsonChunk = padded(new TextEncoder().encode(json), SPACE);
  const binChunk = padded(bin, 0);
  const total = GLB_HEADER_BYTES + GLB_CHUNK_HEADER_BYTES * 2 + jsonChunk.length + binChunk.length;
  const glb = new ArrayBuffer(total);
  const view = new DataView(glb);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, GLB_VERSION, true);
  view.setUint32(8, total, true);
  let offset = GLB_HEADER_BYTES;
  for (const [type, chunk] of [[GLB_JSON_CHUNK, jsonChunk], [GLB_BIN_CHUNK, binChunk]] as const) {
    view.setUint32(offset, chunk.length, true);
    view.setUint32(offset + 4, type, true);
    new Uint8Array(glb, offset + GLB_CHUNK_HEADER_BYTES, chunk.length).set(chunk);
    offset += GLB_CHUNK_HEADER_BYTES + chunk.length;
  }
  return glb;
}

function createMeshoptGltf(): string {
  const rawLength = POSITIONS.length * Float32Array.BYTES_PER_ELEMENT;
  return JSON.stringify({
    asset: { version: '2.0' },
    extensionsUsed: ['EXT_meshopt_compression'],
    extensionsRequired: ['EXT_meshopt_compression'],
    buffers: [
      { byteLength: ENCODED_BYTE_LENGTH },
      { byteLength: rawLength, extensions: { EXT_meshopt_compression: { fallback: true } } },
    ],
    bufferViews: [{
      buffer: 1,
      byteLength: rawLength,
      byteStride: VERTEX_STRIDE,
      extensions: {
        EXT_meshopt_compression: {
          buffer: 0,
          byteLength: ENCODED_BYTE_LENGTH,
          byteStride: VERTEX_STRIDE,
          count: VERTEX_COUNT,
          mode: 'ATTRIBUTES',
        },
      },
    }],
    accessors: [{ bufferView: 0, componentType: FLOAT_COMPONENT, count: VERTEX_COUNT, type: 'VEC3', min: [0, 0, 0], max: [1, 1, 0] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }],
    scene: 0,
  });
}

test('the shared glTF loader decodes meshopt-compressed pipeline output', async () => {
  const glb = toGlb(createMeshoptGltf(), Uint8Array.from(Buffer.from(ENCODED_POSITIONS, 'base64')));
  const gltf = await createGLTFLoader().parseAsync(glb, '');
  let positions: ArrayLike<number> | undefined;
  gltf.scene.traverse((object) => {
    if (object instanceof THREE.Mesh) positions = (object.geometry as THREE.BufferGeometry).getAttribute('position').array;
  });
  expect(Array.from(positions ?? [])).toEqual(POSITIONS);
});
