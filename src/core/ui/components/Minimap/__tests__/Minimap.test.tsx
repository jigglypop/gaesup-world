import { act, fireEvent, render } from '@testing-library/react';
import { StrictMode } from 'react';
import { Euler, Vector3 } from 'three';

import { MiniMap } from '..';
import { MinimapSystem } from '../../../core/MinimapSystem';

const mockActiveState = { position: new Vector3(), euler: new Euler() };
jest.mock('../../../../motions/hooks/useStateSystem', () => ({
  useStateSystem: () => ({ activeState: mockActiveState }),
}));
jest.mock('../../../../building/stores/buildingStore', () => ({
  useBuildingStore: () => new Map(),
}));

beforeEach(() => {
  mockActiveState.position.set(0, 0, 0);
  mockActiveState.euler.set(0, 0, 0);
});

test.each([false, true])('suspends background polling and resumes immediately (initially hidden: %s)', (initiallyHidden) => {
  jest.useFakeTimers();
  let hidden = initiallyHidden;
  jest.spyOn(document, 'hidden', 'get').mockImplementation(() => hidden);
  const check = jest.spyOn(MinimapSystem.prototype, 'checkForUpdates');
  const view = render(<MiniMap updateInterval={100} />);
  try {
    const canvas = view.getByLabelText('주변 지도') as HTMLCanvasElement;
    const clear = jest.spyOn(canvas.getContext('2d')!, 'clearRect');
    expect(jest.getTimerCount()).toBe(initiallyHidden ? 0 : 1);
    hidden = true;
    fireEvent(document, new Event('visibilitychange'));
    clear.mockClear();
    check.mockClear();
    act(() => {
      mockActiveState.position.x = 5;
      jest.advanceTimersByTime(1000);
    });
    fireEvent.click(view.getByLabelText('지도 확대'));
    expect(jest.getTimerCount()).toBe(0);
    expect(check).not.toHaveBeenCalled();
    expect(clear).not.toHaveBeenCalled();
    hidden = false;
    fireEvent(document, new Event('visibilitychange'));
    expect(check).toHaveBeenCalledTimes(1);
    expect(clear).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
    fireEvent(document, new Event('visibilitychange'));
    expect(jest.getTimerCount()).toBe(1);
  } finally {
    view.unmount();
    check.mockClear();
    fireEvent(document, new Event('visibilitychange'));
    expect(check).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});

test('avoids rotation-only redraws when locked while preserving movement and unlocking', () => {
  jest.useFakeTimers();
  const view = render(<MiniMap blockRotate updateInterval={100} />);
  try {
    const canvas = view.getByLabelText('주변 지도') as HTMLCanvasElement;
    const clear = jest.spyOn(canvas.getContext('2d')!, 'clearRect');
    act(() => { jest.advanceTimersByTime(100); });
    clear.mockClear();
    for (let index = 1; index <= 10; index += 1) {
      act(() => {
        mockActiveState.euler.y = index / 10;
        jest.advanceTimersByTime(100);
      });
    }
    expect(clear).not.toHaveBeenCalled();
    act(() => {
      mockActiveState.position.x = 1;
      jest.advanceTimersByTime(100);
    });
    expect(clear).toHaveBeenCalledTimes(1);
    view.rerender(<MiniMap blockRotate={false} updateInterval={100} />);
    act(() => { jest.advanceTimersByTime(100); });
    clear.mockClear();
    act(() => {
      mockActiveState.euler.y = 2;
      jest.advanceTimersByTime(100);
    });
    expect(clear).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});

test('applies size and polling interval changes without retaining the previous timer', () => {
  jest.useFakeTimers();
  const check = jest.spyOn(MinimapSystem.prototype, 'checkForUpdates');
  const view = render(<MiniMap size={280} updateInterval={100} />);
  try {
    const canvas = view.getByLabelText('주변 지도') as HTMLCanvasElement;
    const clear = jest.spyOn(canvas.getContext('2d')!, 'clearRect');
    expect(canvas.width).toBe(280);
    expect(canvas.height).toBe(280);
    expect(canvas.parentElement).toHaveStyle({ width: '280px', height: '280px' });
    act(() => { jest.advanceTimersByTime(99); });
    expect(check).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1); });
    expect(check).toHaveBeenCalledTimes(1);

    view.rerender(<MiniMap size={160} updateInterval={250} />);
    expect(canvas.width).toBe(160);
    expect(canvas.height).toBe(160);
    expect(canvas.parentElement).toHaveStyle({ width: '160px', height: '160px' });
    expect(clear).toHaveBeenLastCalledWith(0, 0, 160, 160);
    check.mockClear();
    act(() => { jest.advanceTimersByTime(249); });
    expect(check).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(1); });
    expect(check).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
  } finally {
    view.unmount();
    expect(jest.getTimerCount()).toBe(0);
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});

