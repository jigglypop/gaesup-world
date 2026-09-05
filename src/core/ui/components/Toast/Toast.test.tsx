import { act, render, screen } from '@testing-library/react';

import { ToastHost } from '.';
import { notify, useToastStore } from './toastStore';

test('new notifications do not postpone existing expiration', () => {
  jest.useFakeTimers();
  const previous = useToastStore.getState();
  useToastStore.getState().clear();
  const view = render(<ToastHost />);
  try {
    act(() => { notify('info', '첫 알림', { durationMs: 1000 }); });
    act(() => { jest.advanceTimersByTime(800); notify('success', '다음 알림', { durationMs: 1000 }); });
    expect(screen.getByRole('log', { name: '알림' })).toHaveTextContent('첫 알림');
    act(() => jest.advanceTimersByTime(200));
    expect(screen.queryByText('첫 알림')).not.toBeInTheDocument();
    expect(screen.getByText('다음 알림')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(800));
    expect(screen.queryByText('다음 알림')).not.toBeInTheDocument();
    act(() => { notify('info', '남은 타이머'); });
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    view.unmount();
    useToastStore.setState(previous);
    jest.useRealTimers();
  }
});
