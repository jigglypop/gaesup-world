import { useCallback, useRef, useEffect } from 'react';

import { Vector3 } from 'three';

import { useNetworkBridge, UseNetworkBridgeOptions } from './useNetworkBridge';

export interface NPCConnectionOptions {
  position: Vector3;
  metadata?: Record<string, unknown>;
  autoConnect?: boolean;
  connectionRange?: number;
}

export interface ConnectionOptions {
  reliable?: boolean;
  bandwidth?: number;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  timeout?: number;
}

export interface UseNPCConnectionOptions extends UseNetworkBridgeOptions {
  npcId: string;
  initialOptions?: NPCConnectionOptions;
}

export interface UseNPCConnectionResult {
  // NPC 관리
  registerNPC: (options: NPCConnectionOptions) => void;
  unregisterNPC: () => void;
  updatePosition: (position: Vector3) => void;
  
  // 연결 관리
  connectTo: (targetId: string, options?: ConnectionOptions) => void;
  disconnectFrom: (targetId: string) => void;
  
  // 상태 조회
  isRegistered: boolean;
  getConnections: () => string[];
  getPosition: () => Vector3 | null;
  
  // 브릿지 기능
  executeCommand: ReturnType<typeof useNetworkBridge>['executeCommand'];
  getSnapshot: ReturnType<typeof useNetworkBridge>['getSnapshot'];
  isReady: boolean;
}

/**
 * NPC 연결 관리를 위한 훅
 */
export function useNPCConnection(options: UseNPCConnectionOptions): UseNPCConnectionResult {
  const { npcId, initialOptions, ...bridgeOptions } = options;
  
  const {
    executeCommand,
    getSnapshot,
    isReady
  } = useNetworkBridge(bridgeOptions);

  const isRegisteredRef = useRef<boolean>(false);
  const currentPositionRef = useRef<Vector3 | null>(null);
  const connectionsRef = useRef<Set<string>>(new Set());

  // 초기 NPC 등록
  useEffect(() => {
    if (isReady && initialOptions && !isRegisteredRef.current) {
      registerNPC(initialOptions);
    }

    return () => {
      if (isRegisteredRef.current) {
        unregisterNPC();
      }
    };
  }, [isReady, initialOptions]);

  const registerNPC = useCallback((npcOptions: NPCConnectionOptions) => {
    if (!isReady || isRegisteredRef.current) return;

    executeCommand({
      type: 'registerNPC',
      npcId,
      position: npcOptions.position,
      ...(npcOptions.connectionRange !== undefined
        ? { options: { communicationRange: npcOptions.connectionRange } }
        : {})
    });

    isRegisteredRef.current = true;
    currentPositionRef.current = npcOptions.position.clone();

    // 자동 연결이 활성화된 경우 주변 NPC와 연결
    if (npcOptions.autoConnect) {
      // 스냅샷에서 주변 NPC 찾아서 연결하는 로직은 추후 구현
    }
  }, [isReady, executeCommand, npcId]);

  const unregisterNPC = useCallback(() => {
    if (!isReady || !isRegisteredRef.current) return;

    executeCommand({
      type: 'unregisterNPC',
      npcId
    });

    isRegisteredRef.current = false;
    currentPositionRef.current = null;
    connectionsRef.current.clear();
  }, [isReady, executeCommand, npcId]);

  const updatePosition = useCallback((position: Vector3) => {
    if (!isReady || !isRegisteredRef.current) return;

    executeCommand({
      type: 'updateNPCPosition',
      npcId,
      position
    });

    currentPositionRef.current = position.clone();
  }, [isReady, executeCommand, npcId]);

  const connectTo = useCallback((targetId: string, connectionOptions?: ConnectionOptions) => {
    if (!isReady || !isRegisteredRef.current) return;
    void connectionOptions;

    executeCommand({
      type: 'connect',
      npcId,
      targetId
    });

    connectionsRef.current.add(targetId);
  }, [isReady, executeCommand, npcId]);

  const disconnectFrom = useCallback((targetId: string) => {
    if (!isReady || !isRegisteredRef.current) return;

    executeCommand({
      type: 'disconnect',
      npcId,
      targetId
    });

    connectionsRef.current.delete(targetId);
  }, [isReady, executeCommand, npcId]);

  const getConnections = useCallback((): string[] => {
    return Array.from(connectionsRef.current);
  }, []);

  const getPosition = useCallback((): Vector3 | null => {
    return currentPositionRef.current ? currentPositionRef.current.clone() : null;
  }, []);

  return {
    // NPC 관리
    registerNPC,
    unregisterNPC,
    updatePosition,
    
    // 연결 관리
    connectTo,
    disconnectFrom,
    
    // 상태 조회
    isRegistered: isRegisteredRef.current,
    getConnections,
    getPosition,
    
    // 브릿지 기능
    executeCommand,
    getSnapshot,
    isReady
  };
} 