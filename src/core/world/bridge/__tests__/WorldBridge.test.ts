import 'reflect-metadata';
import * as THREE from 'three';

import { WorldBridge } from '../WorldBridge';

const WORLD_ID = 'world';

const objectAt = (type: string, x: number) => ({
  type,
  position: new THREE.Vector3(x, 0, 0),
  rotation: new THREE.Euler(),
  scale: new THREE.Vector3(1, 1, 1),
});

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

    bridge.addObject(WORLD_ID, objectAt('npc', 0));
    bridge.addObject(WORLD_ID, objectAt('npc', 1));

    expect(counts).toEqual([1, 2]);
  });

  test('조회 함수는 스냅샷마다 새로 만들지 않고 현재 월드를 읽는다', () => {
    const first = bridge.snapshot(WORLD_ID);
    const objectId = bridge.addObject(WORLD_ID, objectAt('item', 2));
    const second = bridge.snapshot(WORLD_ID);

    expect(second?.objects).not.toBe(first?.objects);
    expect(second?.objectsInRadius).toBe(first?.objectsInRadius);
    expect(second?.objectsByType).toBe(first?.objectsByType);
    expect(second?.raycast).toBe(first?.raycast);
    expect(first?.objectsByType?.('item').map((object) => object.id)).toEqual([objectId]);
    expect(first?.objectsInRadius?.(new THREE.Vector3(), 5)).toHaveLength(1);
  });
});
