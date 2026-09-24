import { useEffect, useRef, useState, useCallback, useMemo, type RefObject } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';

import { useGaesupStore } from '@stores/gaesupStore';

import { LivePlayerMap } from '../core/LivePlayerMap';
import { PlayerNetworkManager } from '../core/PlayerNetworkManager';
import { PlayerPositionTracker, PlayerTrackingConfig } from '../core/PlayerPositionTracker';
import { 
  MultiplayerConnectionOptions, 
  MultiplayerState, 
  MultiplayerConfig,
  PlayerState
} from '../types';

/** Transform-only updates refresh `lastUpdate` for status UIs at most this often. */
const TRANSFORM_STATUS_INTERVAL_MS = 250;

interface UseMultiplayerOptions {
  config: MultiplayerConfig;
  characterUrl?: string;
  rigidBodyRef?: RefObject<RapierRigidBody>;
}

interface UseMultiplayerResult extends MultiplayerState {
  /** Same as `players`; entries stay current between renders and support per-player subscriptions. */
  players: LivePlayerMap;
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
  
  const playersRef = useRef<LivePlayerMap>(new LivePlayerMap());
  const statusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 상태 관리
  const [state, setState] = useState<MultiplayerState & { players: LivePlayerMap }>(() => ({
    isConnected: false,
    connectionStatus: 'disconnected',
    players: playersRef.current,
    localPlayerId: null,
    roomId: null,
    error: null,
    ping: 0,
    lastUpdate: 0
  }));

  const cancelStatusRefresh = useCallback(() => {
    if (statusTimerRef.current === null) return;
    clearTimeout(statusTimerRef.current);
    statusTimerRef.current = null;
  }, []);

  const commitPlayers = useCallback((next: LivePlayerMap, extra?: Partial<MultiplayerState>) => {
    playersRef.current = next;
    cancelStatusRefresh();
    setState(prev => ({ ...prev, ...extra, players: next, lastUpdate: Date.now() }));
  }, [cancelStatusRefresh]);

  const scheduleStatusRefresh = useCallback(() => {
    if (statusTimerRef.current !== null) return;
    statusTimerRef.current = setTimeout(() => {
      statusTimerRef.current = null;
      setState(prev => ({ ...prev, lastUpdate: Date.now() }));
    }, TRANSFORM_STATUS_INTERVAL_MS);
  }, []);

  const addOrPublishPlayer = useCallback((playerId: string, playerState: PlayerState) => {
    const current = playersRef.current;
    if (current.publish(playerId, playerState)) {
      scheduleStatusRefresh();
      return;
    }
    const next = new LivePlayerMap(current);
    next.set(playerId, playerState);
    commitPlayers(next);
  }, [commitPlayers, scheduleStatusRefresh]);

  // 연결 정보 저장
  const connectionInfoRef = useRef<{
    playerName: string;
    playerColor: string;
  } | null>(null);

  // 매니저들
  const networkManagerRef = useRef<PlayerNetworkManager | null>(null);
  const positionTrackerRef = useRef<PlayerPositionTracker | null>(null);
  const trackingPlayerRef = useRef<RefObject<RapierRigidBody> | null>(null);
  const configOverridesRef = useRef<Partial<MultiplayerConfig>>({});
  const [trackingUpdateRate, setTrackingUpdateRate] = useState(config.tracking.updateRate);
  const stateRef = useRef<MultiplayerState & { players: LivePlayerMap }>(state);
  const modeTypeRef = useRef(modeType);
  const animationStateRef = useRef(animationState);
  const characterUrlRef = useRef(characterUrl);
  characterUrlRef.current = characterUrl;

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

  useEffect(() => {
    if (speechByPlayerId.size === 0) return;
    let nextExpiry = Infinity;
    for (const speech of speechByPlayerId.values()) {
      nextExpiry = Math.min(nextExpiry, speech.expiresAt);
    }
    const timer = window.setTimeout(() => {
      const now = Date.now();
      setSpeechByPlayerId((current) => {
        const next = new Map(current);
        for (const [playerId, speech] of next) {
          if (speech.expiresAt <= now) next.delete(playerId);
        }
        return next;
      });
    }, Math.max(0, nextExpiry - Date.now()));
    return () => window.clearTimeout(timer);
  }, [speechByPlayerId]);

  // 외부에서 rigidBodyRef를 준 경우 자동 트래킹
  useEffect(() => {
    if (rigidBodyRef) {
      trackingPlayerRef.current = rigidBodyRef;
    }
  }, [rigidBodyRef]);

