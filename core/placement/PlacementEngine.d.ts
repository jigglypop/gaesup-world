import type { Footprint, PlacementEngineOptions, PlacementEntry, PlacementRequest, PlacementResult, PlacementRule, PlacementTransaction } from './types';
export declare class PlacementRejectedError extends Error {
    readonly result: PlacementResult;
    constructor(result: PlacementResult);
}
export declare class MissingPlacementEntryError extends Error {
    constructor(id: string);
}
export declare class PlacementEngine<TCoord = unknown> {
    private readonly adapter;
    private readonly rules;
    private readonly entries;
    private readonly occupied;
    constructor(options: PlacementEngineOptions<TCoord>);
    use(rule: PlacementRule<TCoord>): void;
    canPlace(request: PlacementRequest<TCoord>): PlacementResult;
    place(request: PlacementRequest<TCoord>): PlacementTransaction<TCoord>;
    remove(id: string): PlacementTransaction<TCoord>;
    move(id: string, coord: TCoord, footprint?: Footprint<TCoord>): PlacementTransaction<TCoord>;
    rotate(id: string, rotation: number): PlacementTransaction<TCoord>;
    get(id: string): PlacementEntry<TCoord> | undefined;
    list(): Array<PlacementEntry<TCoord>>;
    getOccupants(coord: TCoord): Array<PlacementEntry<TCoord>>;
    clear(): void;
    private toEntry;
    private requireEntry;
    private index;
    private unindex;
    private getFootprintCoords;
    private moveFootprint;
}
export declare function createPlacementEngine<TCoord = unknown>(options: PlacementEngineOptions<TCoord>): PlacementEngine<TCoord>;
