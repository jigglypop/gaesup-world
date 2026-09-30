export type GameplayAreaConfig = {
  id: string;
  /** Box center in world meters. */
  center: readonly [number, number, number];
  /** Full box size in meters. */
  size: readonly [number, number, number];
};

type Point = { x: number; y: number; z: number };

const contains = ({ center, size }: GameplayAreaConfig, point: Point): boolean =>
  Math.abs(point.x - center[0]) <= size[0] / 2
  && Math.abs(point.y - center[1]) <= size[1] / 2
  && Math.abs(point.z - center[2]) <= size[2] / 2;

/**
 * Trigger boxes for the rule engine's `enterArea`: `update` reports each area once when the tracked point enters it,
 * like an engine's overlap-begin event, and again only after the point has left.
 */
export function createGameplayAreas(onEnter: (areaId: string) => void) {
  const areas = new Map<string, GameplayAreaConfig>();
  const inside = new Set<string>();
  return {
    register(area: GameplayAreaConfig): () => void {
      areas.set(area.id, area);
      inside.delete(area.id);
      return () => {
        if (areas.get(area.id) !== area) return;
        areas.delete(area.id);
        inside.delete(area.id);
      };
    },
    /** Tests `point` against every area; the runtime calls it once per fixed tick with the player position. */
    update(point: Point | undefined): void {
      for (const area of areas.values()) {
        if (!point || !contains(area, point)) inside.delete(area.id);
        else if (!inside.has(area.id)) {
          inside.add(area.id);
          onEnter(area.id);
        }
      }
    },
    /** Forgets who is inside, so a point already in an area enters it again on the next update. */
    reset(): void {
      inside.clear();
    },
    list: (): GameplayAreaConfig[] => [...areas.values()],
  };
}

export type GameplayAreas = ReturnType<typeof createGameplayAreas>;
