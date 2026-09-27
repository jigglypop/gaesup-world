import type { ThreeElements } from "@react-three/fiber";
import * as THREE from "three";

import type { GrassCell } from "./field";
import type { GrassProfile } from "../../../types";

export type GrassMaterialInstance = THREE.Material & { uniforms: Record<string, { value: unknown }> };
export type NodeGrassMaterialProps = {
  materialRef: React.RefObject<GrassMaterialInstance | null>;
  texture: THREE.Texture;
  alphaMap: THREE.Texture;
  toon: boolean;
  tipColor: THREE.Color;
  bottomColor: THREE.Color;
};

export type GrassMeshProps = ThreeElements["group"] & {
  /**
   * Node renderers: `tall` (broad, stiff, deeper green with a light crown; the default) or `lawn` (short, soft,
   * pastel). The classic WebGL path keeps its one look.
   */
  profile?: GrassProfile;
  /** Node renderers: average blade height in meters. Defaults to the profile's (lawn 0.25, tall 0.55) × `options.bH` / 0.65. */
  height?: number;
  options?: {
    /** Classic WebGL only; node renderers size blades by `profile`. */
    bW?: number;
    bH?: number;
    /** Most joints per blade; node renderers use fewer farther away. */
    joints?: number;
  };
  width?: number;
  /**
   * Optional local XZ tile centers and heights. Blades are distributed only inside these cells in one draw. A fourth
   * number sets the cell's grass-bearing neighbors (bits: west, east, north, south, then the corners) for a layer split
   * across components; node renderers otherwise take them from the list, and thin blades toward the other sides.
   */
  cells?: ReadonlyArray<GrassCell>;
  cellSize?: number;
  /** Disable the continuous ground plane when a tile terrain already supplies the ground. */
  ground?: boolean;
  instances?: number;
  /**
   * Blades per square meter. When set, overrides `instances` so density stays
   * constant regardless of `width`. Capped at `maxInstances` for safety.
   */
  density?: number;
  /**
   * Hard cap on instance count when computing from `density`.
   * Prevents runaway vertex counts on very large tiles.
   */
  maxInstances?: number;
  /**
   * Optional LOD parameters. When provided, the mesh reduces drawn instances
   * with distance using SFE-style suppression (w = exp(-sigma)).
   */
  lod?: {
    near?: number;
    far?: number;
    strength?: number;
  };
  /**
   * Optional world-space center used for LOD distance.
   * When omitted, the component falls back to its world transform.
   */
  center?: [number, number, number];
  groundColor?: string;
  groundAccentColor?: string;
  bladeTipColor?: string;
  /** Node renderers: the root tint, in place of the painted ground's. */
  bladeBottomColor?: string;
  /** Classic WebGL only; node renderers draw geometric blades. */
  bladeDiffuseUrl?: string;
  /** Classic WebGL only; node renderers draw geometric blades. */
  bladeAlphaUrl?: string;
  /**
   * When true, the ground plane uses a stepped toon material instead of PBR.
   * Defaults to the global toon mode (rendering/toon).
   */
  toon?: boolean;
};

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        grassMaterial: {
          ref?: React.RefObject<GrassMaterialInstance | null> | undefined;
          map?: THREE.Texture | null;
          alphaMap?: THREE.Texture | null;
          toneMapped?: boolean;
          side?: THREE.Side;
          transparent?: boolean;
          lights?: boolean;
          tipColor?: THREE.Color;
          bottomColor?: THREE.Color;
        };
      }
    }
  }
}
