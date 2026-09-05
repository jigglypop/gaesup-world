import { fireEvent, render, screen } from '@testing-library/react';

import { WorldFocusModal } from '../world/focus';

const mockSetInteraction = jest.fn();
const mockBackend = { updateKeyboard: jest.fn(), updateMouse: jest.fn() };
const mockRestoreCamera = jest.fn();

jest.mock('gaesup-world', () => ({
  useInputBackend: () => mockBackend,
  useGaesupStore: { getState: () => ({ interaction: { isActive: true }, setInteractionActive: mockSetInteraction }) },
  requestCameraCloseUp: jest.fn(),
  restoreCameraCloseUp: () => mockRestoreCamera(),
}));

const FOCUS = { id: 'test', category: '주민', title: '이야기 나누기', description: '가까이 다가가 말을 걸어보세요.', target: [0, 0, 0] as [number, number, number] };

beforeEach(() => jest.clearAllMocks());

test.each(['Escape', 'Enter', ' '])('closes once on %s without leaking gameplay input', (key) => {
  const close = jest.fn();
  const gameplay = jest.fn();
  window.addEventListener('keydown', gameplay);
  const view = render(<WorldFocusModal focus={FOCUS} onClose={close} />);
  try {
    const button = screen.getByRole('button', { name: '닫기' });
    expect(document.activeElement).toBe(button);
    fireEvent.keyDown(button, { key });
    fireEvent.keyDown(button, { key, repeat: true });
    fireEvent.keyUp(button, { key });
    expect(close).toHaveBeenCalledTimes(1);
    expect(gameplay).not.toHaveBeenCalled();
  } finally {
    view.unmount();
    window.removeEventListener('keydown', gameplay);
  }
});

test('keeps Tab focus on the close action and returns focus after closing', () => {
  const trigger = document.createElement('button');
  document.body.append(trigger);
  trigger.focus();
  const close = jest.fn();
  const view = render(<WorldFocusModal focus={FOCUS} onClose={close} />);
  const button = screen.getByRole('button', { name: '닫기' });
  fireEvent.keyDown(button, { key: 'Tab' });
  fireEvent.keyDown(button, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(button);
  expect(close).not.toHaveBeenCalled();
  view.rerender(<WorldFocusModal focus={null} onClose={close} />);
  expect(document.activeElement).toBe(trigger);
  expect(mockSetInteraction.mock.calls).toEqual([[false], [true]]);
  expect(mockRestoreCamera).toHaveBeenCalledTimes(1);
  trigger.remove();
});
