import { readFileSync } from 'fs';
import path from 'path';

import type { PlacedObject } from '../../../building/types';
import type { Aabb } from '../../types';
import { buildingToVoxelBoxes } from '../buildingVoxelBoxes';
import { glbBounds, gltfBounds } from '../modelBounds';
import { objectProxyBoxes } from '../objectProxies';

const UNIT: Aabb = { min: { x: -0.5, y: 0, z: -0.5 }, max: { x: 0.5, y: 1, z: 0.5 } };

function model(modelId: string, fallbackKind: string, extra: Partial<PlacedObject> = {}): PlacedObject {
  return {
    id: `${modelId}-1`,
    type: 'model',
    position: { x: 10, y: 0, z: -4 },
    config: { modelId, modelUrl: `gltf/${modelId}.glb`, modelScale: 2, modelFallbackKind: fallbackKind as never },
    ...extra,
  };
}

function bounds(url: string, box: Aabb = UNIT) {
  return new Map([[url, box]]);
}

describe('GI 오브젝트 대리 박스', () => {
  it('glTF의 접근자 경계와 노드 변환으로 모델 경계를 구하고 GLB에서도 JSON만 읽는다', () => {
    const json = {
      scenes: [{ nodes: [0] }],
      nodes: [{ translation: [1, 0, 0], scale: [2, 2, 2], children: [1] }, { mesh: 0, translation: [0, 1, 0] }],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      accessors: [{ min: [-1, 0, -1], max: [1, 1, 1] }],
    };
    expect(gltfBounds(json)).toEqual({ min: { x: -1, y: 2, z: -2 }, max: { x: 3, y: 4, z: 2 } });

    const file = readFileSync(path.resolve(process.cwd(), 'public/gltf/props/table.glb'));
    const box = glbBounds(file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength));
    expect(box).not.toBeNull();
    expect((box!.max.y - box!.min.y) * 0.9).toBeCloseTo(0.74, 2);
    expect(glbBounds(new ArrayBuffer(8))).toBeNull();
  });

  it('탁자는 상판, 의자는 좌판까지, 조명은 빛나는 머리만 넣는다', () => {
    const [top] = objectProxyBoxes(model('table-basic', 'table'), bounds('gltf/table-basic.glb'));
    if (!top) throw new Error('no table top');
    expect(top.min.y).toBeCloseTo(1.72, 6);
    expect(top.max.y).toBeCloseTo(2, 6);
    expect(top.max.x - top.min.x).toBeCloseTo(2, 6);

    const [seat] = objectProxyBoxes(model('chair-basic', 'chair'), bounds('gltf/chair-basic.glb'));
    expect(seat?.max.y).toBeCloseTo(1.1, 6);

    const lamp = objectProxyBoxes(model('lamp-basic', 'lamp'), bounds('gltf/lamp-basic.glb'));
    expect(lamp).toHaveLength(1);
    expect(lamp[0]?.emissive?.every((channel) => channel > 0)).toBe(true);
    expect(lamp[0]?.min.y).toBeCloseTo(1.4, 6);
  });

  it('나무는 줄기와 수관 두 덩이, 꽃·울타리·창은 빼고, 돌리면 박스도 돌린다', () => {
    const tree = objectProxyBoxes(model('nature-tree-oak', 'generic'), bounds('gltf/nature-tree-oak.glb'));
    expect(tree).toHaveLength(2);
    expect(tree[1]!.min.y).toBeGreaterThan(tree[0]!.min.y);
    expect(objectProxyBoxes(model('nature-flower-red', 'generic'), bounds('gltf/nature-flower-red.glb'))).toEqual([]);
    expect(objectProxyBoxes(model('fence-basic', 'fence'), bounds('gltf/fence-basic.glb'))).toEqual([]);

    const long: Aabb = { min: { x: -1, y: 0, z: -0.25 }, max: { x: 1, y: 1, z: 0.25 } };
    const [straight] = objectProxyBoxes(model('bed-basic', 'bed'), bounds('gltf/bed-basic.glb', long));
    const [turned] = objectProxyBoxes(model('bed-basic', 'bed', { rotation: Math.PI / 2 }), bounds('gltf/bed-basic.glb', long));
    expect(straight!.max.x - straight!.min.x).toBeGreaterThan(straight!.max.z - straight!.min.z);
    expect(turned!.max.z - turned!.min.z).toBeGreaterThan(turned!.max.x - turned!.min.x);
  });

  it('절차 나무는 크기로, 경계를 모르는 모델은 알 때까지 뺀다', () => {
    const sakura: PlacedObject = { id: 's', type: 'sakura', position: { x: 0, y: 1, z: 0 }, config: { size: 4 } };
    const boxes = objectProxyBoxes(sakura, new Map());
    expect(boxes).toHaveLength(2);
    expect(boxes[0]!.min.y).toBeCloseTo(1, 6);
    expect(objectProxyBoxes(model('storage-basic', 'storage'), new Map())).toEqual([]);
  });

  it('buildingToVoxelBoxes는 modelBounds를 줄 때만 오브젝트를 넣는다', () => {
    const source = {
      meshes: new Map(),
      tileGroups: new Map(),
      wallGroups: new Map(),
      blocks: [],
      objects: [model('storage-basic', 'storage')],
    };
    expect(buildingToVoxelBoxes(source)).toEqual([]);
    expect(buildingToVoxelBoxes(source, bounds('gltf/storage-basic.glb'))).toHaveLength(1);
  });
});
