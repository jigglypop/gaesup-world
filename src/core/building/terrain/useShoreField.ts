import { useEffect, useLayoutEffect, useSyncExternalStore } from 'react';

import { rebuildShoreField, ShoreField } from './shoreField';
import { useSharedFrame, type SharedFrameChannel } from '../../runtime/frame';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import type { BuildingStoreApi } from '../stores/buildingStore';
import type { BuildingWorldSurface, TileGroupConfig } from '../types';

/** Longest a rebuild runs in one frame; a small world finishes inside its first slice. */
export const SHORE_FIELD_SLICE_MS = 4;
const SHORE_FIELD_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:shore-field' };

type ShoreSource = { tileGroups: ReadonlyMap<string, TileGroupConfig>; worldSurface: BuildingWorldSurface };

/** The field of one building store: rebuilt only when its tiles or world surface change, shared by every reader. */
class ShoreFieldTracker {
  readonly field = new ShoreField();
  private source: ShoreSource | null = null;
  private steps: Generator<void, void> | null = null;
  private frame = Number.NaN;
  private readers = 0;
  private readonly listeners = new Set<() => void>();

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  /** Changes when a build starts running over frames or finishes. */
  revision = (): number => this.field.version * 2 + (this.steps ? 1 : 0);

  get pending(): boolean {
    return this.steps !== null;
  }

  sync(source: ShoreSource): void {
    if (this.source?.tileGroups === source.tileGroups && this.source.worldSurface === source.worldSurface) return;
    this.source = source;
    this.steps = rebuildShoreField(this.field, { tileGroups: source.tileGroups.values(), worldSurface: source.worldSurface });
    this.advance();
    if (this.steps) this.notify();
  }

  /** Runs the pending build for one slice; readers pass the frame time so they share a single slice per frame. */
  advance(frame?: number): void {
    if (!this.steps || frame === this.frame) return;
    if (frame !== undefined) this.frame = frame;
    const end = performance.now() + SHORE_FIELD_SLICE_MS;
    while (!this.steps.next().done) if (performance.now() >= end) return;
    this.steps = null;
    this.notify();
  }

  /** The texture's GPU copy lives while someone reads it; the CPU data stays for the next reader. */
  retain(): () => void {
    this.readers += 1;
    return () => {
      this.readers -= 1;
      if (this.readers === 0) this.field.dispose();
    };
  }

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

const trackers = new WeakMap<BuildingStoreApi, ShoreFieldTracker>();

function trackerOf(store: BuildingStoreApi): ShoreFieldTracker {
  let tracker = trackers.get(store);
  if (!tracker) {
    tracker = new ShoreFieldTracker();
    trackers.set(store, tracker);
  }
  return tracker;
}

const noSubscribe = () => () => {};
const noRevision = () => 0;

/**
 * The shore field of the nearest runtime's building: water tiles plus the open sea of a `worldSurface: 'water'` world.
 * Readers share one field per world, rebuilt when the tiles change (large worlds over several frames, at most
 * {@link SHORE_FIELD_SLICE_MS} each). Null without a runtime or while the world has no water. Ground and water
 * materials sample `field.texture` at `(world.xz - field.transform.xy) * field.transform.zw`.
 */
export function useShoreField(): ShoreField | null {
  const store = useGaesupRuntime()?.buildingStore ?? null;
  const tracker = store ? trackerOf(store) : null;
  const tileGroups = useSyncExternalStore(store?.subscribe ?? noSubscribe, () => store?.getState().tileGroups);
  const worldSurface = useSyncExternalStore(store?.subscribe ?? noSubscribe, () => store?.getState().worldSurface);
  useSyncExternalStore(tracker?.subscribe ?? noSubscribe, tracker?.revision ?? noRevision);
  useLayoutEffect(() => {
    if (tracker && tileGroups && worldSurface) tracker.sync({ tileGroups, worldSurface });
  }, [tracker, tileGroups, worldSurface]);
  useEffect(() => tracker?.retain(), [tracker]);
  useSharedFrame(SHORE_FIELD_FRAME, (_, elapsedSeconds, three) => {
    tracker?.advance(elapsedSeconds);
    three.invalidate();
  }, tracker?.pending ?? false);
  return tracker?.field.hasWater ? tracker.field : null;
}
