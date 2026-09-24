export const FRAME_PHASES = [
  'input',
  'script',
  'prePhysics',
  'postPhysics',
  'animation',
  'lateUpdate',
  'camera',
  'effects',
  'snapshot',
] as const;

export type FramePhase = (typeof FRAME_PHASES)[number];

export const AFTER_MOTION_FRAME_ORDER = 10;

export type FrameCallback = (delta: number, elapsedMs: number) => void;

export type FrameSubscriptionOptions = {
  order?: number;
  throttleMs?: number;
  enabled?: () => boolean;
  label?: string;
};

export type FramePhaseMetrics = {
  calls: number;
  totalMs: number;
  lastMs: number;
};

export type FrameDriver<T> = {
  add: (item: T) => () => void;
  size: () => number;
  dispose: () => void;
};
