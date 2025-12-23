import React, { useRef } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';

import { 
  useMultiplayer,
  ConnectionForm,
  PlayerInfoOverlay,
  MultiplayerCanvas,
  defaultMultiplayerConfig
} from '../../src/core/networks';
import { CHARACTER_URL, VEHICLE_URL, AIRPLANE_URL } from '../config/constants';

export function NetworkMultiplayerPage() {
  const playerRef = useRef<RapierRigidBody | null>(null);
  const playerNameRef = useRef<string>('');
  
  const multiplayer = useMultiplayer({
    config: defaultMultiplayerConfig,
    characterUrl: CHARACTER_URL
  });

  // 연결되지 않은 경우 연결 폼 표시
  if (!multiplayer.isConnected) {
    return (
      <ConnectionForm
        onConnect={(options) => {
          playerNameRef.current = options.playerName;
          multiplayer.connect(options);
          // 연결 후 위치 추적 시작
          setTimeout(() => {
            multiplayer.startTracking(playerRef);
          }, 1000);
        }}
        error={multiplayer.error}
        isConnecting={multiplayer.connectionStatus === 'connecting'}
      />
    );
  }

  return (
    <>
      <MultiplayerCanvas
        players={multiplayer.players}
        characterUrl={CHARACTER_URL}
        vehicleUrl={VEHICLE_URL}
        airplaneUrl={AIRPLANE_URL}
        playerRef={playerRef}
        config={defaultMultiplayerConfig}
      />
      
      <PlayerInfoOverlay
        state={multiplayer}
        playerName={playerNameRef.current}
        onDisconnect={() => {
          multiplayer.stopTracking();
          multiplayer.disconnect();
        }}
      />
    </>
  );
} 