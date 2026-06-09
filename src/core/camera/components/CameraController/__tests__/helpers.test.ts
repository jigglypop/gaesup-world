import { cx, defaultClassFor, mergeLabels, mergeStyle } from '../helpers';

describe('CameraController helper', () => {
  test('클래스 이름과 라벨을 병합한다', () => {
    expect(cx('root', false, undefined, 'active')).toBe('root active');
    expect(mergeLabels({ title: 'Custom' }).title).toBe('Custom');
  });
  test('스타일과 기본 클래스를 슬롯 기준으로 반환한다', () => {
    expect(mergeStyle({ root: { opacity: 1 } }, 'root', { display: 'grid' })).toEqual({
      display: 'grid',
      opacity: 1,
    });
    expect(defaultClassFor('root')).toBe('camera-controller-panel');
  });
});
