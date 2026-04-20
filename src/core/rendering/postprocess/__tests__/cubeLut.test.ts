import { parseCubeLut } from '../cubeLut';

describe('parseCubeLut', () => {
  it('parses a small 3D LUT with title and domain', () => {
    const text = [
      '# sample',
      'TITLE "demo"',
      'LUT_3D_SIZE 2',
      'DOMAIN_MIN 0 0 0',
      'DOMAIN_MAX 1 1 1',
      '0 0 0',
      '1 0 0',
      '0 1 0',
      '1 1 0',
      '0 0 1',
      '1 0 1',
      '0 1 1',
      '1 1 1',
    ].join('\n');

    const lut = parseCubeLut(text);
    expect(lut.size).toBe(2);
    expect(lut.title).toBe('demo');
    expect(lut.data.length).toBe(2 * 2 * 2 * 4);
    // last triplet is white at (1,1,1)
    expect(lut.data[28]).toBeCloseTo(1);
    expect(lut.data[29]).toBeCloseTo(1);
    expect(lut.data[30]).toBeCloseTo(1);
    expect(lut.data[31]).toBeCloseTo(1);
  });

  it('throws on missing size header', () => {
    expect(() => parseCubeLut('0 0 0\n1 1 1\n')).toThrow(/missing.*SIZE/);
  });

  it('throws when too few samples are provided', () => {
    const text = ['LUT_3D_SIZE 2', '0 0 0', '1 0 0'].join('\n');
    expect(() => parseCubeLut(text)).toThrow(/expected 8 samples/);
  });

  it('handles 1D LUT by promoting to a degenerate 3D cube', () => {
    const text = ['LUT_1D_SIZE 2', '0 0 0', '1 1 1'].join('\n');
    const lut = parseCubeLut(text);
    expect(lut.size).toBe(2);
    expect(lut.data.length).toBe(2 * 2 * 2 * 4);
  });
});
