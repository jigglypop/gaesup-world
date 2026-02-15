import React, { useState } from 'react';

import { MultiplayerConnectionOptions } from '../types';

interface ConnectionFormProps {
  onConnect: (options: MultiplayerConnectionOptions) => void;
  error?: string | null;
  isConnecting?: boolean;
}

export function ConnectionForm({ onConnect, error, isConnecting }: ConnectionFormProps) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('room1');
  const [playerColor] = useState(() => {
    // Ensure a valid CSS hex color: always "#RRGGBB".
    const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
    return `#${hex}`;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    onConnect({
      roomId: roomCode,
      playerName: playerName.trim(),
      playerColor: playerColor
    });
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#1a1a1a'
    }}>
      <form
        onSubmit={handleSubmit}
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          padding: '40px',
          borderRadius: '10px',
          color: 'white',
          minWidth: '300px'
        }}
      >
        <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
          네트워크 멀티플레이어
        </h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            플레이어 이름
          </label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: '#333',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            방 코드
          </label>
          <input
            type="text"
            placeholder="방 코드"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
            disabled={isConnecting}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '5px',
              border: '1px solid #ccc',
              background: '#333',
              color: 'white',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            플레이어 색상
          </label>
          <div
            style={{
              width: '30px',
              height: '30px',
              backgroundColor: playerColor,
              borderRadius: '50%',
              border: '2px solid #ccc'
            }}
          />
        </div>

        <button
          type="submit"
          disabled={!playerName.trim() || isConnecting}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '5px',
            border: 'none',
            background: (!playerName.trim() || isConnecting) ? '#666' : '#4CAF50',
            color: 'white',
            fontSize: '16px',
            cursor: (!playerName.trim() || isConnecting) ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s'
          }}
        >
          {isConnecting ? '연결 중...' : '연결하기'}
        </button>

        {error && (
          <div style={{
            color: '#ff6b6b',
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '5px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}
      </form>
    </div>
  );
} 