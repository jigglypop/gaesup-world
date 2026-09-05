import type { PlacementContext, PlacementResult, PlacementRule } from './types';

export const placementOk = (): PlacementResult => ({ ok: true });

export const placementRejected = (reason: string, ruleId?: string): PlacementResult => {
  const result: PlacementResult = { ok: false, reason };
  if (ruleId !== undefined) {
    result.ruleId = ruleId;
  }
  return result;
};

export function createNoOverlapRule<TCoord = unknown>(): PlacementRule<TCoord> {
  return {
    id: 'no-overlap',
    test(ctx: PlacementContext<TCoord>) {
      const coords = ctx.request.footprint?.coords ?? [ctx.request.coord];
      for (const coord of coords) {
        const occupants = ctx
          .getOccupants(coord)
          .filter((entry) => entry.id !== ctx.request.subject.id);
        if (occupants.length > 0) {
          return placementRejected('Target coordinate is already occupied.', 'no-overlap');
        }
      }
      return placementOk();
    },
  };
}

