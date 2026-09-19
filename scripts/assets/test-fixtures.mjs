import { Document, NodeIO } from '@gltf-transform/core';

export async function createTestGlb() {
  const document = new Document();
  const buffer = document.createBuffer();
  const position = document.createAccessor().setType('VEC3').setBuffer(buffer)
    .setArray(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 1]));
  const mesh = document.createMesh().addPrimitive(document.createPrimitive().setAttribute('POSITION', position));
  document.createScene().addChild(document.createNode().setMesh(mesh));
  return new NodeIO().writeBinary(document);
}
