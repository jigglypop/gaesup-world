import { act, render, screen } from '@testing-library/react';

import { PerformancePanel } from '../PerformancePanel';

describe('PerformancePanel memory reporting', () => {
  const memoryDescriptor = Object.getOwnPropertyDescriptor(window.performance, 'memory');

  afterEach(() => {
    jest.restoreAllMocks();
    if (memoryDescriptor) Object.defineProperty(window.performance, 'memory', memoryDescriptor);
    else Reflect.deleteProperty(window.performance, 'memory');
  });

  test.each([
    undefined,
    { usedJSHeapSize: 10, jsHeapSizeLimit: 0 },
    { usedJSHeapSize: NaN, jsHeapSizeLimit: 100 },
    { usedJSHeapSize: -1, jsHeapSizeLimit: 100 },
  ])('does not present unavailable or invalid memory as zero usage: %j', (memory) => {
    Object.defineProperty(window.performance, 'memory', { configurable: true, value: memory });
    jest.spyOn(window.performance, 'now').mockReturnValue(0);
    const frames = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const view = render(<PerformancePanel />);
    act(() => frames.mock.calls[0]?.[0](500));
    expect(screen.getByText(/메모리 측정값이 없습니다/)).toBeTruthy();
    expect(screen.queryByText('0 MB')).toBeNull();
    view.unmount();
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1);
  });

  test('shows supported heap measurements and removes stale values when unavailable', () => {
    Object.defineProperty(window.performance, 'memory', {
      configurable: true, value: { usedJSHeapSize: 64 * 1048576, jsHeapSizeLimit: 256 * 1048576 },
    });
    jest.spyOn(window.performance, 'now').mockReturnValue(0);
    const frames = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(1);
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const view = render(<PerformancePanel />);
    act(() => frames.mock.calls[0]?.[0](500));
    expect(screen.getByText('64 MB')).toBeTruthy();
    expect(screen.getByText('256 MB')).toBeTruthy();
    expect(screen.getByText('25%')).toBeTruthy();
    Reflect.deleteProperty(window.performance, 'memory');
    act(() => frames.mock.calls.at(-1)?.[0](1000));
    expect(screen.queryByText('64 MB')).toBeNull();
    expect(screen.getByText(/메모리 측정값이 없습니다/)).toBeTruthy();
    view.unmount();
  });
});
