import { act, renderHook } from '@testing-library/react';

import { useTimeOfDay } from '../hooks/useGameTime';
import { useTimeStore } from '../stores/timeStore';

const initialState = useTimeStore.getInitialState();

afterEach(() => {
  useTimeStore.setState({ ...initialState, listeners: new Set() });
});

describe('useTimeOfDay', () => {
  it('렌더를 반복해도 같은 참조를 반환하고 무한 렌더에 빠지지 않는다', () => {
    const { result, rerender } = renderHook(() => useTimeOfDay());
    const first = result.current;

    rerender();
    rerender();

    expect(result.current).toBe(first);
    expect(first).toEqual({ hour: 8, minute: 0 });
  });

  it('시와 분이 바뀔 때만 새 값을 반환한다', () => {
    const { result } = renderHook(() => useTimeOfDay());
    const first = result.current;

    act(() => useTimeStore.getState().tick(16));
    expect(result.current).toBe(first);

    act(() => useTimeStore.getState().setTotalMinutes(9 * 60 + 30));
    expect(result.current).toEqual({ hour: 9, minute: 30 });
    expect(result.current).not.toBe(first);
  });
});
