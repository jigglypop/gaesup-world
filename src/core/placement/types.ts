import type { GridAdapter } from '../grid';

export interface PlacementSubject {
  id: string;
  type: string;
  tags?: string[];
}

export interface Footprint<TCoord = unknown> {
  kind: 'cell' | 'edge' | 'corner' | 'free' | 'volume';
  coords?: TCoord[];
}

export interface PlacementRequest<TCoord = unknown> {
  subject: PlacementSubject;
  coord: TCoord;
  footprint?: Footprint<TCoord>;
  rotation?: number;
}

export interface PlacementEntry<TCoord = unknown> {
  id: string;
  subject: PlacementSubject;
  coord: TCoord;
  footprint: Footprint<TCoord>;
  rotation?: number;
}

export interface PlacementResult {
  ok: boolean;
  reason?: string;
  ruleId?: string;
}

export interface PlacementContext<TCoord = unknown> {
  request: PlacementRequest<TCoord>;
  entries: ReadonlyMap<string, PlacementEntry<TCoord>>;
  adapter: GridAdapter<TCoord>;
  getOccupants(coord: TCoord): PlacementEntry<TCoord>[];
}

export interface PlacementRule<TCoord = unknown> {
  id: string;
  test(ctx: PlacementContext<TCoord>): PlacementResult;
}

export type PlacementTransactionType = 'place' | 'remove' | 'move' | 'rotate';

export interface PlacementTransaction<TCoord = unknown> {
  type: PlacementTransactionType;
  before?: PlacementEntry<TCoord>;
  after?: PlacementEntry<TCoord>;
}

export interface PlacementEngineOptions<TCoord = unknown> {
  adapter: GridAdapter<TCoord>;
  rules?: Array<PlacementRule<TCoord>>;
}

