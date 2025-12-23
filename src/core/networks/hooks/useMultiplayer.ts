import { useEffect, useRef, useState, useCallback, type RefObject } from 'react';

import { useFrame } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';

import { PlayerNetworkManager } from '../core/PlayerNetworkManager';
import { PlayerPositionTracker, PlayerTrackingConfig } from '../core/PlayerPositionTracker';
import { 
  MultiplayerConnectionOptions, 
  MultiplayerState, 
  MultiplayerConfig
} from '../types';

interface UseMultiplayerOptions {
  config: MultiplayerConfig;
  characterUrl?: string;
}

interface UseMultiplayerResult extends MultiplayerState {
  connect: (options: MultiplayerConnectionOptions) => void;
  disconnect: () => void;
  startTracking: (playerRef: RefObject<RapierRigidBody>) => void;
  stopTracking: () => void;
  updateConfig: (config: Partial<MultiplayerConfig>) => void;
}

export function useMultiplayer(options: UseMultiplayerOptions): UseMultiplayerResult {
  const { config, characterUrl } = options;
  
  // 상태 관리
  const [state, setState] = useState<MultiplayerState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    players: new Map(),
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  });

  // 연결 정보 저장
  const connectionInfoRef = useRef<{
    playerName: string;
    playerColor: string;
  } | null>(null);

  // 매니저들
  const networkManagerRef = useRef<PlayerNetworkManager | null>(null);
  const positionTrackerRef = useRef<PlayerPositionTracker | null>(null);
  const trackingPlayerRef = useRef<RefObject<RapierRigidBody> | null>(null);
  const configRef = useRef<MultiplayerConfig>(config);

  // 위치 추적 초기화
  useEffect(() => {
    const trackingConfig: PlayerTrackingConfig = {
      updateRate: config.tracking.updateRate,
      velocityThreshold: config.tracking.velocityThreshold,
      sendRateLimit: config.tracking.sendRateLimit
    };
    
    positionTrackerRef.current = new PlayerPositionTracker(trackingConfig);
  }, [config.tracking]);

  // 연결
  const connect = useCallback((connectionOptions: MultiplayerConnectionOptions) => {
    if (networkManagerRef.current) {
      networkManagerRef.current.disconnect();
    }

    // 연결 정보 저장
    connectionInfoRef.current = {
      playerName: connectionOptions.playerName,
      playerColor: connectionOptions.playerColor
    };

    setState(prev => ({ 
      ...prev, 
      connectionStatus: 'connecting',
      error: null,
      roomId: connectionOptions.roomId
    }));

    const manager = new PlayerNetworkManager({
      url: config.websocket.url,
      roomId: connectionOptions.roomId,
      playerName: connectionOptions.playerName,
      playerColor: connectionOptions.playerColor,
      onConnect: () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onDisconnect: () => {
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionStatus: 'disconnected',
          players: new Map(),
          localPlayerId: null,
          lastUpdate: Date.now()
        }));
      },
      onPlayerJoin: (playerId, playerState) => {
        setState(prev => {
          const newPlayers = new Map(prev.players);
          newPlayers.set(playerId, playerState);
          return {
            ...prev,
            players: newPlayers,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerUpdate: (playerId, playerState) => {
        setState(prev => {
          const newPlayers = new Map(prev.players);
          newPlayers.set(playerId, playerState);
          return {
            ...prev,
            players: newPlayers,
            lastUpdate: Date.now()
          };
        });
      },
      onPlayerLeave: (playerId) => {
        setState(prev => {
          const newPlayers = new Map(prev.players);
          newPlayers.delete(playerId);
          return {
            ...prev,
            players: newPlayers,
            lastUpdate: Date.now()
          };
        });
      },
      onError: (error) => {
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          error,
          lastUpdate: Date.now()
        }));
      }
    });

    networkManagerRef.current = manager;
    manager.connect();
  }, [config.websocket.url]);

  // 연결 해제
  const disconnect = useCallback(() => {
    networkManagerRef.current?.disconnect();
    positionTrackerRef.current?.reset();
    trackingPlayerRef.current = null;
    
    setState(prev => ({
      ...prev,
      isConnected: false,
      connectionStatus: 'disconnected',
      players: new Map(),
      localPlayerId: null,
      roomId: null,
      error: null
    }));
  }, []);

  // 위치 추적 시작
  const startTracking = useCallback((playerRef: RefObject<RapierRigidBody>) => {
    trackingPlayerRef.current = playerRef;
  }, []);

  // 위치 추적 중지
  const stopTracking = useCallback(() => {
    trackingPlayerRef.current = null;
    positionTrackerRef.current?.reset();
  }, []);

  // 설정 업데이트
  const updateConfig = useCallback((newConfig: Partial<MultiplayerConfig>) => {
    configRef.current = { ...configRef.current, ...newConfig };
    
    if (newConfig.tracking && positionTrackerRef.current) {
      positionTrackerRef.current.updateConfig(newConfig.tracking);
    }
  }, []);

  // 위치 추적 및 네트워크 업데이트 (useFrame)
  useFrame(() => {
    if (!state.isConnected || 
        !networkManagerRef.current || 
        !positionTrackerRef.current || 
        !trackingPlayerRef.current?.current) {
      return;
    }

    // 연결 정보가 없으면 종료
    if (!connectionInfoRef.current) return;

    const { playerName, playerColor } = connectionInfoRef.current;
    
    const updateData = positionTrackerRef.current.trackPosition(
      trackingPlayerRef.current,
      playerName,
      playerColor,
      characterUrl
    );

    if (updateData) {
      networkManagerRef.current.updateLocalPlayer(updateData);
    }
  });

  // 정리
  useEffect(() => {
    return () => {
      networkManagerRef.current?.disconnect();
    };
  }, []);

  return {
    ...state,
    connect,
    disconnect,
    startTracking,
    stopTracking,
    updateConfig
  };
} 