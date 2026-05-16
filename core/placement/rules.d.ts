import type { PlacementResult, PlacementRule } from './types';
export declare const placementOk: () => PlacementResult;
export declare const placementRejected: (reason: string, ruleId?: string) => PlacementResult;
export declare function createNoOverlapRule<TCoord = unknown>(): PlacementRule<TCoord>;
