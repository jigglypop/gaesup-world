import type { Vec3 } from '../../grid';
import type { GiEnvironment, MutableRgb, Rgb } from '../types';

export const RADIANCE_LIMIT = 64;
export const IRRADIANCE_LIMIT = 1024;
export const ALBEDO_LIMIT = 0.95;
const DIRECTION_EPSILON = 1e-6;
const FALLBACK_SUN: Vec3 = { x: 0, y: 1, z: 0 };

/**
 * NaN, 음수, 0은 0으로, 무한대는 limit으로 바꿔 프로브 값이 한 번의 잘못된 입력으로 영구히 오염되는 것을 막는다.
 */
export function clampFinite(value: number, limit: number): number {
  if (!(value > 0)) return 0;
  return value < limit ? value : limit;
}

function sanitizeRgb(color: Rgb, limit: number): Rgb {
  return [clampFinite(color[0], limit), clampFinite(color[1], limit), clampFinite(color[2], limit)];
}

export function normalizeEnvironment(environment: GiEnvironment): GiEnvironment {
  const { x, y, z } = environment.sunDirection;
  const length = Math.hypot(x, y, z);
  const usable = Number.isFinite(length) && length > DIRECTION_EPSILON;
  return {
    sunDirection: usable ? { x: x / length, y: y / length, z: z / length } : FALLBACK_SUN,
    sunIrradiance: sanitizeRgb(environment.sunIrradiance, IRRADIANCE_LIMIT),
    skyZenith: sanitizeRgb(environment.skyZenith, RADIANCE_LIMIT),
    skyHorizon: sanitizeRgb(environment.skyHorizon, RADIANCE_LIMIT),
    skyGround: sanitizeRgb(environment.skyGround, RADIANCE_LIMIT),
  };
}

export function skyRadianceInto(environment: GiEnvironment, dy: number, out: MutableRgb): void {
  const { skyZenith, skyHorizon, skyGround } = environment;
  if (dy < 0) {
    out[0] = skyGround[0];
    out[1] = skyGround[1];
    out[2] = skyGround[2];
    return;
  }
  const t = Math.min(1, dy);
  out[0] = skyHorizon[0] + (skyZenith[0] - skyHorizon[0]) * t;
  out[1] = skyHorizon[1] + (skyZenith[1] - skyHorizon[1]) * t;
  out[2] = skyHorizon[2] + (skyZenith[2] - skyHorizon[2]) * t;
}
