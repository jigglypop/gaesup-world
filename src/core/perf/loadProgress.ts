import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { useProgress } from '@react-three/drei';

import { pendingCompiles, subscribeCompiles } from '../rendering/CompileGate';

/** `assets` while files download and parse, `shaders` while content compiles ahead of its first draw. */
export type WorldLoadStage = 'assets' | 'shaders' | 'ready';

export type WorldLoadProgress = {
  stage: WorldLoadStage;
  /** 0 to 1, never going back as more files turn up: downloads fill the first 80%, compiles the rest. */
  progress: number;
  /** Files done and known so far (three's default loading manager). */
  loaded: number;
  total: number;
  /** The file loading last. */
  item: string;
};

/** Quiet time after the last load or compile before the world counts as drawn. */
const SETTLE_MS = 400;
/** A world that loads nothing counts as ready after this long. */
const EMPTY_WORLD_MS = 1500;

/**
 * How far the 3D world is from its first complete frame: files through three's default loading manager (models and
 * textures), then content compiling behind `CompileGate`. Once ready it stays ready, so assets loading later in play
 * do not bring a loading screen back. Use it outside the canvas, for a loading overlay.
 */
export function useWorldLoadProgress(): WorldLoadProgress {
  const { active, loaded, total, item } = useProgress();
  const compiling = useSyncExternalStore(subscribeCompiles, pendingCompiles, pendingCompiles);
  const [ready, setReady] = useState(false);
  const peak = useRef(0);
  const shown = useRef(0);
  const started = useRef(0);
  peak.current = Math.max(peak.current, compiling);
  const busy = active || compiling > 0;
  useEffect(() => {
    started.current ||= performance.now();
    if (ready || busy) return undefined;
    const wait = total > 0 ? SETTLE_MS : Math.max(SETTLE_MS, EMPTY_WORLD_MS - (performance.now() - started.current));
    const timer = setTimeout(() => setReady(true), wait);
    return () => clearTimeout(timer);
  }, [busy, ready, total]);
  if (ready) return { stage: 'ready', progress: 1, loaded, total, item };
  // After the last compile the world settles for a moment; it stays on the shader stage meanwhile.
  const stage: WorldLoadStage = active || peak.current === 0 ? 'assets' : 'shaders';
  const files = total > 0 ? loaded / total : 0;
  const progress = stage === 'assets' ? 0.8 * files : 0.8 + 0.2 * (1 - compiling / Math.max(1, peak.current));
  shown.current = Math.max(shown.current, progress);
  return { stage, progress: shown.current, loaded, total, item };
}
