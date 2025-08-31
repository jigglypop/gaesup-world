import React from 'react';
import { MultiplayerState } from '../types';

interface PlayerInfoOverlayProps {
  state: MultiplayerState;
  playerName?: string;
  onDisconnect: () => void;
}

export function PlayerInfoOverlay({ state, playerName, onDisconnect }: PlayerInfoOverlayProps) {
  const { isConnected, connectionStatus, players, roomId, error, ping } = state;

  if (!isConnected) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '20px',
      borderRadius: '10px',
      color: 'white',
      minWidth: '250px',
      backdropFilter: 'blur(5px)',
      border: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
      <h3 style={{ 
        marginTop: 0, 
        marginBottom: '15px',
        fontSize: '18px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '10px'
      }}>
        네트워크 정보
      </h3>
      
      <div style={{ marginBottom: '10px' }}>
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
        <div style={{ marginBottom: '10px' }}>
          <strong>플레이어:</strong> <span style={{ marginLeft: '8px' }}>{playerName}</span>
        </div>
      )}

      {roomId && (
        <div style={{ marginBottom: '10px' }}>
          <strong>방:</strong> <span style={{ marginLeft: '8px' }}>{roomId}</span>
        </div>
      )}

      <div style={{ marginBottom: '10px' }}>
        <strong>접속자:</strong> 
        <span style={{ marginLeft: '8px' }}>
          {players.size + (isConnected ? 1 : 0)}명
        </span>
      </div>

      {ping > 0 && (
        <div style={{ marginBottom: '15px' }}>
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
        <div style={{ marginBottom: '15px' }}>
          <strong>다른 플레이어:</strong>
          <div style={{ 
            marginTop: '8px',
            maxHeight: '150px',
            overflowY: 'auto',
            fontSize: '14px'
          }}>
            {Array.from(players.entries()).map(([playerId, player]) => (
              <div 
                key={playerId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '5px',
                  padding: '5px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '3px'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: player.color,
                    borderRadius: '50%',
                    marginRight: '8px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                />
                <span>{player.name}</span>
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

      <button
        onClick={onDisconnect}
        style={{
          width: '100%',
          padding: '10px',
          borderRadius: '5px',
          border: 'none',
          background: '#ff6b6b',
          color: 'white',
          fontSize: '14px',
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