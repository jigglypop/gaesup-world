export interface ShakeConfig {
  intensity: number;
  duration: number;
  frequency: number;
  decay: boolean;
}

export interface ZoomConfig {
  targetFov: number;
  duration: number;
  easing: (t: number) => number;
}
