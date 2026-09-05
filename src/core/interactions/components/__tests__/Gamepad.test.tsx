import { fireEvent, render, screen } from '@testing-library/react';

import { GamePad } from '../Gamepad';

const mockPushKey = jest.fn(() => true);
const mockUseKeyboard = jest.fn(() => ({ pushKey: mockPushKey }));
let mockMode = 'gamepad';
jest.mock('@hooks/useKeyboard', () => ({ useKeyboard: (...args: unknown[]) => mockUseKeyboard(...args) }));
jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: (select: (state: object) => unknown) => select({
    mode: { controller: mockMode },
    interaction: { keyboard: { forward: false, backward: false, space: false } },
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockMode = 'gamepad';
});

test('uses one input subscription for all buttons and preserves custom labels', () => {
  const view = render(<GamePad label={{ backward: '물러나기' }} />);
  expect(mockUseKeyboard).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: '앞으로' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '물러나기' })).toBeInTheDocument();
  const jump = screen.getByRole('button', { name: '점프' });
  fireEvent.pointerDown(jump);
  fireEvent.mouseDown(jump);
  expect(mockPushKey).toHaveBeenCalledTimes(1);
  expect(mockPushKey).toHaveBeenLastCalledWith('space', true);
  fireEvent.pointerCancel(jump);
  expect(mockPushKey).toHaveBeenLastCalledWith('space', false);
  fireEvent.pointerDown(jump);
  view.unmount();
  expect(mockPushKey).toHaveBeenLastCalledWith('space', false);
});

test('supports keyboard activation and removes held buttons when the mode changes', () => {
  const view = render(<GamePad />);
  const forward = screen.getByRole('button', { name: '앞으로' });
  fireEvent.keyDown(forward, { key: 'Enter' });
  expect(mockPushKey).toHaveBeenLastCalledWith('forward', true);
  fireEvent.keyUp(forward, { key: 'Enter' });
  expect(mockPushKey).toHaveBeenLastCalledWith('forward', false);
  fireEvent.pointerDown(forward);
  mockMode = 'keyboard';
  view.rerender(<GamePad />);
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(mockPushKey).toHaveBeenLastCalledWith('forward', false);
  expect(mockUseKeyboard).toHaveBeenLastCalledWith(true, true, undefined, false, false);
  mockMode = 'gamepad';
  view.rerender(<GamePad />);
  expect(screen.getByRole('button', { name: '앞으로' })).toHaveAttribute('aria-pressed', 'false');
});
