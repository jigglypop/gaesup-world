import React, { useCallback, useState } from 'react';

import { MultiplayerState } from '../types';

interface PlayerInfoOverlayProps {
  state: MultiplayerState;
  playerName?: string;
  onDisconnect: () => void;
  onSendChat?: (text: string) => void;
}

export function PlayerInfoOverlay({ state, playerName, onDisconnect, onSendChat }: PlayerInfoOverlayProps) {
  const { isConnected, connectionStatus, players, roomId, error, ping, localPlayerId, lastUpdate } = state;
  const [chatText, setChatText] = useState('');

  if (!isConnected) return null;

  const sendChat = useCallback(() => {
    if (!onSendChat) return;
    const safe = chatText.trim();
    if (!safe) return;
    onSendChat(safe);
    setChatText('');
  }, [onSendChat, chatText]);

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      left: 10,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '8px',
      borderRadius: '6px',
      color: 'white',
      minWidth: '160px',
      backdropFilter: 'blur(5px)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      lineHeight: 1.2,
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '6px',
        fontSize: '12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '6px'
      }}>
        네트워크 정보
      </h3>
      
      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <strong>상태:</strong> 
        <span style={{ 
          marginLeft: '8px',
          color: connectionStatus === 'connected' ? '#4CAF50' : '#ff6b6b'
        }}>
          {connectionStatus === 'connected' ? '연결됨' : 
           connectionStatus === 'connecting' ? '연결 중' : 
           connectionStatus === 'error' ? '오류' : '연결 끊김'}
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

      {localPlayerId && (
        <div style={{ marginBottom: '6px', fontSize: '12px' }}>
          <strong>내 ID:</strong> <span style={{ marginLeft: '8px' }}>{localPlayerId}</span>
        </div>
      )}

      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <strong>최근 업데이트:</strong>
        <span style={{ marginLeft: '8px' }}>{lastUpdate ? `${Math.max(0, Date.now() - lastUpdate)}ms 전` : '-'}</span>
      </div>

      <div style={{ marginBottom: '6px', fontSize: '12px' }}>
        <strong>접속자:</strong> 
        <span style={{ marginLeft: '8px' }}>
          {players.size + (isConnected ? 1 : 0)}명
        </span>
      </div>

      {ping > 0 && (
        <div style={{ marginBottom: '8px', fontSize: '12px' }}>
          <strong>핑:</strong> 
          <span style={{ 
            marginLeft: '8px',
            color: ping < 50 ? '#4CAF50' : ping < 100 ? '#FFA726' : '#ff6b6b'
          }}>
            {ping}ms
          </span>
        </div>
      )}

      {players.size > 0 && (
        <div style={{ marginBottom: '8px' }}>
          <strong>다른 플레이어:</strong>
          <div style={{ 
            marginTop: '6px',
            maxHeight: '80px',
            overflowY: 'auto',
            fontSize: '11px'
          }}>
            {Array.from(players.entries()).map(([playerId, player]) => (
              <div 
                key={playerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '4px',
                  padding: '3px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    backgroundColor: player.color,
                    borderRadius: '50%',
                    marginRight: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
                <span style={{ flex: 1 }}>
                  {player.name}
                  <span style={{ opacity: 0.7, marginLeft: '8px' }}>
                    ({player.position[0].toFixed(1)},{player.position[1].toFixed(1)},{player.position[2].toFixed(1)})
                  </span>
                  {player.animation ? (
                    <span style={{ opacity: 0.7, marginLeft: '8px' }}>
                      {player.animation}
                    </span>
                  ) : null}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div style={{
          color: '#ff6b6b',
          marginBottom: '15px',
          padding: '8px',
          background: 'rgba(255, 107, 107, 0.1)',
          borderRadius: '5px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {onSendChat ? (
        <div style={{ marginBottom: '8px' }}>
          <strong>채팅:</strong>
          <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
            <input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              placeholder="Enter로 전송"
              style={{
                flex: 1,
                padding: '6px',
                borderRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'white',
                fontSize: '12px',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  sendChat();
                }
              }}
            />
            <button
              onClick={sendChat}
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
          transition: 'background-color 0.2s'
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