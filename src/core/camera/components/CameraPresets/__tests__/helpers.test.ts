import {
  compareDistance,
  cx,
  defaultClassFor,
  getCurrentPresetId,
  getOptionDistance,
  mergeLabels,
  mergeStyle,
} from '../helpers';

describe('CameraPresets helper', () => {
  test('클래스 이름과 라벨을 병합한다', () => {
    expect(cx('root', false, undefined, 'active')).toBe('root active');
    expect(mergeLabels({ empty: 'Empty' }).empty).toBe('Empty');
  });
  test('카메라 거리 값을 비교하고 옵션에서 추출한다', () => {
    expect(compareDistance({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 3 })).toBe(true);
    expect(compareDistance({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 })).toBe(false);
    expect(getOptionDistance({ xDistance: 1, yDistance: 2, zDistance: 3 })).toEqual({
      x: 1,
      y: 2,
      z: 3,
    });
    expect(getOptionDistance({ xDistance: 1 })).toBeUndefined();
    expect(
      getCurrentPresetId(
        [
          {
            id: 'match',
            name: 'Match',
            description: 'Match preset',
            config: { mode: 'fixed', distance: { x: 1, y: 2, z: 3 }, fov: 55 },
          },
        ],
        'fixed',
        { xDistance: 1, yDistance: 2, zDistance: 3 },
      ),
    ).toBe('match');
  });
  test('스타일과 기본 클래스를 슬롯 기준으로 반환한다', () => {
    expect(mergeStyle({ root: { opacity: 1 } }, 'root', { display: 'grid' })).toEqual({
      display: 'grid',
      opacity: 1,
    });
    expect(defaultClassFor('root')).toBe('camera-presets-panel');
  });
});
