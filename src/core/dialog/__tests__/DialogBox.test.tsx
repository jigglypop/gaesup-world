import { act, fireEvent, render, screen } from '@testing-library/react';

import { DialogBox } from '../components/DialogBox';
import { getDialogRegistry } from '../registry/DialogRegistry';
import { useDialogStore } from '../stores/dialogStore';

afterEach(() => { useDialogStore.getState().close(); });

test.each(['click', 'key'] as const)('a stale conditional choice never executes the following choice via %s', (input) => {
  let hasWood = true;
  const effect = jest.fn();
  getDialogRegistry().register({ id: 'conditional-input', startId: 'a', nodes: {
    a: { id: 'a', text: '', choices: [
      { text: '목재 전달', condition: { type: 'custom', key: 'hasWood' }, effects: [{ type: 'custom', key: 'deliver' }] },
      { text: '다른 행동', effects: [{ type: 'custom', key: 'other' }] },
    ] },
  } });
  const view = render(<DialogBox />);
  try {
    act(() => {
      useDialogStore.getState().start('conditional-input', {
        onCustomEffect: effect,
        evaluateCondition: (condition) => condition.key === 'hasWood' && hasWood,
      });
    });
    expect(screen.getByRole('button', { name: /목재 전달/ })).toBeInTheDocument();
    hasWood = false;
    if (input === 'click') fireEvent.click(screen.getByRole('button', { name: /목재 전달/ }));
    else fireEvent.keyDown(window, { key: '1' });
    expect(effect).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: /목재 전달/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /다른 행동/ }));
    expect(effect).toHaveBeenCalledWith({ type: 'custom', key: 'other' }, {});
  } finally {
    view.unmount();
  }
});

function openDialogue() {
  getDialogRegistry().register({ id: 'input-test', startId: 'first', nodes: {
    first: { id: 'first', text: '첫 대사', next: 'second' },
    second: { id: 'second', text: '두 번째 대사', next: null },
  } });
  act(() => { useDialogStore.getState().start('input-test'); });
}

test('dialogue keys do not reach world listeners or skip lines on key repeat', () => {
  const worldKey = jest.fn();
  window.addEventListener('keydown', worldKey);
  const view = render(<DialogBox />);
  try {
    openDialogue();
    fireEvent.keyDown(window, { key: 'e' });
    expect(screen.getByText('두 번째 대사')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'e', repeat: true });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(worldKey).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'e' });
    expect(worldKey).toHaveBeenCalledTimes(1);
  } finally {
    view.unmount();
    window.removeEventListener('keydown', worldKey);
  }
});

test('pointer controls advance and close without a physical keyboard', () => {
  render(<DialogBox />);
  openDialogue();
  fireEvent.click(screen.getByRole('button', { name: '[E] 다음' }));
  expect(screen.getByText('두 번째 대사')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: '대화 닫기' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

test('when every choice is unavailable, next follows the fallback and allows the conversation to end', () => {
  getDialogRegistry().register({ id: 'unavailable-choices', startId: 'a', nodes: {
    a: { id: 'a', text: '목재가 필요해요', next: 'b', choices: [
      { text: '목재 건네기', condition: { type: 'custom', key: 'hasWood' }, next: null },
    ] },
    b: { id: 'b', text: '다음에 다시 만나요', next: null },
  } });
  const view = render(<DialogBox />);
  try {
    act(() => { useDialogStore.getState().start('unavailable-choices', { evaluateCondition: () => false }); });
    expect(screen.queryByRole('button', { name: /목재 건네기/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '[E] 다음' }));
    expect(screen.getByText('다음에 다시 만나요')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'e' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  } finally {
    view.unmount();
  }
});
