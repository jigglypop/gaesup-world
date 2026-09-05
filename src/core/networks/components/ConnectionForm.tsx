import { useId, useState, type FormEvent } from 'react';

import type { MultiplayerConnectionOptions } from '../types';
import './ConnectionForm.css';

type ConnectionFormProps = {
  onConnect: (options: MultiplayerConnectionOptions) => void;
  error?: string | null;
  isConnecting?: boolean;
};

export function ConnectionForm({ onConnect, error, isConnecting }: ConnectionFormProps) {
  const formId = useId();
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('room1');
  const [playerColor, setPlayerColor] = useState(() => {
    const hex = Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, '0');
    return `#${hex}`;
  });
  const canConnect = Boolean(playerName.trim() && roomCode.trim() && !isConnecting);
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canConnect) return;
    onConnect({ roomId: roomCode.trim(), playerName: playerName.trim(), playerColor });
  };

  return (
    <div className="multiplayer-connection">
      <form
        className="multiplayer-connection__form"
        aria-labelledby={`${formId}-title`}
        aria-busy={Boolean(isConnecting)}
        onSubmit={handleSubmit}
      >
        <h2 id={`${formId}-title`}>함께 플레이하기</h2>
        <p id={`${formId}-hint`}>친구와 같은 방 코드를 입력하면 함께 만날 수 있습니다.</p>
        <label htmlFor={`${formId}-name`}>플레이어 이름</label>
        <input
          id={`${formId}-name`}
          name="nickname"
          autoComplete="nickname"
          placeholder="이름을 입력하세요"
          required
          value={playerName}
          onChange={(event) => setPlayerName(event.target.value)}
          disabled={isConnecting}
        />
        <label htmlFor={`${formId}-room`}>방 코드</label>
        <input
          id={`${formId}-room`}
          name="room"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={`${formId}-hint`}
          placeholder="방 코드를 입력하세요"
          required
          value={roomCode}
          onChange={(event) => setRoomCode(event.target.value)}
          disabled={isConnecting}
        />
        <label htmlFor={`${formId}-color`}>플레이어 색상</label>
        <input
          id={`${formId}-color`}
          type="color"
          value={playerColor}
          onChange={(event) => setPlayerColor(event.target.value)}
          disabled={isConnecting}
        />
        <button type="submit" disabled={!canConnect}>
          {isConnecting ? '연결 중…' : '방에 입장하기'}
        </button>
        {error && (
          <div>
            <p className="multiplayer-connection__error" role="alert">
              방에 연결할 수 없습니다. 연결 상태와 방 코드를 확인하고 다시 시도해 주세요.
            </p>
            <details>
              <summary>연결 진단</summary>
              <p>{error}</p>
            </details>
          </div>
        )}
      </form>
    </div>
  );
}
