import type { Rgb } from '../types';

const HEX_SHORT_LENGTH = 3;
const HEX_LONG_LENGTH = 6;
const BYTE_MAX = 255;
const HEX_RADIX = 16;
const SRGB_LINEAR_THRESHOLD = 0.04045;
const SRGB_LINEAR_DIVISOR = 12.92;
const SRGB_OFFSET = 0.055;
const SRGB_SCALE = 1.055;
const SRGB_EXPONENT = 2.4;
const FALLBACK_ALBEDO: Rgb = [0.5, 0.5, 0.5];

function srgbToLinear(value: number): number {
  return value <= SRGB_LINEAR_THRESHOLD
    ? value / SRGB_LINEAR_DIVISOR
    : ((value + SRGB_OFFSET) / SRGB_SCALE) ** SRGB_EXPONENT;
}

/**
 * '#rgb' 또는 '#rrggbb' sRGB 문자열을 선형 RGB로 변환한다. 해석할 수 없으면 중간 회색을 반환한다.
 */
export function hexToLinearRgb(hex: string | undefined): Rgb {
  if (!hex) return FALLBACK_ALBEDO;
  const digits = hex.startsWith('#') ? hex.slice(1) : hex;
  const expanded =
    digits.length === HEX_SHORT_LENGTH
      ? digits
          .split('')
          .map((digit) => digit + digit)
          .join('')
      : digits;
  if (expanded.length !== HEX_LONG_LENGTH || !/^[0-9a-fA-F]+$/.test(expanded)) {
    return FALLBACK_ALBEDO;
  }
  const channel = (offset: number) =>
    srgbToLinear(Number.parseInt(expanded.slice(offset, offset + 2), HEX_RADIX) / BYTE_MAX);
  return [channel(0), channel(2), channel(4)];
}
