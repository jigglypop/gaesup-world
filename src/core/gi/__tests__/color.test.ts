import { hexToLinearRgb } from '../index';

describe('색상 변환', () => {
  it('sRGB 16진수를 선형 RGB로 변환한다', () => {
    const [r, g, b] = hexToLinearRgb('#ff8000');

    expect(r).toBeCloseTo(1, 6);
    expect(g).toBeCloseTo(0.2158605, 5);
    expect(b).toBeCloseTo(0, 6);
  });

  it('짧은 표기와 # 없는 표기도 해석한다', () => {
    expect(hexToLinearRgb('#fff')).toEqual(hexToLinearRgb('ffffff'));
    expect(hexToLinearRgb('#0f0')).toEqual(hexToLinearRgb('#00ff00'));
  });

  it('해석할 수 없는 값은 중간 회색을 반환한다', () => {
    expect(hexToLinearRgb(undefined)).toEqual([0.5, 0.5, 0.5]);
    expect(hexToLinearRgb('')).toEqual([0.5, 0.5, 0.5]);
    expect(hexToLinearRgb('#12')).toEqual([0.5, 0.5, 0.5]);
    expect(hexToLinearRgb('#gg0000')).toEqual([0.5, 0.5, 0.5]);
  });

  it('어두운 값은 선형 구간 공식을 쓴다', () => {
    const [r] = hexToLinearRgb('#0a0000');

    expect(r).toBeCloseTo(10 / 255 / 12.92, 9);
  });
});
