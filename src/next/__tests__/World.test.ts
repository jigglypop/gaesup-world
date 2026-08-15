import { entityGenerationOf, entityIndexOf, NextWorld } from '../core/World';

describe('NextWorld', () => {
  test('엔티티를 생성하면 살아있는 상태로 카운트된다', () => {
    const world = new NextWorld();
    const entity = world.createEntity();
    expect(world.isAlive(entity)).toBe(true);
    expect(world.entityCount).toBe(1);
  });

  test('파괴된 엔티티 ID는 세대 불일치로 더 이상 유효하지 않다', () => {
    const world = new NextWorld();
    const entity = world.createEntity();
    expect(world.destroyEntity(entity)).toBe(true);
    expect(world.isAlive(entity)).toBe(false);
    expect(world.destroyEntity(entity)).toBe(false);
    expect(world.entityCount).toBe(0);
  });

  test('파괴된 인덱스는 재사용되고 새 세대 ID를 받는다', () => {
    const world = new NextWorld();
    const first = world.createEntity();
    world.destroyEntity(first);
    const second = world.createEntity();
    expect(entityIndexOf(second)).toBe(entityIndexOf(first));
    expect(entityGenerationOf(second)).toBe(entityGenerationOf(first) + 1);
    expect(world.isAlive(first)).toBe(false);
    expect(world.isAlive(second)).toBe(true);
  });

  test('용량을 넘게 생성하면 저장소가 자동 확장된다', () => {
    const world = new NextWorld({ capacity: 2 });
    const entities = [world.createEntity(), world.createEntity(), world.createEntity()];
    expect(world.entityCount).toBe(3);
    expect(world.entityCapacity).toBeGreaterThanOrEqual(3);
    const out = new Float32Array(3);
    const lastEntity = entities[2];
    expect(lastEntity).toBeDefined();
    if (lastEntity === undefined) return;
    const index = entityIndexOf(lastEntity);
    world.transforms.setPosition(index, 7, 8, 9);
    world.transforms.readPosition(index, out);
    expect([out[0], out[1], out[2]]).toEqual([7, 8, 9]);
  });

  test('트랜스폼 읽기는 out 인자에 기록하여 호출당 할당이 없다', () => {
    const world = new NextWorld();
    const entity = world.createEntity();
    const index = entityIndexOf(entity);
    world.transforms.setPosition(index, 1, 2, 3);
    world.transforms.setRotation(index, 0, 0.5, 0, 0.5);
    const positionOut = new Float32Array(3);
    const rotationOut = new Float32Array(4);
    expect(world.transforms.readPosition(index, positionOut)).toBe(positionOut);
    expect(world.transforms.readRotation(index, rotationOut)).toBe(rotationOut);
    expect([positionOut[0], positionOut[1], positionOut[2]]).toEqual([1, 2, 3]);
    expect([rotationOut[0], rotationOut[1], rotationOut[2], rotationOut[3]]).toEqual([
      0, 0.5, 0, 0.5,
    ]);
  });

  test('트랜스폼 기본값은 항등 회전과 단위 스케일이다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    const rotationOut = new Float32Array(4);
    const scaleOut = new Float32Array(3);
    world.transforms.readRotation(index, rotationOut);
    world.transforms.readScale(index, scaleOut);
    expect([rotationOut[0], rotationOut[1], rotationOut[2], rotationOut[3]]).toEqual([0, 0, 0, 1]);
    expect([scaleOut[0], scaleOut[1], scaleOut[2]]).toEqual([1, 1, 1]);
  });

  test('originCell을 설정하고 읽을 수 있다', () => {
    const world = new NextWorld();
    const index = entityIndexOf(world.createEntity());
    world.transforms.setOriginCell(index, -3, 0, 12);
    const out = new Int32Array(3);
    world.transforms.readOriginCell(index, out);
    expect([out[0], out[1], out[2]]).toEqual([-3, 0, 12]);
  });

  test('엔티티 재사용 시 트랜스폼이 초기화된다', () => {
    const world = new NextWorld();
    const first = world.createEntity();
    const index = entityIndexOf(first);
    world.transforms.setPosition(index, 5, 5, 5);
    world.destroyEntity(first);
    const second = world.createEntity();
    expect(entityIndexOf(second)).toBe(index);
    const out = new Float32Array(3);
    world.transforms.readPosition(index, out);
    expect([out[0], out[1], out[2]]).toEqual([0, 0, 0]);
  });
});
