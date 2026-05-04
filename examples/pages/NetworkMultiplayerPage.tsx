import React, { useRef } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';

import {
  ConnectionForm,
  MultiplayerCanvas,
  PlayerInfoOverlay,
  defaultMultiplayerConfig,
  useMultiplayer,
} from '../../src/network';
import { CHARACTER_URL, VEHICLE_URL, AIRPLANE_URL } from '../config/constants';

export function NetworkMultiplayerPage() {
  const playerRef = useRef<RapierRigidBody>(null!);
  const playerNameRef = useRef<string>('');
  const playerColorRef = useRef<string>('');
  
  const multiplayer = useMultiplayer({
    config: defaultMultiplayerConfig,
    characterUrl: CHARACTER_URL,
    rigidBodyRef: playerRef,
  });
  if (!multiplayer.isConnected) {
    return (
      <ConnectionForm
        onConnect={(options) => {
          playerNameRef.current = options.playerName;
          playerColorRef.current = options.playerColor;
          multiplayer.connect(options);
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
        localPlayerColor={playerColorRef.current}
        // Disable proximity culling for movement testing.
        // (Otherwise the remote player disappears when distance > proximityRange.)
        proximityRange={0}
        speechByPlayerId={multiplayer.speechByPlayerId}
        localSpeechText={multiplayer.localSpeechText}
      />
      
      <PlayerInfoOverlay
        state={multiplayer}
        playerName={playerNameRef.current}
        onSendChat={(text) => multiplayer.sendChat(text)}
        onDisconnect={() => {
          multiplayer.stopTracking();
          multiplayer.disconnect();
        }}
      />
    </>
  );
} 
