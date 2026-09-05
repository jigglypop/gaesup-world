import {
  cx,
  defaultClassFor,
  formatDebugValue,
  hasMetricChanged,
  isVec3Like,
  mergeLabels,
  mergeStyle,
  readMetricValue,
  resolveEnabledFields,
  toVec3,
} from '../helpers';
import { createInitialCameraMetrics } from '../defaults';

describe('CameraDebugPanel helper', () => {
  test('벡터 값을 판정하고 포맷한다', () => {
    expect(isVec3Like({ x: 1, y: 2, z: 3 })).toBe(true);
    expect(toVec3({ x: 1, y: 2, z: 3 })).toEqual({ x: 1, y: 2, z: 3 });
    expect(formatDebugValue({ x: 1, y: 2, z: 3 }, 1)).toBe('X:1.0 Y:2.0 Z:3.0');
    expect(formatDebugValue(undefined, 2, 'Empty')).toBe('Empty');
  });
  test('변경 여부와 metric 값을 읽는다', () => {
    const metrics = createInitialCameraMetrics(10);
    expect(hasMetricChanged({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 })).toBe(true);
    expect(hasMetricChanged('a', 'a')).toBe(false);
    expect(readMetricValue(metrics, 'mode')).toBe('unknown');
    expect(readMetricValue(metrics, 'missing')).toBeUndefined();
  });
  test('클래스와 라벨과 스타일을 병합한다', () => {
    expect(cx('root', false, null, 'active')).toBe('root active');
    expect(defaultClassFor('root')).toBe('camera-debug-panel');
    expect(mergeLabels({ empty: 'Empty' }).empty).toBe('Empty');
    expect(mergeStyle({ root: { opacity: 1 } }, 'root', { display: 'grid' })).toEqual({
      display: 'grid',
      opacity: 1,
    });
  });
  test('활성 필드와 custom field를 합친다', () => {
    const fields = resolveEnabledFields(
      [
        { key: 'mode', label: 'Mode', enabled: true },
        { key: 'fov', label: 'FOV', enabled: false },
      ],
      [{ key: 'custom', label: 'Custom', getValue: () => 1 }],
    );
    expect(fields.map((field) => field.key)).toEqual(['mode', 'custom']);
  });
});
