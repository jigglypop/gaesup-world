import { act, render, screen } from '@testing-library/react';

import { AnimationDebugPanel } from '..';
import { useAnimationBridge } from '../../../hooks/useAnimationBridge';

jest.mock('../../../hooks/useAnimationBridge');

test('coalesces frame events and reads reused snapshots at the UI interval', () => {
  jest.useFakeTimers();
  const snapshot = {
    currentAnimation: 'walk', isPlaying: true, availableAnimations: ['walk'], weight: 1,
    speed: 1, metrics: { activeAnimations: 1 },
  };
  const read = jest.fn(() => snapshot);
  const unsubscribe = jest.fn();
  let notify: (snapshot: unknown, type: string) => void = () => {};
  (useAnimationBridge as jest.Mock).mockReturnValue({
    currentType: 'character',
    bridge: { snapshot: read, subscribe: (callback: typeof notify) => { notify = callback; return unsubscribe; } },
  });
  const view = render(<AnimationDebugPanel fields={[
    { key: 'speed', label: '속도', format: 'number', enabled: true },
    { key: 'isPlaying', label: '상태', format: 'text', enabled: true },
    { key: 'averageFrameTime', label: '평균 프레임 시간', format: 'number', enabled: true },
  ]} />);
  try {
    expect(screen.getByText('1.00')).toBeInTheDocument();
    expect(screen.getByText('재생 중')).toBeInTheDocument();
    expect(screen.getByText('정보 없음')).toBeInTheDocument();
    read.mockClear();
    snapshot.speed = 2;
    act(() => { for (let frame = 0; frame < 120; frame++) notify(snapshot, 'character'); });
    expect(read).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(250));
    expect(read).toHaveBeenCalledTimes(1);
    expect(screen.getByText('2.00')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(1000));
    expect(read).toHaveBeenCalledTimes(1);
    view.unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
    act(() => jest.advanceTimersByTime(1000));
    expect(read).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    jest.useRealTimers();
    jest.resetAllMocks();
  }
});
