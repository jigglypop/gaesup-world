import type { GridAdapter } from '../grid';
import { placementOk } from './rules';
import type {
  Footprint,
  PlacementEngineOptions,
  PlacementEntry,
  PlacementRequest,
  PlacementResult,
  PlacementRule,
  PlacementTransaction,
} from './types';

export class PlacementRejectedError extends Error {
  readonly result: PlacementResult;

  constructor(result: PlacementResult) {
    super(result.reason ?? 'Placement request was rejected.');
    this.name = 'PlacementRejectedError';
    this.result = result;
  }
}

export class MissingPlacementEntryError extends Error {
  constructor(id: string) {
    super(`Placement entry "${id}" does not exist.`);
    this.name = 'MissingPlacementEntryError';
  }
}

export class PlacementEngine<TCoord = unknown> {
  private readonly adapter: GridAdapter<TCoord>;
  private readonly rules: Array<PlacementRule<TCoord>>;
  private readonly entries = new Map<string, PlacementEntry<TCoord>>();
  private readonly occupied = new Map<string, Set<string>>();

  constructor(options: PlacementEngineOptions<TCoord>) {
    this.adapter = options.adapter;
    this.rules = [...(options.rules ?? [])];
  }

  use(rule: PlacementRule<TCoord>): void {
    this.rules.push(rule);
  }

  canPlace(request: PlacementRequest<TCoord>): PlacementResult {
    const ctx = {
      request,
      entries: this.entries,
      adapter: this.adapter,
      getOccupants: (coord: TCoord) => this.getOccupants(coord),
    };

    for (const rule of this.rules) {
      const result = rule.test(ctx);
      if (!result.ok) {
        return result.ruleId === undefined ? { ...result, ruleId: rule.id } : result;
      }
    }

    return placementOk();
  }

  place(request: PlacementRequest<TCoord>): PlacementTransaction<TCoord> {
    const result = this.canPlace(request);
    if (!result.ok) {
      throw new PlacementRejectedError(result);
    }

    const entry = this.toEntry(request);
    const previous = this.entries.get(entry.id);
    if (previous) {
      this.unindex(previous);
    }
    this.entries.set(entry.id, entry);
    this.index(entry);

    const transaction: PlacementTransaction<TCoord> = { type: 'place', after: entry };
    if (previous) {
      transaction.before = previous;
    }
    return transaction;
  }

  remove(id: string): PlacementTransaction<TCoord> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new MissingPlacementEntryError(id);
    }

    this.unindex(entry);
    this.entries.delete(id);
    return { type: 'remove', before: entry };
  }

  move(id: string, coord: TCoord, footprint?: Footprint<TCoord>): PlacementTransaction<TCoord> {
    const previous = this.requireEntry(id);
    const request: PlacementRequest<TCoord> = {
      subject: previous.subject,
      coord,
      footprint: footprint ?? this.moveFootprint(previous, coord),
    };
    if (previous.rotation !== undefined) {
      request.rotation = previous.rotation;
    }

    const result = this.canPlace(request);
    if (!result.ok) {
      throw new PlacementRejectedError(result);
    }

    const next = this.toEntry(request);
    this.unindex(previous);
    this.entries.set(id, next);
    this.index(next);
    return { type: 'move', before: previous, after: next };
  }

  rotate(id: string, rotation: number): PlacementTransaction<TCoord> {
    const previous = this.requireEntry(id);
    const next: PlacementEntry<TCoord> = {
      ...previous,
      rotation,
    };
    this.entries.set(id, next);
    return { type: 'rotate', before: previous, after: next };
  }

  get(id: string): PlacementEntry<TCoord> | undefined {
    return this.entries.get(id);
  }

  list(): Array<PlacementEntry<TCoord>> {
    return Array.from(this.entries.values());
  }

  getOccupants(coord: TCoord): Array<PlacementEntry<TCoord>> {
    const ids = this.occupied.get(this.adapter.key(coord));
    if (!ids) return [];
    return Array.from(ids)
      .map((id) => this.entries.get(id))
      .filter((entry): entry is PlacementEntry<TCoord> => entry !== undefined);
  }

  clear(): void {
    this.entries.clear();
    this.occupied.clear();
  }

  private toEntry(request: PlacementRequest<TCoord>): PlacementEntry<TCoord> {
    const entry: PlacementEntry<TCoord> = {
      id: request.subject.id,
      subject: request.subject,
      coord: request.coord,
      footprint: request.footprint ?? { kind: 'cell', coords: [request.coord] },
    };
    if (request.rotation !== undefined) {
      entry.rotation = request.rotation;
    }
    return entry;
  }

  private requireEntry(id: string): PlacementEntry<TCoord> {
    const entry = this.entries.get(id);
    if (!entry) {
      throw new MissingPlacementEntryError(id);
    }
    return entry;
  }

  private index(entry: PlacementEntry<TCoord>): void {
    for (const coord of this.getFootprintCoords(entry)) {
      const key = this.adapter.key(coord);
      const ids = this.occupied.get(key) ?? new Set<string>();
      ids.add(entry.id);
      this.occupied.set(key, ids);
    }
  }

  private unindex(entry: PlacementEntry<TCoord>): void {
    for (const coord of this.getFootprintCoords(entry)) {
      const key = this.adapter.key(coord);
      const ids = this.occupied.get(key);
      if (!ids) continue;
      ids.delete(entry.id);
      if (ids.size === 0) {
        this.occupied.delete(key);
      }
    }
  }

  private getFootprintCoords(entry: PlacementEntry<TCoord>): TCoord[] {
    return entry.footprint.coords ?? [entry.coord];
  }

  private moveFootprint(entry: PlacementEntry<TCoord>, coord: TCoord): Footprint<TCoord> {
    const coords = entry.footprint.coords;
    if (
      coords !== undefined &&
      coords.length === 1 &&
      coords[0] !== undefined &&
      this.adapter.equals(coords[0], entry.coord)
    ) {
      return { ...entry.footprint, coords: [coord] };
    }
    return entry.footprint;
  }
}

export function createPlacementEngine<TCoord = unknown>(
  options: PlacementEngineOptions<TCoord>,
): PlacementEngine<TCoord> {
  return new PlacementEngine(options);
}
