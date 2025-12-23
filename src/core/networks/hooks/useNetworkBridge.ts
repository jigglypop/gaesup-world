import { useRef, useCallback, useEffect } from 'react';

import { useFrame } from '@react-three/fiber';

import { BridgeFactory } from '@core/boilerplate';

import { NetworkBridge } from '../bridge/NetworkBridge';
import { NetworkCommand, NetworkSnapshot, NetworkConfig } from '../types';

export interface UseNetworkBridgeOptions {
  systemId?: string;
  config?: NetworkConfig;
  enableAutoUpdate?: boolean;
}

export interface UseNetworkBridgeResult {
  bridge: NetworkBridge | null;
  executeCommand: (command: NetworkCommand) => void;
  getSnapshot: () => NetworkSnapshot | null;
  getNetworkStats: () => any;
  getSystemState: () => any;
  updateSystem: (deltaTime: number) => void;
  isReady: boolean;
}

/**
 * NetworkBridge와 상호작용하는 기본 훅
 */
export function useNetworkBridge(options: UseNetworkBridgeOptions = {}): UseNetworkBridgeResult {
  const {
    systemId = 'main',
    config,
    enableAutoUpdate = true
  } = options;

  const bridgeRef = useRef<NetworkBridge | null>(null);
  const isReadyRef = useRef<boolean>(false);

  // Bridge 인스턴스 초기화
  useEffect(() => {
    if (!bridgeRef.current) {
      bridgeRef.current = BridgeFactory.get<NetworkBridge>('networks');
      
      if (!bridgeRef.current) {
        bridgeRef.current = BridgeFactory.create<NetworkBridge>('networks');
      }
      
      if (bridgeRef.current) {
        // 설정이 제공된 경우 시스템에 적용
        if (config) {
          bridgeRef.current.execute(systemId, {
            type: 'updateConfig',
            data: { config }
          });
        }
        isReadyRef.current = true;
      }
    }

    return () => {
      // cleanup은 BridgeFactory에서 관리
    };
  }, [systemId, config]);

  // 자동 업데이트 (매 프레임)
  useFrame((_, deltaTime) => {
    if (enableAutoUpdate && bridgeRef.current && isReadyRef.current) {
      bridgeRef.current.updateSystem(systemId, deltaTime);
    }
  });

  const executeCommand = useCallback((command: NetworkCommand) => {
    if (bridgeRef.current && isReadyRef.current) {
      bridgeRef.current.execute(systemId, command);
    }
  }, [systemId]);

  const getSnapshot = useCallback((): NetworkSnapshot | null => {
    if (bridgeRef.current && isReadyRef.current) {
      return bridgeRef.current.snapshot(systemId);
    }
    return null;
  }, [systemId]);

  const getNetworkStats = useCallback(() => {
    if (bridgeRef.current && isReadyRef.current) {
      return bridgeRef.current.getNetworkStats(systemId);
    }
    return null;
  }, [systemId]);

  const getSystemState = useCallback(() => {
    if (bridgeRef.current && isReadyRef.current) {
      return bridgeRef.current.getSystemState(systemId);
    }
    return null;
  }, [systemId]);

  const updateSystem = useCallback((deltaTime: number) => {
    if (bridgeRef.current && isReadyRef.current) {
      bridgeRef.current.updateSystem(systemId, deltaTime);
    }
  }, [systemId]);

  return {
    bridge: bridgeRef.current,
    executeCommand,
    getSnapshot,
    getNetworkStats,
    getSystemState,
    updateSystem,
    isReady: isReadyRef.current
  };
} 