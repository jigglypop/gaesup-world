import { act, fireEvent, render, screen } from '@testing-library/react';

import { createGaesupRuntime, GaesupRuntimeProvider } from '../../runtime';
import { CinematicPanel } from '../components/panels/CinematicPanel';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

test('preview uses the owning world and stop cancels its timer and later effects', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup(); const event = jest.fn();
  const view = render(<GaesupRuntimeProvider runtime={runtime}><CinematicPanel beats={[{ kind: 'closeUp', target: [1, 0, 0], durationMs: 1000 }, { kind: 'event', name: 'late' }]} playbackOptions={{ onEvent: event }} /></GaesupRuntimeProvider>);
  try {
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' })); expect(runtime.store.getState().cameraOption.focus).toBe(true);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: '중지' })); });
    expect(screen.getByText('미리 보기가 중지됐습니다')).toBeTruthy(); expect(runtime.store.getState().cameraOption.focus).toBe(false);
    await act(async () => { await jest.runAllTimersAsync(); }); expect(event).not.toHaveBeenCalled(); expect(runtime.cinematics.getStats().pendingTimers).toBe(0);
  } finally { view.unmount(); await runtime.dispose(); }
});

test('custom previews receive cancellation, detach external signals on stop, and cannot publish stale completion', async () => {
  const controller = new AbortController(); const removed = jest.spyOn(controller.signal, 'removeEventListener');
  const signals: AbortSignal[] = []; const resolves: Array<() => void> = [];
  const onPreview = jest.fn((_beats, signal: AbortSignal | undefined) => { signals.push(signal!); return new Promise<void>(resolve => resolves.push(resolve)); });
  const view = render(<CinematicPanel beats={[]} playbackOptions={{ signal: controller.signal }} onPreview={onPreview} />);
  try {
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' }));
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' })); expect(signals[0]!.aborted).toBe(true); expect(signals[1]!.aborted).toBe(false); expect(removed).toHaveBeenCalled();
    await act(async () => { resolves[0]!(); }); expect(screen.getByText('미리 보기 재생 중')).toBeTruthy();
    view.unmount(); expect(signals[1]!.aborted).toBe(true); await act(async () => { resolves[1]!(); });
  } finally { view.unmount(); removed.mockRestore(); }
});

test('world disposal aborts custom preview and an inactive world cannot start another', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup(); let signal: AbortSignal | undefined; let finish = () => {};
  const onPreview = jest.fn((_beats, supplied: AbortSignal | undefined) => { signal = supplied; return new Promise<void>(resolve => { finish = resolve; }); });
  const view = render(<GaesupRuntimeProvider runtime={runtime}><CinematicPanel beats={[]} onPreview={onPreview} /></GaesupRuntimeProvider>);
  try {
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' }));
    await act(async () => { await runtime.dispose(); }); expect(signal?.aborted).toBe(true); expect(screen.getByText('미리 보기가 중지됐습니다')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' })); expect(onPreview).toHaveBeenCalledTimes(1);
    expect(screen.getByText('월드가 비활성 상태입니다')).toBeTruthy(); await act(async () => { finish(); });
    expect(screen.getByText('월드가 비활성 상태입니다')).toBeTruthy();
  } finally { view.unmount(); await runtime.dispose(); }
});

test('external abort and errors settle previews without leaking camera state', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup(); const controller = new AbortController();
  const view = render(<GaesupRuntimeProvider runtime={runtime}><CinematicPanel beats={[{ kind: 'closeUp', target: [1, 0, 0], durationMs: 1000 }]} playbackOptions={{ signal: controller.signal }} /></GaesupRuntimeProvider>);
  try {
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' })); await act(async () => { controller.abort(); });
    expect(runtime.cinematics.getStats().pendingTimers).toBe(0); expect(runtime.store.getState().cameraOption.focus).toBe(false); expect(screen.getByText('미리 보기가 중지됐습니다')).toBeTruthy();
    view.rerender(<GaesupRuntimeProvider runtime={runtime}><CinematicPanel beats={[{ kind: 'closeUp', target: [1, 0, 0] }, { kind: 'event', name: 'fail' }]} playbackOptions={{ onEvent: () => { throw new Error('preview failed'); } }} /></GaesupRuntimeProvider>);
    fireEvent.click(screen.getByRole('button', { name: '미리 보기' })); await act(async () => { await jest.runAllTimersAsync(); });
    expect(screen.getByText('미리 보기 실패: preview failed')).toBeTruthy(); expect(runtime.store.getState().cameraOption.focus).toBe(false);
  } finally { view.unmount(); await runtime.dispose(); }
});
