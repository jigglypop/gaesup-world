import { createContext, useContext, useLayoutEffect, useMemo, type ReactNode } from 'react';

import { context as canvasContext, useThree } from '@react-three/fiber';

import { autoDetectProfile, profileForTier, readRendererIdentity } from './detect';
import { usePerfStore } from './stores/perfStore';
import type { PerfProfile, PerfTier } from './types';

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

function CanvasPixelRatio({ profile }: { profile: PerfProfile }) {
  const dpr = useThree((state) => state.viewport.dpr);
  const setDpr = useThree((state) => state.setDpr);
  const target = pixelRatioFor(profile);
  useLayoutEffect(() => {
    // Every Canvas render reapplies its `dpr` prop (default [1, 2]); put the profile's ratio back when it drifts.
    if (dpr !== target) setDpr(target);
  }, [dpr, setDpr, target]);
  return null;
}

/**
 * Applies the profile's pixel ratio to the canvas and exposes the profile to shadows and post-processing.
 * Without `quality` it changes nothing, and switching it on or off keeps `children` mounted.
 */
export function QualityProfileProvider({ quality, children }: { quality?: WorldQuality | undefined; children?: ReactNode }) {
  const profile = useResolvedProfile(quality);
  return (
    <QualityProfileContext.Provider value={profile}>
      {profile && <CanvasPixelRatio profile={profile} />}
      {children}
    </QualityProfileContext.Provider>
  );
}
