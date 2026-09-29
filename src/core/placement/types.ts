import type { GridAdapter } from '../grid';

export type PlacementSubject = {
  id: string;
  type: string;
  tags?: string[];
};

export type Footprint<TCoord = unknown> = {
  kind: 'cell' | 'edge' | 'corner' | 'free' | 'volume';
  coords?: TCoord[];
};

export type PlacementRequest<TCoord = unknown> = {
  subject: PlacementSubject;
  coord: TCoord;
  footprint?: Footprint<TCoord>;
  rotation?: number;
};

export type PlacementEntry<TCoord = unknown> = {
  id: string;
  subject: PlacementSubject;
  coord: TCoord;
  footprint: Footprint<TCoord>;
  rotation?: number;
};

export type PlacementResult = {
  ok: boolean;
  reason?: string;
  ruleId?: string;
};

export type PlacementContext<TCoord = unknown> = {
  request: PlacementRequest<TCoord>;
  entries: ReadonlyMap<string, PlacementEntry<TCoord>>;
  adapter: GridAdapter<TCoord>;
  getOccupants(coord: TCoord): PlacementEntry<TCoord>[];
};

export type PlacementRule<TCoord = unknown> = {
  id: string;
  test(ctx: PlacementContext<TCoord>): PlacementResult;
};

export type PlacementTransactionType = 'place' | 'remove' | 'move' | 'rotate';

export type PlacementTransaction<TCoord = unknown> = {
  type: PlacementTransactionType;
  before?: PlacementEntry<TCoord>;
  after?: PlacementEntry<TCoord>;
};

export type PlacementEngineOptions<TCoord = unknown> = {
  adapter: GridAdapter<TCoord>;
  rules?: Array<PlacementRule<TCoord>>;
};

