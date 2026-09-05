import { act, fireEvent, render, screen } from '@testing-library/react';

import { useKeyboard } from '../../../hooks/useKeyboard';
import { createMemoryInputBackend } from '../../core/adapter';
import { GamePad } from '../Gamepad';

const mockBackend = createMemoryInputBackend();
let mockMode = 'gamepad';
jest.mock('../../hooks', () => ({ useInputBackend: () => mockBackend }));
jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (select: (state: object) => unknown) => select({
    mode: { controller: mockMode },
    interaction: { isActive: true, keyboard: mockBackend.getKeyboard() },
    automation: { queue: { isRunning: false } },
    stopAutomation: () => {},
  }),
}));

function Controller() {
  useKeyboard();
  return null;
}

test('screen buttons work without subscribing to physical movement keys', () => {
  mockMode = 'gamepad';
  const view = render(<GamePad />);
  fireEvent.keyDown(window, { code: 'KeyW' });
  expect(mockBackend.getKeyboard().forward).toBe(false);
  const forward = screen.getByRole('button', { name: '앞으로' });
  fireEvent.pointerDown(forward);
  expect(mockBackend.getKeyboard().forward).toBe(true);
  fireEvent.keyUp(window, { code: 'KeyW' });
  expect(mockBackend.getKeyboard().forward).toBe(true);
  view.unmount();
  expect(mockBackend.getKeyboard().forward).toBe(false);
});

test('combines a physical keyboard and gamepad buttons through the actual input ownership path', () => {
  mockMode = 'gamepad';
  const view = render(<><Controller /><GamePad /></>);
  const forward = screen.getByRole('button', { name: '앞으로' });
  act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); });
  fireEvent.pointerDown(forward);
  act(() => { window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); });
  expect(mockBackend.getKeyboard().forward).toBe(true);
  fireEvent.pointerCancel(forward);
  expect(mockBackend.getKeyboard().forward).toBe(false);
  fireEvent.pointerDown(forward);
  view.rerender(<Controller />);
  expect(mockBackend.getKeyboard().forward).toBe(false);
  act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); });
  expect(mockBackend.getKeyboard().forward).toBe(true);
  view.unmount();
  expect(mockBackend.getKeyboard().forward).toBe(false);
});

test('leaving gamepad mode preserves another controller holding the same physical key', () => {
  mockMode = 'gamepad';
  const view = render(<><Controller /><GamePad /></>);
  act(() => { window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' })); });
  fireEvent.pointerDown(screen.getByRole('button', { name: '앞으로' }));
  mockMode = 'keyboard';
  view.rerender(<><Controller /><GamePad /></>);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(mockBackend.getKeyboard().forward).toBe(true);
  act(() => { window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' })); });
  expect(mockBackend.getKeyboard().forward).toBe(false);
  view.unmount();
});

test('window focus loss clears the pressed appearance and allows the next press', () => {
  mockMode = 'gamepad';
  const view = render(<GamePad />);
  const forward = screen.getByRole('button', { name: '앞으로' });
  fireEvent.pointerDown(forward);
  expect(forward).toHaveAttribute('aria-pressed', 'true');
  fireEvent.blur(window);
  expect(mockBackend.getKeyboard().forward).toBe(false);
  expect(forward).toHaveAttribute('aria-pressed', 'false');
  fireEvent.pointerDown(forward);
  expect(mockBackend.getKeyboard().forward).toBe(true);
  fireEvent.pointerUp(forward);
  expect(mockBackend.getKeyboard().forward).toBe(false);
  view.unmount();
});

test('hiding the document cancels a pressed button without waiting for pointer up', () => {
  mockMode = 'gamepad';
  const hidden = jest.spyOn(document, 'hidden', 'get');
  const view = render(<GamePad />);
  try {
    const forward = screen.getByRole('button', { name: '앞으로' });
    fireEvent.pointerDown(forward);
    hidden.mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    expect(forward).toHaveAttribute('aria-pressed', 'true');
    hidden.mockReturnValue(true);
    fireEvent(document, new Event('visibilitychange'));
    expect(mockBackend.getKeyboard().forward).toBe(false);
    expect(forward).toHaveAttribute('aria-pressed', 'false');
    hidden.mockReturnValue(false);
    fireEvent(document, new Event('visibilitychange'));
    fireEvent.pointerDown(forward);
    expect(mockBackend.getKeyboard().forward).toBe(true);
  } finally {
    view.unmount();
    hidden.mockRestore();
  }
  expect(mockBackend.getKeyboard().forward).toBe(false);
});