test('keeps canvases independent and shared markers alive when another map unmounts', () => {
  jest.useFakeTimers();
  const shared = MinimapSystem.getInstance();
  const maps = (showFirst: boolean) => (
    <StrictMode>
      {showFirst && <MiniMap key="first" />}
      <MiniMap key="second" />
    </StrictMode>
  );
  const view = render(maps(true));
  try {
    const [first, second] = view.getAllByLabelText('주변 지도') as HTMLCanvasElement[];
    const firstClear = jest.spyOn(first.getContext('2d')!, 'clearRect');
    const secondClear = jest.spyOn(second.getContext('2d')!, 'clearRect');
    firstClear.mockClear();
    secondClear.mockClear();
    fireEvent.click(view.getAllByLabelText('지도 확대')[0]);
    expect(firstClear).toHaveBeenCalled();
    expect(secondClear).not.toHaveBeenCalled();
    const secondText = jest.spyOn(second.getContext('2d')!, 'fillText');
    act(() => {
      shared.addMarker('shared-home', 'normal', '공유 집', new Vector3(), new Vector3(1, 1, 1));
      jest.advanceTimersByTime(40);
    });
    expect(secondText).toHaveBeenCalledWith('공유 집', 0, 0);
    view.rerender(maps(false));
    expect(MinimapSystem.getInstance()).toBe(shared);
    expect(shared.getMarker('shared-home')).toBeDefined();
    secondClear.mockClear();
    secondText.mockClear();
    act(() => {
      shared.updateMarker('shared-home', { text: '새 집' });
      jest.advanceTimersByTime(40);
    });
    expect(secondClear).toHaveBeenCalled();
    expect(secondText).toHaveBeenCalledWith('새 집', 0, 0);
    secondText.mockClear();
    act(() => {
      shared.removeMarker('shared-home');
      jest.advanceTimersByTime(40);
    });
    expect(secondText).not.toHaveBeenCalledWith('새 집', 0, 0);
  } finally {
    view.unmount();
    shared.removeMarker('shared-home');
    expect(jest.getTimerCount()).toBe(0);
    jest.restoreAllMocks();
    jest.useRealTimers();
  }
});

test('honors initial zoom and custom bounds and redraws a stationary map on zoom', () => {
  const view = render(<MiniMap scale={2} minScale={1.9} maxScale={2.1} />);
  try {
    const canvas = view.getByLabelText('주변 지도') as HTMLCanvasElement;
    const context = canvas.getContext('2d')!;
    const clear = jest.spyOn(context, 'clearRect');
    clear.mockClear();
    const zoomIn = view.getByLabelText('지도 확대') as HTMLButtonElement;
    const zoomOut = view.getByLabelText('지도 축소') as HTMLButtonElement;
    expect(zoomIn.disabled).toBe(false);
    fireEvent.click(zoomIn);
    expect(zoomIn.disabled).toBe(true);
    expect(clear).toHaveBeenCalled();
    fireEvent.click(zoomOut);
    fireEvent.click(zoomOut);
    expect(zoomOut.disabled).toBe(true);
    clear.mockClear();
    fireEvent.wheel(canvas, { deltaY: 1 });
    expect(zoomOut.disabled).toBe(true);
    expect(clear).not.toHaveBeenCalled();
  } finally {
    view.unmount();
    jest.restoreAllMocks();
  }
});
