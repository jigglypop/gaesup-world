import { useMemo } from 'react';

import {
  BrightnessContrast,
  HueSaturation,
  ToneMapping,
  Vignette,
} from '@react-three/postprocessing';

import { useTimeStore } from '../../time/stores/timeStore';
import { useWeatherStore } from '../../weather/stores/weatherStore';

export type GradePreset = 'neutral' | 'morning' | 'noon' | 'sunset' | 'night' | 'rain' | 'snow' | 'storm';

export type ColorGradeProps = {
  /**
   * If set, forces a fixed preset. When omitted, the preset is auto-selected
   * from current time-of-day + weather every render.
   */
  preset?: GradePreset;
  /** Master strength scalar (0..1) applied on top of the preset. */
  intensity?: number;
  /** Disable the vignette ring even when the preset would add it. */
  vignette?: boolean;
};

type GradeParams = {
  brightness: number;
  contrast: number;
  hue: number;
  saturation: number;
  vignetteAmount: number;
  vignetteDarkness: number;
};

const PRESETS: Record<GradePreset, GradeParams> = {
  neutral: { brightness: 0, contrast: 0, hue: 0, saturation: 0, vignetteAmount: 0.18, vignetteDarkness: 0.55 },
  morning: { brightness: 0.05, contrast: 0.05, hue: 0.04, saturation: 0.10, vignetteAmount: 0.20, vignetteDarkness: 0.55 },
  noon:    { brightness: 0.04, contrast: 0.10, hue: 0.00, saturation: 0.18, vignetteAmount: 0.18, vignetteDarkness: 0.50 },
  sunset:  { brightness: 0.02, contrast: 0.10, hue: -0.05, saturation: 0.22, vignetteAmount: 0.30, vignetteDarkness: 0.65 },
  night:   { brightness: -0.10, contrast: 0.12, hue: 0.10, saturation: -0.15, vignetteAmount: 0.45, vignetteDarkness: 0.85 },
  rain:    { brightness: -0.05, contrast: 0.06, hue: 0.05, saturation: -0.20, vignetteAmount: 0.35, vignetteDarkness: 0.70 },
  snow:    { brightness: 0.06, contrast: 0.04, hue: 0.00, saturation: -0.10, vignetteAmount: 0.20, vignetteDarkness: 0.50 },
  storm:   { brightness: -0.12, contrast: 0.15, hue: 0.08, saturation: -0.25, vignetteAmount: 0.50, vignetteDarkness: 0.90 },
};

function autoPreset(hour: number, weatherKind: string | undefined): GradePreset {
  if (weatherKind === 'rain') return 'rain';
  if (weatherKind === 'snow') return 'snow';
  if (weatherKind === 'storm') return 'storm';
  if (hour < 5 || hour >= 20) return 'night';
  if (hour < 8) return 'morning';
  if (hour < 17) return 'noon';
  if (hour < 20) return 'sunset';
  return 'neutral';
}

/**
 * Cinematic color grading + tone mapping pass for the world.
 *
 * Returns a fragment of postprocessing effects intended to be passed via the
 * `extraEffects` prop on `<ToonOutlines>`, or rendered inside an
 * `<EffectComposer>` you own. Doing it that way avoids stacking composers,
 * which would double-cost MSAA + render targets.
 */
export function ColorGrade({
  preset,
  intensity = 1,
  vignette = true,
}: ColorGradeProps = {}) {
  const hour = useTimeStore((s) => s.time.hour);
  const weather = useWeatherStore((s) => s.current);

  const active: GradePreset = preset ?? autoPreset(hour, weather?.kind);
  const k = Math.max(0, Math.min(1, intensity));

  const params = useMemo(() => {
    const p = PRESETS[active] ?? PRESETS.neutral;
    return {
      brightness: p.brightness * k,
      contrast: p.contrast * k,
      hue: p.hue * k,
      saturation: p.saturation * k,
      vignetteAmount: p.vignetteAmount * k,
      vignetteDarkness: p.vignetteDarkness,
    };
  }, [active, k]);

  return (
    <>
      <ToneMapping />
      <BrightnessContrast brightness={params.brightness} contrast={params.contrast} />
      <HueSaturation hue={params.hue} saturation={params.saturation} />
      {vignette && (
        <Vignette eskil={false} offset={0.3} darkness={params.vignetteDarkness} />
      )}
    </>
  );
}

export default ColorGrade;
