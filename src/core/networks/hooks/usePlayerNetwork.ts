import { useEffect, useRef, useState, useCallback } from 'react';

import { PlayerNetworkManager } from '../core/PlayerNetworkManager';
import type { PlayerState } from '../types';

interface UsePlayerNetworkOptions {
  url: string;
  roomId: string;
  playerName: string;
  playerColor: string;
}

interface UsePlayerNetworkResult {
  isConnected: boolean;
  players: Map<string, PlayerState>;
  error: string | undefined;
  connect: (overrideOptions?: Partial<UsePlayerNetworkOptions>) => void;
  disconnect: () => void;
  updateLocalPlayer: (state: Partial<PlayerState>) => void;
}

export function usePlayerNetwork(defaultOptions: UsePlayerNetworkOptions): UsePlayerNetworkResult {
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Map<string, PlayerState>>(new Map());
  const [error, setError] = useState<string | undefined>();
  const managerRef = useRef<PlayerNetworkManager | null>(null);

  const connect = useCallback((overrideOptions?: Partial<UsePlayerNetworkOptions>) => {
    const options = { ...defaultOptions, ...overrideOptions };
    
    if (managerRef.current) {
      managerRef.current.disconnect();
    }

    const manager = new PlayerNetworkManager({
      url: options.url,
      roomId: options.roomId,
      playerName: options.playerName,
      playerColor: options.playerColor,
      onConnect: () => {
        console.log('[usePlayerNetwork] 연결 성공');
        setIsConnected(true);
        setError(undefined);
      },
      onDisconnect: () => {
        console.log('[usePlayerNetwork] 연결 종료');
        setIsConnected(false);
        setPlayers(new Map());
      },
      onPlayerJoin: (playerId, state) => {
        console.log('[usePlayerNetwork] 플레이어 추가:', playerId, state);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.set(playerId, state);
          console.log('[usePlayerNetwork] 업데이트된 플레이어 맵:', newPlayers);
          return newPlayers;
        });
      },
      onPlayerUpdate: (playerId, state) => {
        console.log('[usePlayerNetwork] 플레이어 업데이트:', playerId, state);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.set(playerId, state);
          return newPlayers;
        });
      },
      onPlayerLeave: (playerId) => {
        console.log('[usePlayerNetwork] 플레이어 떠남:', playerId);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.delete(playerId);
          return newPlayers;
        });
      },
      onError: (err) => {
        console.error('[usePlayerNetwork] 에러:', err);
        setError(err);
      }
    });

    managerRef.current = manager;
    manager.connect();
  }, [defaultOptions]);

  // 연결 해제
  const disconnect = useCallback(() => {
    managerRef.current?.disconnect();
    setIsConnected(false);
    setPlayers(new Map());
  }, []);

  // 로컬 플레이어 상태 업데이트
  const updateLocalPlayer = useCallback((state: Partial<PlayerState>) => {
    managerRef.current?.updateLocalPlayer(state);
  }, []);

  // 콜백 설정
  useEffect(() => {
    managerRef.current?.setCallbacks({
      onPlayerJoin: (playerId, state) => {
        console.log('[usePlayerNetwork] 플레이어 추가:', playerId, state);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.set(playerId, state);
          console.log('[usePlayerNetwork] 업데이트된 플레이어 맵:', newPlayers);
          return newPlayers;
        });
      },
      onPlayerUpdate: (playerId, state) => {
        console.log('[usePlayerNetwork] 플레이어 업데이트:', playerId, state);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.set(playerId, state);
          return newPlayers;
        });
      },
      onPlayerLeave: (playerId) => {
        console.log('[usePlayerNetwork] 플레이어 떠남:', playerId);
        setPlayers(prev => {
          const newPlayers = new Map(prev);
          newPlayers.delete(playerId);
          return newPlayers;
        });
      }
    });
  }, []);

  // 정리
  useEffect(() => {
    return () => {
      managerRef.current?.disconnect();
    };
  }, []);

  return {
    isConnected,
    players,
    error,
    connect,
    disconnect,
    updateLocalPlayer
  };
} 