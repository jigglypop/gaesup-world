import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import type { MultiplayerState } from '../../types';
import { PlayerInfoOverlay } from '../PlayerInfoOverlay';

const DISCONNECTED_STATE: MultiplayerState = {
  isConnected: false,
  connectionStatus: 'disconnected',
  players: new Map(),
  localPlayerId: null,
  roomId: null,
  error: null,
  ping: 0,
  lastUpdate: 0,
};

const CONNECTED_STATE: MultiplayerState = {
  ...DISCONNECTED_STATE,
  isConnected: true,
  connectionStatus: 'connected',
  localPlayerId: 'local-1',
  roomId: 'room-1',
};

describe('PlayerInfoOverlay', () => {
  test('keeps the draft and displays a Korean error until retry succeeds', () => {
    const onSendChat = jest.fn().mockImplementationOnce(() => { throw new Error('send failed'); });
    render(<PlayerInfoOverlay state={CONNECTED_STATE} onDisconnect={jest.fn()} onSendChat={onSendChat} />);
    const input = screen.getByRole('textbox', { name: '채팅 메시지' });
    fireEvent.change(input, { target: { value: '안녕하세요' } });
    fireEvent.click(screen.getByRole('button', { name: '전송' }));
    expect(input).toHaveValue('안녕하세요');
    expect(screen.getByRole('alert')).toHaveTextContent('메시지를 보내지 못했습니다');
    fireEvent.click(screen.getByRole('button', { name: '전송' }));
    expect(onSendChat).toHaveBeenNthCalledWith(2, '안녕하세요');
    expect(input).toHaveValue('');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('supports connection transitions and sends trimmed chat text', () => {
    const onDisconnect = jest.fn();
    const onSendChat = jest.fn();
    const { container, rerender } = render(
      <PlayerInfoOverlay
        state={DISCONNECTED_STATE}
        onDisconnect={onDisconnect}
        onSendChat={onSendChat}
      />,
    );

    expect(container).toBeEmptyDOMElement();

    rerender(
      <PlayerInfoOverlay
        state={CONNECTED_STATE}
        onDisconnect={onDisconnect}
        onSendChat={onSendChat}
      />,
    );

    const input = screen.getByRole('textbox', { name: '채팅 메시지' });
    fireEvent.change(input, { target: { value: '한글 조합' } });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSendChat).not.toHaveBeenCalled();
    expect(input).toHaveValue('한글 조합');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSendChat).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '  hello world  ' } });
    const [sendButton, disconnectButton] = screen.getAllByRole('button');
    fireEvent.click(sendButton);

    expect(onSendChat).toHaveBeenCalledWith('hello world');
    expect(input).toHaveValue('');

    fireEvent.click(disconnectButton);
    expect(onDisconnect).toHaveBeenCalledTimes(1);

    rerender(
      <PlayerInfoOverlay
        state={DISCONNECTED_STATE}
        onDisconnect={onDisconnect}
        onSendChat={onSendChat}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
