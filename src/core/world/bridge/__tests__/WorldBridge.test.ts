import 'reflect-metadata';
import * as THREE from 'three';

import { WorldBridge } from '../WorldBridge';

const WORLD_ID = 'world';

describe('WorldBridge snapshot', () => {
  let bridge: WorldBridge;

  beforeEach(() => {
    bridge = new WorldBridge();
    bridge.register(WORLD_ID);
  });

  afterEach(() => {
    bridge.dispose();
  });

  test('같은 틱에 연속 실행한 명령도 최신 스냅샷을 알린다', () => {
    const counts: number[] = [];
    bridge.subscribe((snapshot) => {
      counts.push(snapshot.objects.length);
    });

    bridge.addObject(WORLD_ID, { type: 'npc', position: new THREE.Vector3(0, 0, 0) });
    bridge.addObject(WORLD_ID, { type: 'npc', position: new THREE.Vector3(1, 0, 0) });

    expect(counts).toEqual([1, 2]);
  });

  test('조회 함수는 스냅샷마다 새로 만들지 않고 현재 월드를 읽는다', () => {
    const first = bridge.snapshot(WORLD_ID);
    const objectId = bridge.addObject(WORLD_ID, { type: 'item', position: new THREE.Vector3(2, 0, 0) });
    const second = bridge.snapshot(WORLD_ID);

    expect(second?.objects).not.toBe(first?.objects);
    expect(second?.objectsInRadius).toBe(first?.objectsInRadius);
    expect(second?.objectsByType).toBe(first?.objectsByType);
    expect(second?.raycast).toBe(first?.raycast);
    expect(first?.objectsByType?.('item').map((object) => object.id)).toEqual([objectId]);
    expect(first?.objectsInRadius?.(new THREE.Vector3(), 5)).toHaveLength(1);
  });
});
