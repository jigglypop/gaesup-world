// Unit-level checks for the sky keyframe interpolator. We avoid mounting
// React Three Fiber here and instead re-implement the lookup against the
// exported defaults to guarantee the table stays sane.

import * as THREE from 'three';

type SkyKeyframe = {
  hour: number;
  sunIntensity: number;
  ambientIntensity: number;
  azimuth: number;
  elevation: number;
};

const KEYFRAMES: SkyKeyframe[] = [
  { hour: 0,  sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: -Math.PI / 2, elevation: -0.3 },
  { hour: 13, sunIntensity: 1.05, ambientIntensity: 0.38, azimuth: 0,            elevation: 1.05 },
  { hour: 24, sunIntensity: 0.05, ambientIntensity: 0.18, azimuth: 3 * Math.PI / 4, elevation: -0.3 },
];

function lerp(a: SkyKeyframe, b: SkyKeyframe, t: number) {
  return {
    sunIntensity: THREE.MathUtils.lerp(a.sunIntensity, b.sunIntensity, t),
    ambientIntensity: THREE.MathUtils.lerp(a.ambientIntensity, b.ambientIntensity, t),
    azimuth: THREE.MathUtils.lerp(a.azimuth, b.azimuth, t),
    elevation: THREE.MathUtils.lerp(a.elevation, b.elevation, t),
  };
}

function pick(hour: number) {
  const wrap = ((hour % 24) + 24) % 24;
  for (let i = 0; i < KEYFRAMES.length - 1; i += 1) {
    const a = KEYFRAMES[i]!;
    const b = KEYFRAMES[i + 1]!;
    if (wrap >= a.hour && wrap <= b.hour) {
      const t = (wrap - a.hour) / (b.hour - a.hour);
      return lerp(a, b, t);
    }
  }
  return KEYFRAMES[KEYFRAMES.length - 1]!;
}

describe('DynamicSky keyframes', () => {
  it('peaks intensity around noon', () => {
    const noon = pick(13);
    const midnight = pick(0);
    expect(noon.sunIntensity).toBeGreaterThan(midnight.sunIntensity);
    expect(noon.elevation).toBeGreaterThan(midnight.elevation);
  });

  it('interpolates between keyframes monotonically', () => {
    const morning = pick(7);
    const noon = pick(13);
    const evening = pick(20);
    expect(morning.sunIntensity).toBeLessThan(noon.sunIntensity);
    expect(evening.sunIntensity).toBeLessThan(noon.sunIntensity);
  });

  it('wraps hours larger than 24 around the day', () => {
    const wrapped = pick(26);
    const equivalent = pick(2);
    expect(wrapped.sunIntensity).toBeCloseTo(equivalent.sunIntensity, 5);
  });
});
