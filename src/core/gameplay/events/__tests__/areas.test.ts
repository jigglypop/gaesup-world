import { createGameplayAreas } from '../areas';

test('an area reports an entry once, and again only after the point has left', () => {
  const entered: string[] = [];
  const areas = createGameplayAreas((id) => entered.push(id));
  const remove = areas.register({ id: 'plaza', center: [0, 0, 0], size: [4, 2, 4] });

  areas.update({ x: 0, y: 0, z: 0 });
  areas.update({ x: 1.9, y: 0.9, z: -1.9 });
  expect(entered).toEqual(['plaza']);

  areas.update({ x: 2.1, y: 0, z: 0 });
  areas.update(undefined);
  areas.update({ x: 0, y: 0, z: 0 });
  expect(entered).toEqual(['plaza', 'plaza']);

  areas.reset();
  areas.update({ x: 0, y: 0, z: 0 });
  expect(entered).toHaveLength(3);

  remove();
  areas.update({ x: 5, y: 0, z: 0 });
  areas.update({ x: 0, y: 0, z: 0 });
  expect(entered).toHaveLength(3);
  expect(areas.list()).toEqual([]);
});
