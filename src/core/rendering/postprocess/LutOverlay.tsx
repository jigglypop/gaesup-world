import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { LUT } from '@react-three/postprocessing';

import { loadCubeLutTexture } from './cubeLut';

export type LutOverlayProps = {
  /** Public URL to a `.cube` file (Adobe Cube LUT 1D or 3D). */
  url: string;
  /** Use higher-quality tetrahedral interpolation when true. */
  tetrahedralInterpolation?: boolean;
  /**
   * Numeric blend function id passed straight to the underlying
   * `LUT3DEffect`. Defaults to the effect's own default (NORMAL) when
   * omitted, which avoids forcing a hard dependency on the
   * `postprocessing` package at our import sites.
   */
  blendFunction?: number;
  /** Called once the LUT is parsed and uploaded as a 3D texture. */
  onLoad?: (texture: THREE.Data3DTexture) => void;
  /** Called if loading fails. */
  onError?: (error: Error) => void;
};

/**
 * Renders an Adobe `.cube` LUT as a postprocessing pass.
 *
 * Mount inside the same `<EffectComposer>` (or `extraEffects` slot) as
 * `<ColorGrade />` to apply a cinematic look. Returns `null` until the
 * LUT finishes loading; failure is silent (logged) so the rest of the
 * composer keeps rendering.
 */
export function LutOverlay({
  url,
  tetrahedralInterpolation = true,
  blendFunction,
  onLoad,
  onError,
}: LutOverlayProps) {
  const [texture, setTexture] = useState<THREE.Data3DTexture | null>(null);
  const onLoadRef = useRef(onLoad);
  const onErrorRef = useRef(onError);
  onLoadRef.current = onLoad;
  onErrorRef.current = onError;

  useEffect(() => {
    let cancelled = false;
    let local: THREE.Data3DTexture | null = null;

    loadCubeLutTexture(url)
      .then((tex) => {
        if (cancelled) {
          tex.dispose();
          return;
        }
        local = tex;
        setTexture(tex);
        onLoadRef.current?.(tex);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const error = err instanceof Error ? err : new Error(String(err));
        if (onErrorRef.current) onErrorRef.current(error);
        else console.warn('[LutOverlay] failed to load LUT:', error);
      });

    return () => {
      cancelled = true;
      setTexture(null);
      if (local) local.dispose();
    };
  }, [url]);

  if (!texture) return null;
  const lutProps = blendFunction !== undefined
    ? { lut: texture, tetrahedralInterpolation, blendFunction }
    : { lut: texture, tetrahedralInterpolation };
  return <LUT {...lutProps} />;
}

export default LutOverlay;
