import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react';

import { context as canvasContext, useThree } from '@react-three/fiber';

import { createResolutionGovernor } from './adaptive';
import { autoDetectProfile, profileForTier, readRendererIdentity } from './detect';
import { usePerfStore } from './stores/perfStore';
import type { PerfProfile, PerfTier } from './types';
import { useGaesupStore, useGaesupStoreApi } from '../stores/gaesupStore';

/** `auto` follows the detected device tier; a tier or a full profile pins it. */
export type WorldQuality = 'auto' | PerfTier | PerfProfile;

/** Upper bound for the canvas pixel ratio: post-processing and shading scale with pixel count. */
export const MAX_QUALITY_PIXEL_RATIO = 1.5;

const QualityProfileContext = createContext<PerfProfile | null>(null);

/** The world's applied quality profile, or null when the world keeps each component's own defaults. */
export function useQualityProfile(): PerfProfile | null {
  return useContext(QualityProfileContext);
}

function devicePixelRatio(): number {
  return typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
}

function pixelRatioFor(profile: PerfProfile): number {
  return Math.min(profile.pixelRatio, MAX_QUALITY_PIXEL_RATIO, devicePixelRatio());
}

function storedProfile(): PerfProfile | null {
  const state = usePerfStore.getState();
  return state.capabilities || state.manualOverride ? state.profile : null;
}

/**
 * Canvas pixel ratio for a quality. Pass it as `<Canvas dpr>` so the first frame is already sized; `auto` detects
 * the device once and shares the result with `QualityProfileProvider`.
 */
export function resolveQualityDpr(quality: WorldQuality): number {
  if (quality !== 'auto') return pixelRatioFor(typeof quality === 'string' ? profileForTier(quality) : quality);
  if (!storedProfile()) usePerfStore.getState().detect();
  return pixelRatioFor(usePerfStore.getState().profile);
}

function useResolvedProfile(quality: WorldQuality | undefined): PerfProfile | null {
  const canvas = useContext(canvasContext);
  const stored = usePerfStore((state) => (state.capabilities || state.manualOverride ? state.profile : null));
  // Detect before the first child render so shadows and post-processing mount once with the right tier, reading
  // the GPU from the canvas renderer when there is one.
  const detected = useMemo(
    () => (quality === 'auto' && !stored ? autoDetectProfile(readRendererIdentity(canvas?.getState().gl)) : null),
    [canvas, quality, stored],
  );
  useLayoutEffect(() => {
    if (detected) usePerfStore.setState({ ...detected, manualOverride: false });
  }, [detected]);
  return useMemo(() => {
    if (quality === undefined) return null;
    if (quality === 'auto') return stored ?? detected?.profile ?? null;
    return typeof quality === 'string' ? profileForTier(quality) : quality;
  }, [detected, quality, stored]);
}

/** Seconds between GPU timing reads; each read sums the render passes of one recent frame. */
const GPU_TIMING_SECONDS = 0.5;

type TimedRenderer = { backend?: { trackTimestamp?: boolean }; resolveTimestampsAsync?: (type?: string) => Promise<number | undefined> };

/** GPU time of recent frames from the renderer's timestamp queries, eased over reads, while it tracks them. */
function GpuFrameTimer() {
  const gl = useThree((state) => state.gl) as unknown as TimedRenderer;
  const setGpuMs = useGaesupStore((state) => state.setGpuMs);
  useEffect(() => {
    const resolve = gl.resolveTimestampsAsync?.bind(gl);
    if (!gl.backend?.trackTimestamp || !resolve) return undefined;
    let eased: number | null = null;
    let active = true;
    const timer = setInterval(() => {
      resolve('render').then((ms) => {
        if (!active || typeof ms !== 'number' || !(ms > 0)) return;
        eased = eased === null ? ms : eased + (ms - eased) * 0.3;
        setGpuMs(Math.round(eased * 100) / 100);
      }, () => undefined);
    }, GPU_TIMING_SECONDS * 1000);
    return () => {
      active = false;
      clearInterval(timer);
      setGpuMs(null);
    };
  }, [gl, setGpuMs]);
  return null;
}

/** Keeps the canvas at `ratio` and reports it with its ceiling. */
function CanvasPixelRatio({ ratio, maximum, adaptive }: { ratio: number; maximum: number; adaptive: boolean }) {
  const dpr = useThree((state) => state.viewport.dpr);
  const setDpr = useThree((state) => state.setDpr);
  const setResolution = useGaesupStore((state) => state.setResolution);
  useLayoutEffect(() => {
    // Every Canvas render reapplies its `dpr` prop (default [1, 2]); put the ratio back when it drifts.
    if (dpr !== ratio) setDpr(ratio);
  }, [dpr, setDpr, ratio]);
  useEffect(() => setResolution({ pixelRatio: ratio, maxPixelRatio: maximum, adaptive }), [adaptive, maximum, ratio, setResolution]);
  useEffect(() => () => setResolution(null), [setResolution]);
  return null;
}

/**
 * `quality="auto"`: the profile's ratio is the ceiling. Display frames too slow for the target lower the canvas to the
 * ratio whose pixels fit it, and frames at full speed raise it back a step at a time (`createResolutionGovernor`).
 */
function AdaptivePixelRatio({ maximum }: { maximum: number }) {
  const store = useGaesupStoreApi();
  const governor = useMemo(() => createResolutionGovernor(maximum), [maximum]);
  const [ratio, setRatio] = useState(maximum);
  useEffect(() => {
    setRatio(governor.pixelRatio);
    let last = 0;
    let cpuBound = false;
    const resume = () => {
      last = 0;
      governor.resume();
    };
    document.addEventListener('visibilitychange', resume);
    let handle = requestAnimationFrame(function tick(now) {
      handle = requestAnimationFrame(tick);
      const interval = last ? now - last : 0;
      last = now;
      if (!interval || document.hidden) return;
      const next = governor.frame(interval, store.getState().gpuMs);
      if (next !== null) setRatio(next);
      if (governor.cpuBound !== cpuBound) {
        cpuBound = governor.cpuBound;
        store.getState().setCpuBound(cpuBound);
      }
    });
    return () => {
      cancelAnimationFrame(handle);
      document.removeEventListener('visibilitychange', resume);
      if (cpuBound) store.getState().setCpuBound(false);
    };
  }, [governor, store]);
  return <CanvasPixelRatio ratio={ratio} maximum={maximum} adaptive />;
}

/**
 * Applies the profile's pixel ratio to the canvas and exposes the profile to shadows and post-processing. With
 * `quality="auto"` the ratio is a ceiling the canvas drops below while frames run slow. It also reports GPU time where
 * the renderer measures it. Without `quality` it changes nothing, and switching it on or off keeps `children` mounted.
 */
export function QualityProfileProvider({ quality, children }: { quality?: WorldQuality | undefined; children?: ReactNode }) {
  const profile = useResolvedProfile(quality);
  const maximum = profile ? pixelRatioFor(profile) : 0;
  return (
    <QualityProfileContext.Provider value={profile}>
      {profile && (quality === 'auto'
        ? <AdaptivePixelRatio maximum={maximum} />
        : <CanvasPixelRatio ratio={maximum} maximum={maximum} adaptive={false} />)}
      {profile && <GpuFrameTimer />}
      {children}
    </QualityProfileContext.Provider>
  );
}
