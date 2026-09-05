import { StrictMode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { useTeleport } from 'gaesup-world';

import { Teleport } from '../teleport';

jest.mock('gaesup-world', () => ({
  ...jest.requireActual('gaesup-world'),
  useTeleport: jest.fn(),
}));

afterEach(() => {
  delete window.teleportTo;
  delete window.teleportToDestination;
});

test('StrictMode releases installed helpers and restores existing helpers', async () => {
  const previous = jest.fn(async () => {});
  window.teleportTo = previous;
  const teleport = jest.fn();
  jest.mocked(useTeleport).mockReturnValue({ teleport, canTeleport: true });
  const view = render(<StrictMode><Teleport /></StrictMode>);
  await window.teleportTo?.(1, 2, 3);
  expect(teleport.mock.calls[0]?.[0].toArray()).toEqual([1, 2, 3]);
  view.unmount();
  expect(window.teleportTo).toBe(previous);
  expect(window.teleportToDestination).toBeUndefined();
});

test('buttons use the current hook and cleanup preserves subsequently installed helpers', () => {
  const first = jest.fn();
  jest.mocked(useTeleport).mockReturnValue({ teleport: first, canTeleport: true });
  const view = render(<Teleport />);
  const second = jest.fn();
  jest.mocked(useTeleport).mockReturnValue({ teleport: second, canTeleport: true });
  view.rerender(<Teleport />);
  const external = jest.fn(async () => {});
  window.teleportToDestination = external;
  fireEvent.click(screen.getByRole('button', { name: '시작 지점' }));
  expect(second.mock.calls[0]?.[0].toArray()).toEqual([0, 0.8, 0]);
  expect(first).not.toHaveBeenCalled();
  expect(external).not.toHaveBeenCalled();
  view.unmount();
  expect(window.teleportToDestination).toBe(external);
  expect(window.teleportTo).toBeUndefined();
});
