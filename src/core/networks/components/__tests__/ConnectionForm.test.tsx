import { fireEvent, render, screen } from '@testing-library/react';

import { ConnectionForm } from '../ConnectionForm';

test('submits trimmed room and name with the selected color', () => {
  const onConnect = jest.fn();
  render(<ConnectionForm onConnect={onConnect} />);
  fireEvent.change(screen.getByLabelText('플레이어 이름'), { target: { value: '  나무  ' } });
  fireEvent.change(screen.getByLabelText('방 코드'), { target: { value: '  친구방  ' } });
  fireEvent.change(screen.getByLabelText('플레이어 색상'), { target: { value: '#123456' } });
  fireEvent.submit(screen.getByRole('form', { name: '함께 플레이하기' }));
  expect(onConnect).toHaveBeenCalledWith({
    roomId: '친구방',
    playerName: '나무',
    playerColor: '#123456',
  });
});

test('blocks whitespace rooms and submissions during connection', () => {
  const onConnect = jest.fn();
  const { rerender } = render(<ConnectionForm onConnect={onConnect} />);
  fireEvent.change(screen.getByLabelText('플레이어 이름'), { target: { value: '나무' } });
  fireEvent.change(screen.getByLabelText('방 코드'), { target: { value: '  ' } });
  expect(screen.getByRole('button', { name: '방에 입장하기' })).toBeDisabled();
  fireEvent.submit(screen.getByRole('form'));
  expect(onConnect).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('방 코드'), { target: { value: '친구방' } });
  rerender(<ConnectionForm onConnect={onConnect} isConnecting />);
  fireEvent.submit(screen.getByRole('form'));
  expect(onConnect).not.toHaveBeenCalled();
  expect(screen.getByLabelText('플레이어 이름')).toBeDisabled();
  expect(screen.getByRole('form')).toHaveAttribute('aria-busy', 'true');
  rerender(<ConnectionForm onConnect={onConnect} error="Connection timed out" />);
  expect(screen.getByRole('alert')).toHaveTextContent('방에 연결할 수 없습니다');
  expect(screen.getByRole('alert')).not.toHaveTextContent('Connection timed out');
  expect(screen.getByText('Connection timed out').closest('details')).not.toHaveAttribute('open');
  expect(screen.getByRole('button', { name: '방에 입장하기' })).toBeEnabled();
});
