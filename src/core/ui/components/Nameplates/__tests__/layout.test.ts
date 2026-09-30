import { placeNameplates } from '../layout';

const label = (id: string, x: number, y: number, distance: number) => ({ id, x, y, width: 80, height: 22, distance });

test('the nearest labels show first, up to the limit, and one covering a nearer label waits', () => {
  const shown = placeNameplates([
    label('far', 500, 200, 20),
    label('near', 100, 100, 3),
    label('behind-near', 130, 110, 6),
    label('beside', 300, 100, 8),
    label('next', 100, 200, 10),
  ], 3);
  expect(shown.map((plate) => plate.id)).toEqual(['near', 'beside', 'next']);
  expect(placeNameplates([label('a', 0, 0, 1), label('b', 200, 0, 2)], 6)).toHaveLength(2);
  expect(placeNameplates([label('a', 0, 0, 1)], 0)).toHaveLength(0);
});
