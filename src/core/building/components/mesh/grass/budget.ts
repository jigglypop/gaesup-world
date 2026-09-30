import type { GrassProfile } from '../../../types';

export type GrassCurve = { near: number; far: number; strength: number };

/** Distance LOD (gaesup's SFE curve): full density to `near` meters from the camera, none past `far`. */
export const GRASS_LOD: Record<GrassProfile, GrassCurve> = {
  lawn: { near: 22, far: 60, strength: 1.35 },
  // Tall grass reads from farther away, so it thins later.
  tall: { near: 26, far: 64, strength: 1.2 },
};

/** Blades one world draws per profile at quality `instanceScale` 1. */
export const GRASS_MAX_BLADES: Record<GrassProfile, number> = { lawn: 28_000, tall: 16_000 };

/** Blade joints by camera distance to a layer's nearest point, nearest tier first; the last tier has no limit. */
export const GRASS_TIERS: readonly { segments: number; within: number }[] = [
  { segments: 5, within: 18 },
  { segments: 3, within: 36 },
  { segments: 2, within: Infinity },
];

/** Tall blades stand taller and keep their joints this much farther out. */
export const TALL_TIER_REACH = 6;

/** Share of a layer's blades drawn at `distance`, the same curve the shader fades each blade with. */
export function lodWeight(distance: number, { near, far, strength }: GrassCurve): number {
  if (distance <= near) return 1;
  if (distance >= far) return 0;
  return (1 - (distance - near) / (far - near)) ** Math.max(1, strength);
}

export function tierIndex(distance: number, tiers: readonly { within: number }[] = GRASS_TIERS): number {
  let index = 0;
  while (index < tiers.length - 1 && distance >= tiers[index]!.within) index++;
  return index;
}

/**
 * Blades a layer of `count` draws: its LOD `share` of the list scaled into the budget, plus the `band` over which the
 * shader shrinks the last of them. Every blade the shader still grows lies inside this prefix, so thinning never pops.
 */
export function drawCount(count: number, share: number, scale: number, band: number): number {
  return share > 0 ? Math.min(count, Math.ceil(count * share * scale * (1 + band))) : 0;
}

/** One world's blade budget for a profile: layers request their LOD share and all draw the same scale of it. */
export class GrassBudget {
  max = Infinity;
  scale = 1;
  private readonly requests = new Map<object, number>();
  private total = 0;
  private frame: number | undefined;

  /** The scale for the frame at `time`, fixed at its first call so every layer of the frame agrees. */
  scaleAt(time: number): number {
    if (time !== this.frame) {
      this.frame = time;
      this.scale = this.total > this.max ? this.max / this.total : 1;
    }
    return this.scale;
  }

  request(layer: object, blades: number): void {
    this.total += blades - (this.requests.get(layer) ?? 0);
    this.requests.set(layer, blades);
  }

  release(layer: object): void {
    this.request(layer, 0);
    this.requests.delete(layer);
  }
}

const budgets = new WeakMap<object, Record<GrassProfile, GrassBudget>>();

/** The budget of `profile` in the world whose grass manager is `owner`. */
export function grassBudget(owner: object, profile: GrassProfile): GrassBudget {
  let world = budgets.get(owner);
  if (!world) budgets.set(owner, (world = { lawn: new GrassBudget(), tall: new GrassBudget() }));
  return world[profile];
}
