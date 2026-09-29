import type { ProbeVolumeConfig } from '../types';

const MAX_PROBE_COUNT = 1 << 22;

/** Rejects a probe grid that could not be traced: non-finite or non-positive sizes, too many probes, bad blend. */
export function validateConfig(config: ProbeVolumeConfig): void {
  const { origin, spacing, counts, raysPerProbe, blend, normalBias, maxRayDistance } = config;
  if (![origin.x, origin.y, origin.z, spacing, normalBias, maxRayDistance].every(Number.isFinite)) {
    throw new RangeError('[ProbeVolume Error]: config values must be finite');
  }
  if (spacing <= 0 || normalBias < 0 || maxRayDistance <= 0) {
    throw new RangeError('[ProbeVolume Error]: spacing and maxRayDistance must be positive');
  }
  if (!counts.every((count) => Number.isInteger(count) && count > 0)) {
    throw new RangeError('[ProbeVolume Error]: counts must be positive integers');
  }
  if (counts[0] * counts[1] * counts[2] > MAX_PROBE_COUNT) {
    throw new RangeError('[ProbeVolume Error]: probe count exceeds the limit');
  }
  if (!Number.isInteger(raysPerProbe) || raysPerProbe < 1) {
    throw new RangeError('[ProbeVolume Error]: raysPerProbe must be a positive integer');
  }
  if (!(blend > 0 && blend <= 1)) {
    throw new RangeError('[ProbeVolume Error]: blend must be within (0, 1]');
  }
}

/** The probe indices along one axis whose influence reaches [min, max], or null when none does. */
export function probeRange(
  min: number,
  max: number,
  origin: number,
  spacing: number,
  margin: number,
  count: number,
): readonly [number, number] | null {
  const lo = Math.floor((min - margin - origin) / spacing);
  const hi = Math.ceil((max + margin - origin) / spacing);
  if (hi < 0 || lo > count - 1) return null;
  return [Math.max(lo, 0), Math.min(hi, count - 1)];
}