  // 위치 추적 초기화
  useEffect(() => {
    // Changed tracking props replace imperative tracking settings, matching the active tracker.
    delete configOverridesRef.current.tracking;
    const trackingConfig: PlayerTrackingConfig = {
      updateRate: config.tracking.updateRate,
      velocityThreshold: config.tracking.velocityThreshold,
      sendRateLimit: config.tracking.sendRateLimit
    };
    
    if (positionTrackerRef.current) positionTrackerRef.current.updateConfig(trackingConfig);
    else positionTrackerRef.current = new PlayerPositionTracker(trackingConfig);
    setTrackingUpdateRate(trackingConfig.updateRate);
  }, [config.tracking.updateRate, config.tracking.velocityThreshold, config.tracking.sendRateLimit]);

  // 연결
  const connect = useCallback((connectionOptions: MultiplayerConnectionOptions) => {
    if (networkManagerRef.current) {
      networkManagerRef.current.disconnect();
    }
    if (rigidBodyRef) trackingPlayerRef.current = rigidBodyRef;

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

    const effectiveConfig = { ...config, ...configOverridesRef.current };
    const manager = new PlayerNetworkManager({
      url: effectiveConfig.websocket.url,
      roomId: connectionOptions.roomId,
      playerName: connectionOptions.playerName,
      playerColor: connectionOptions.playerColor,
      ...(characterUrlRef.current ? { modelUrl: characterUrlRef.current } : {}),
      reconnectAttempts: effectiveConfig.websocket.reconnectAttempts,
      reconnectDelay: effectiveConfig.websocket.reconnectDelay,
      pingInterval: effectiveConfig.websocket.pingInterval,
      sendRateLimit: effectiveConfig.tracking.sendRateLimit,
      enableAck: effectiveConfig.enableAck,
      reliableTimeout: effectiveConfig.reliableTimeout,
      reliableRetryCount: effectiveConfig.reliableRetryCount,
      logLevel: effectiveConfig.logLevel,
      logToConsole: effectiveConfig.logToConsole,
      onConnect: () => {
        positionTrackerRef.current?.reset();
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
        commitPlayers(new LivePlayerMap(), {
          isConnected: false,
          connectionStatus: 'disconnected',
          localPlayerId: null,
        });
      },
      onPlayerJoin: addOrPublishPlayer,
      onPlayerUpdate: addOrPublishPlayer,
      onPlayerLeave: (playerId) => {
        const current = playersRef.current;
        if (!current.has(playerId)) return;
        const next = new LivePlayerMap(current);
        next.delete(playerId);
        commitPlayers(next);
        next.notify(playerId);
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
    config.logToConsole,
    config.enableAck,
    config.reliableTimeout,
    config.reliableRetryCount,
    rigidBodyRef,
    addOrPublishPlayer,
    commitPlayers,
  ]);

  // 연결 해제
  const disconnect = useCallback(() => {
    networkManagerRef.current?.disconnect();
    positionTrackerRef.current?.reset();
    trackingPlayerRef.current = null;
    setSpeechByPlayerId(new Map());

    commitPlayers(new LivePlayerMap(), {
      isConnected: false,
      connectionStatus: 'disconnected',
      localPlayerId: null,
      roomId: null,
      error: null,
    });
  }, [commitPlayers]);

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
    configOverridesRef.current = { ...configOverridesRef.current, ...newConfig };
    
    if (newConfig.tracking) {
      positionTrackerRef.current?.updateConfig(newConfig.tracking);
      setTrackingUpdateRate(newConfig.tracking.updateRate);
    }
  }, []);

  const sendChat = useCallback((text: string, options?: { range?: number; ttlMs?: number }) => {
    const manager = networkManagerRef.current;
    if (!manager) return;

    const range = options?.range ?? configOverridesRef.current.proximityRange ?? config.proximityRange;
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
  }, [state.localPlayerId, config.proximityRange]);

  // 위치 추적 및 네트워크 업데이트 (Canvas 밖에서도 동작해야 하므로 useFrame 금지)
  useEffect(() => {
    if (!state.isConnected) return;

    const tickMs = Math.max(15, Math.floor(1000 / Math.max(1, trackingUpdateRate)));

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
        const { modelUrl, ...baseUpdate } = updateData;
        networkManagerRef.current.updateLocalPlayer(
          modelUrl ? { ...baseUpdate, modelUrl } : baseUpdate,
        );
      }

    }, tickMs);

    return () => window.clearInterval(id);
  }, [state.isConnected, characterUrl, trackingUpdateRate]);

  // 정리
  useEffect(() => {
    return () => {
      networkManagerRef.current?.disconnect();
      cancelStatusRefresh();
    };
  }, [cancelStatusRefresh]);

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
