import { SquareGridAdapter } from '../../grid';
import {
  createNoOverlapRule,
  createPlacementEngine,
  MissingPlacementEntryError,
  PlacementRejectedError,
  placementRejected,
} from '../index';
import type { CellCoord, PlacementRule, PlacementSubject } from '../index';

const subject = (id: string, type = 'furniture'): PlacementSubject => ({ id, type });
const coord = (x: number, z: number, level = 0): CellCoord => ({ x, z, level });

describe('PlacementEngine', () => {
  it('places entries and indexes occupants by grid coordinate', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    const transaction = engine.place({
      subject: subject('chair'),
      coord: coord(1, 2),
    });

    expect(transaction.type).toBe('place');
    expect(transaction.after?.id).toBe('chair');
    expect(engine.get('chair')?.coord).toEqual(coord(1, 2));
    expect(engine.getOccupants(coord(1, 2)).map((entry) => entry.id)).toEqual(['chair']);
  });

  it('rejects overlap through the no-overlap rule', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({ subject: subject('chair'), coord: coord(0, 0) });

    expect(() => {
      engine.place({ subject: subject('table'), coord: coord(0, 0) });
    }).toThrow(PlacementRejectedError);
  });

  it('indexes multi-cell footprints', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({
      subject: subject('bed'),
      coord: coord(0, 0),
      footprint: {
        kind: 'cell',
        coords: [coord(0, 0), coord(1, 0)],
      },
    });

    expect(engine.getOccupants(coord(0, 0)).map((entry) => entry.id)).toEqual(['bed']);
    expect(engine.getOccupants(coord(1, 0)).map((entry) => entry.id)).toEqual(['bed']);
    expect(engine.canPlace({ subject: subject('lamp'), coord: coord(1, 0) })).toEqual({
      ok: false,
      reason: 'Target coordinate is already occupied.',
      ruleId: 'no-overlap',
    });
  });

  it('moves entries and updates the occupancy index', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({ subject: subject('chair'), coord: coord(0, 0) });
    const transaction = engine.move('chair', coord(2, 0));

    expect(transaction.type).toBe('move');
    expect(transaction.before?.coord).toEqual(coord(0, 0));
    expect(transaction.after?.coord).toEqual(coord(2, 0));
    expect(engine.getOccupants(coord(0, 0))).toEqual([]);
    expect(engine.getOccupants(coord(2, 0)).map((entry) => entry.id)).toEqual(['chair']);
  });

  it('lets an entry move inside its own occupied footprint', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({
      subject: subject('rug'),
      coord: coord(0, 0),
      footprint: { kind: 'cell', coords: [coord(0, 0), coord(1, 0)] },
    });

    expect(() => {
      engine.move('rug', coord(0, 0), {
        kind: 'cell',
        coords: [coord(1, 0), coord(2, 0)],
      });
    }).not.toThrow();
  });

  it('rotates entries without changing occupancy', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({ subject: subject('sofa'), coord: coord(0, 0), rotation: 0 });
    const transaction = engine.rotate('sofa', 90);

    expect(transaction.type).toBe('rotate');
    expect(transaction.before?.rotation).toBe(0);
    expect(transaction.after?.rotation).toBe(90);
    expect(engine.getOccupants(coord(0, 0)).map((entry) => entry.id)).toEqual(['sofa']);
  });

  it('removes entries and throws when missing entries are targeted', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [createNoOverlapRule()],
    });

    engine.place({ subject: subject('chair'), coord: coord(0, 0) });
    const transaction = engine.remove('chair');

    expect(transaction.type).toBe('remove');
    expect(transaction.before?.id).toBe('chair');
    expect(engine.get('chair')).toBeUndefined();
    expect(engine.getOccupants(coord(0, 0))).toEqual([]);
    expect(() => engine.remove('chair')).toThrow(MissingPlacementEntryError);
    expect(() => engine.move('chair', coord(1, 0))).toThrow(MissingPlacementEntryError);
    expect(() => engine.rotate('chair', 90)).toThrow(MissingPlacementEntryError);
  });

  it('supports custom placement rules', () => {
    const rejectBlockedTags: PlacementRule<CellCoord> = {
      id: 'reject-blocked-tags',
      test(ctx) {
        return ctx.request.subject.tags?.includes('blocked')
          ? placementRejected('Blocked tags cannot be placed.')
          : { ok: true };
      },
    };
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
      rules: [rejectBlockedTags],
    });

    expect(engine.canPlace({
      subject: { ...subject('crate'), tags: ['blocked'] },
      coord: coord(0, 0),
    })).toEqual({
      ok: false,
      reason: 'Blocked tags cannot be placed.',
      ruleId: 'reject-blocked-tags',
    });
  });

  it('can add rules after construction and clear all entries', () => {
    const engine = createPlacementEngine({
      adapter: new SquareGridAdapter(),
    });

    engine.place({ subject: subject('chair'), coord: coord(0, 0) });
    engine.use(createNoOverlapRule());

    expect(engine.canPlace({ subject: subject('table'), coord: coord(0, 0) }).ok).toBe(false);

    engine.clear();
    expect(engine.list()).toEqual([]);
    expect(engine.getOccupants(coord(0, 0))).toEqual([]);
  });
});

