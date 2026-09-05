import { sigmaFromDistance, weightFromDistance, weightFromSigma } from '../sfe';

describe('sfe utils', () => {
  test('sigmaFromDistance clamps to [0, strength]', () => {
    expect(sigmaFromDistance(0, 10, 20, 4)).toBe(0);
    expect(sigmaFromDistance(10, 10, 20, 4)).toBe(0);
    expect(sigmaFromDistance(20, 10, 20, 4)).toBe(4);
    expect(sigmaFromDistance(100, 10, 20, 4)).toBe(4);
  });

  test('weightFromSigma is exp(-sigma)', () => {
    expect(weightFromSigma(0)).toBe(1);
    expect(weightFromSigma(1)).toBeCloseTo(Math.exp(-1), 8);
    expect(weightFromSigma(-1)).toBe(1);
  });

  test('weightFromDistance uses hard cutoff at far', () => {
    expect(weightFromDistance(0, 10, 20, 4)).toBe(1);
    expect(weightFromDistance(10, 10, 20, 4)).toBe(1);
    expect(weightFromDistance(20, 10, 20, 4)).toBe(0);
    expect(weightFromDistance(100, 10, 20, 4)).toBe(0);
  });
});

