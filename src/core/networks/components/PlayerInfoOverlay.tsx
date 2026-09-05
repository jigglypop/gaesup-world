import { useCallback, useState } from 'react';

import { MultiplayerState } from '../types';

interface PlayerInfoOverlayProps {
  state: MultiplayerState;
  playerName?: string;
  onDisconnect: () => void;
  onSendChat?: (text: string) => void;
}

export function PlayerInfoOverlay({
  state,
  playerName,
  onDisconnect,
  onSendChat,
}: PlayerInfoOverlayProps) {
  const { isConnected, connectionStatus, players, roomId, error, ping, localPlayerId, lastUpdate } =
    state;
  const [chatText, setChatText] = useState('');
  const [chatError, setChatError] = useState(false);

  const handleSendChat = useCallback(() => {
    if (!onSendChat) return;
    const safe = chatText.trim();
    if (!safe) return;
    try {
      onSendChat(safe);
      setChatText('');
      setChatError(false);
    } catch {
      setChatError(true);
    }
  }, [onSendChat, chatText]);

  if (!isConnected) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 'calc(var(--app-header-height, 0px) + 10px)',
        left: 10,
        background: 'rgba(0, 0, 0, 0.8)',
        padding: '8px',
        borderRadius: '6px',
        color: 'white',
        boxSizing: 'border-box',
        width: 'min(320px, calc(100vw - 20px))',
        maxHeight: 'calc(100dvh - var(--app-header-height, 0px) - 20px)',
        overflowY: 'auto',
        overflowWrap: 'anywhere',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        lineHeight: 1.2,
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: '6px',
          fontSize: '12px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
          paddingBottom: '6px',
        }}
      >
        함께 플레이 중
      </h3>

      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <strong>상태:</strong>
        <span
          style={{
            marginLeft: '8px',
            color: connectionStatus === 'connected' ? '#4CAF50' : '#ff6b6b',
          }}
        >
          {connectionStatus === 'connected'
            ? '연결됨'
            : connectionStatus === 'connecting'
              ? '연결 중'
              : connectionStatus === 'error'
                ? '오류'
                : '연결 끊김'}
        </span>
      </div>

      {playerName && (
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>플레이어:</strong> <span style={{ marginLeft: '8px' }}>{playerName}</span>
        </div>
      )}

      {roomId && (
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>방:</strong> <span style={{ marginLeft: '8px' }}>{roomId}</span>
        </div>
      )}

      <details style={{ marginBottom: '8px', fontSize: '12px' }}>
        <summary style={{ cursor: 'pointer' }}>연결 진단</summary>
        {error && <p>{error}</p>}
        {localPlayerId && (
          <div style={{ marginBottom: '6px', fontSize: '12px' }}>
            <strong>내 ID:</strong> <span style={{ marginLeft: '8px' }}>{localPlayerId}</span>
          </div>
        )}

        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>최근 업데이트:</strong>
          <span style={{ marginLeft: '8px' }}>
            {lastUpdate ? `${Math.max(0, Date.now() - lastUpdate)}ms 전` : '-'}
          </span>
        </div>
      </details>

      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <strong>접속자:</strong>
        <span style={{ marginLeft: '8px' }}>{players.size + (isConnected ? 1 : 0)}명</span>
      </div>

      {ping > 0 && (
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>핑:</strong>
          <span
            style={{
              marginLeft: '8px',
              color: ping < 50 ? '#4CAF50' : ping < 100 ? '#FFA726' : '#ff6b6b',
            }}
          >
            {ping}ms
          </span>
        </div>
      )}

      {players.size > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong>다른 플레이어:</strong>
          <div
            style={{
              marginTop: '6px',
              maxHeight: '80px',
              overflowY: 'auto',
              fontSize: '11px',
            }}
          >
            {Array.from(players.entries()).map(([playerId, player]) => (
              <div
                key={playerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px',
                  padding: '3px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: player.color,
                    borderRadius: '50%',
                    marginRight: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  {player.name}
                  <details>
                    <summary style={{ cursor: 'pointer' }}>플레이어 진단</summary>
                    <span style={{ opacity: 0.7, marginLeft: '8px' }}>
                      ({player.position[0].toFixed(1)},{player.position[1].toFixed(1)},
                      {player.position[2].toFixed(1)})
                    </span>
                    {player.animation ? (
                      <span style={{ opacity: 0.7, marginLeft: '8px' }}>{player.animation}</span>
                    ) : null}
                  </details>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            color: '#ff6b6b',
            marginBottom: '15px',
            padding: '8px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '5px',
            fontSize: '14px',
          }}
        >
          연결에 문제가 발생했습니다. 연결 상태를 확인하고 필요하면 방에 다시 입장해 주세요.
        </div>
      )}

      {onSendChat ? (
        <div style={{ marginBottom: '8px' }}>
          <strong>채팅:</strong>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input
              aria-label="채팅 메시지"
              maxLength={200}
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="메시지를 입력하세요"
              style={{
                flex: 1,
                minWidth: 0,
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '12px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  handleSendChat();
                }
              }}
            />
            <button
              onClick={handleSendChat}
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                border: 'none',
                background: '#4CAF50',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer',
              }}
              disabled={!chatText.trim()}
            >
              전송
            </button>
          </div>
          {chatError && (
            <p role="alert" style={{ color: '#ff9b9b', margin: '6px 0 0' }}>
              메시지를 보내지 못했습니다. 연결을 확인하고 다시 전송해 주세요.
            </p>
          )}
        </div>
      ) : null}

      <button
        onClick={onDisconnect}
        style={{
          width: '100%',
          padding: '8px',
          borderRadius: '4px',
          border: 'none',
          background: '#ff6b6b',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ff5252';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#ff6b6b';
        }}
      >
        연결 끊기
      </button>
    </div>
  );
}
