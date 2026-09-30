/**
 * How both water shaders read shore coverage (0 land, 0.5 on the shoreline, 1 open water; see `ShoreField`) and the
 * colors they share. The visible edge sits a little inside the water tiles, so their straight outline never shows.
 */
export const WATER_SHORE = {
  /** Coverage noise that bends the shoreline off the grid; below the edge band so a tile border stays transparent. */
  wobble: 0.08,
  /** Transparent below, bank above: where a pond begins. */
  edge: [0.6, 0.66],
  /** Dry bank darkening into wet sand. */
  wet: [0.62, 0.7],
  /** Wet sand giving way to water. */
  water: [0.68, 0.76],
  /** Foam rises at the waterline and thins out into the shallows. */
  foam: [0.68, 0.73, 0.77, 0.86],
  /** Shallow to deep water. */
  depth: [0.78, 1],
} as const;

export const WATER_COLORS = {
  bank: '#dccb98',
  wet: '#a8976b',
  shallow: '#44b3ae',
  deep: '#15608a',
  foam: '#f3fbf6',
  /** What an unlit surface reflects at grazing angles. */
  sky: '#c3e6ee',
  /** Sea floor: sand off the beach, darker where it falls away. */
  seaBed: '#dcc995',
  seaBedDeep: '#6d8a80',
  /** Pond floor: silty sand at the bank, dark in the middle. */
  pondBed: '#b3a070',
  pondBedDeep: '#55684f',
} as const;

/**
 * How deep water is, in meters below the surface at a distance `d` from the nearest land. The open sea shelves away
 * from the beach (`shore + slope * d + curve * d^2`, at most `max`) and its floor lies that deep. A pond reads `depth` meters
 * deep from `ramp` meters in, but its floor is the tile beneath, `floor` meters down, where whatever is in it stands.
 */
export const WATER_BED = {
  sea: { shore: 0.06, slope: 0.1, curve: 0.004, max: 12 },
  pond: { depth: 1.2, ramp: 3, floor: 0.096 },
} as const;

export function waterDepth(distance: number, open: boolean): number {
  const d = Math.max(0, distance);
  if (open) {
    const { shore, slope, curve, max } = WATER_BED.sea;
    return Math.min(max, shore + d * (slope + d * curve));
  }
  const t = Math.min(1, d / WATER_BED.pond.ramp);
  return WATER_BED.pond.depth * t * t * (3 - 2 * t);
}

/** Depth bias that keeps a pond floor in front of the tile surface it lies on. */
export const POND_FLOOR_OFFSET = { polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -4 } as const;

/**
 * Framebuffer alpha a water floor writes instead of 1. Water tells its floor apart from what stands in it by this
 * mark, so ripples bend only the floor and never drag a leg or a rock above the water into it.
 */
export const WATER_BED_MARK = 0.98;

/** How light crosses water; thicknesses are meters of water along the view ray. */
export const WATER_OPTICS = {
  /** Extinction per meter: the bottom fades into the water body as `exp(-clarity * thickness)`. */
  clarity: 0.32,
  /** Extra absorption per meter and channel, so the bottom turns turquoise before it fades. */
  absorption: [0.45, 0.1, 0.06],
  /** Meters of water over which the body color goes from shallow to deep. */
  deepening: 2.5,
  /** Foam gathers where less than this much water covers the floor. */
  foam: 0.15,
  /** Ripple refraction: screen offset per unit of normal tilt, per meter of water, per meter of view distance. */
  refraction: 0.5,
  /** Reflectance straight down (water, IOR 1.33); rises to 1 at grazing angles. */
  reflectance: 0.02,
  /** Light the ripples focus on the floor: pattern cells per meter, brightness, and fading per meter of depth. */
  caustics: { scale: 0.35, strength: 0.9, fade: 0.35 },
} as const;

/** Detailed water inside `enter` meters of the camera, simple past `exit`; in between it keeps its level. */
export const WATER_DETAIL_LOD = { enter: 40, exit: 52 } as const;

/** A surface's current level, written by the surface every few frames and read by its material before rendering. */
export type WaterLodState = { detailed: boolean };

/** Hysteresis keeps a surface on its level between the two thresholds, so it does not flicker there. */
export function selectWaterDetail(detailed: boolean, distance: number): boolean {
  return distance <= (detailed ? WATER_DETAIL_LOD.exit : WATER_DETAIL_LOD.enter);
}

/** Distance from a point to a level rectangle of water (half extents `halfWidth`, `halfDepth`), zero right above it. */
export function distanceToWater(
  x: number, y: number, z: number,
  centerX: number, centerY: number, centerZ: number,
  halfWidth: number, halfDepth: number,
): number {
  return Math.hypot(Math.max(0, Math.abs(x - centerX) - halfWidth), y - centerY, Math.max(0, Math.abs(z - centerZ) - halfDepth));
}
