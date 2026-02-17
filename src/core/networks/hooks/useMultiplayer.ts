import { useEffect, useRef, useState, useCallback, useMemo, type RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';

import { useGaesupStore } from '@stores/gaesupStore';

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
  rigidBodyRef?: RefObject<RapierRigidBody>;
}

interface UseMultiplayerResult extends MultiplayerState {
  connect: (options: MultiplayerConnectionOptions) => void;
  disconnect: () => void;
  startTracking: (playerRef: RefObject<RapierRigidBody>) => void;
  stopTracking: () => void;
  updateConfig: (config: Partial<MultiplayerConfig>) => void;
  sendChat: (text: string, options?: { range?: number; ttlMs?: number }) => void;
  speechByPlayerId: Map<string, string>;
  localSpeechText: string | null;
}

export function useMultiplayer(options: UseMultiplayerOptions): UseMultiplayerResult {
  const { config, characterUrl, rigidBodyRef } = options;
  const modeType = useGaesupStore((s) => s.mode?.type ?? 'character');
  const animationState = useGaesupStore((s) => s.animationState);
  
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
  const stateRef = useRef<MultiplayerState>(state);
  const modeTypeRef = useRef(modeType);
  const animationStateRef = useRef(animationState);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    modeTypeRef.current = modeType;
  }, [modeType]);

  useEffect(() => {
    animationStateRef.current = animationState;
  }, [animationState]);

  const [speechByPlayerId, setSpeechByPlayerId] = useState<Map<string, { text: string; expiresAt: number }>>(
    () => new Map()
  );
  const speechRef = useRef<Map<string, { text: string; expiresAt: number }>>(new Map());

  useEffect(() => {
    speechRef.current = speechByPlayerId;
  }, [speechByPlayerId]);

  // 외부에서 rigidBodyRef를 준 경우 자동 트래킹
  useEffect(() => {
    if (rigidBodyRef) {
      trackingPlayerRef.current = rigidBodyRef;
    }
  }, [rigidBodyRef]);

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
      reconnectAttempts: config.websocket.reconnectAttempts,
      reconnectDelay: config.websocket.reconnectDelay,
      pingInterval: config.websocket.pingInterval,
      sendRateLimit: config.tracking.sendRateLimit,
      enableAck: config.enableAck,
      reliableTimeout: config.reliableTimeout,
      reliableRetryCount: config.reliableRetryCount,
      logLevel: config.logLevel,
      logToConsole: config.logToConsole,
      onConnect: () => {
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          error: null,
          lastUpdate: Date.now()
        }));
      },
      onWelcome: (localPlayerId) => {
        setState(prev => ({
          ...prev,
          localPlayerId,
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
      onChat: (playerId, text, timestamp) => {
        void timestamp;
        const ttl = 2500;
        setSpeechByPlayerId((prev) => {
          const next = new Map(prev);
          next.set(playerId, { text, expiresAt: Date.now() + ttl });
          return next;
        });
      },
      onPing: (rttMs) => {
        setState(prev => ({
          ...prev,
          ping: rttMs,
          lastUpdate: Date.now(),
        }));
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
  }, [
    config.websocket.url,
    config.websocket.reconnectAttempts,
    config.websocket.reconnectDelay,
    config.websocket.pingInterval,
    config.tracking.sendRateLimit,
    config.logLevel,
    config.logToConsole
  ]);

  // 연결 해제
  const disconnect = useCallback(() => {
    networkManagerRef.current?.disconnect();
    positionTrackerRef.current?.reset();
    trackingPlayerRef.current = null;
    setSpeechByPlayerId(new Map());
    
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

  const sendChat = useCallback((text: string, options?: { range?: number; ttlMs?: number }) => {
    const manager = networkManagerRef.current;
    if (!manager) return;

    const range = options?.range ?? configRef.current.proximityRange;
    manager.sendChat(text, { range });

    const localId = state.localPlayerId;
    if (!localId) return;
    const ttl = options?.ttlMs ?? 2500;
    const safeText = String(text ?? '').trim().slice(0, 200);
    if (!safeText) return;

    setSpeechByPlayerId((prev) => {
      const next = new Map(prev);
      next.set(localId, { text: safeText, expiresAt: Date.now() + ttl });
      return next;
    });
  }, [state.localPlayerId]);

  // 위치 추적 및 네트워크 업데이트 (Canvas 밖에서도 동작해야 하므로 useFrame 금지)
  useEffect(() => {
    if (!state.isConnected) return;

    const tickMs = Math.max(15, Math.floor(1000 / Math.max(1, configRef.current.tracking.updateRate)));

    const id = window.setInterval(() => {
      const currentState = stateRef.current;
      if (!currentState.isConnected) return;
      if (!networkManagerRef.current || !positionTrackerRef.current) return;
      if (!trackingPlayerRef.current?.current) return;
      if (!connectionInfoRef.current) return;

      const { playerName, playerColor } = connectionInfoRef.current;
      const type = modeTypeRef.current;
      const localAnimation = animationStateRef.current?.[type]?.current ?? 'idle';
      const updateData = positionTrackerRef.current.trackPosition(
        trackingPlayerRef.current,
        playerName,
        playerColor,
        characterUrl,
        localAnimation,
      );

      if (updateData) {
        networkManagerRef.current.updateLocalPlayer(updateData);
      }

      // 말풍선 TTL 정리 (가벼운 GC) -- Map 재사용으로 불필요한 할당 방지
      if (speechRef.current.size > 0) {
        const now = Date.now();
        const keysToDelete: string[] = [];
        speechRef.current.forEach((v, k) => {
          if (v.expiresAt <= now) keysToDelete.push(k);
        });
        if (keysToDelete.length > 0) {
          const next = new Map(speechRef.current);
          for (const k of keysToDelete) next.delete(k);
          setSpeechByPlayerId(next);
        }
      }
    }, tickMs);

    return () => window.clearInterval(id);
  }, [state.isConnected, characterUrl]);

  // 정리
  useEffect(() => {
    return () => {
      networkManagerRef.current?.disconnect();
    };
  }, []);

  const speechTextMap = useMemo(() => {
    const m = new Map<string, string>();
    speechByPlayerId.forEach((v, k) => { m.set(k, v.text); });
    return m;
  }, [speechByPlayerId]);

  const localSpeechText = state.localPlayerId ? (speechByPlayerId.get(state.localPlayerId)?.text ?? null) : null;

  return {
    ...state,
    connect,
    disconnect,
    startTracking,
    stopTracking,
    updateConfig,
    sendChat,
    speechByPlayerId: speechTextMap,
    localSpeechText,
  };
} 