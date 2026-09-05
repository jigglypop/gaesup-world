export type PerfTier = 'low' | 'medium' | 'high';

export type PerfProfile = {
  tier: PerfTier;
  /** Multiplier applied to instance counts (eg. grass blades, weather particles). */
  instanceScale: number;
  /** Pixel ratio multiplier (clamped). */
  pixelRatio: number;
  /** Shadow map size hint. */
  shadowMapSize: number;
  /** Whether postprocessing/expensive effects should be enabled by default. */
  postprocess: boolean;
  /** Whether the toon outline pass should run. */
  outline: boolean;
};

export type DeviceCapabilities = {
  webgl2: boolean;
  maxTextureSize: number;
  rendererName: string;
  vendorName: string;
  cores: number;
  memory: number;
  isMobile: boolean;
  pixelRatio: number;
};
