import { useRef, useCallback, useEffect, useState } from 'react';

import { useFrame } from '@react-three/fiber';

import { BridgeFactory } from '@core/boilerplate';

import { NetworkBridge } from '../bridge/NetworkBridge';
import { NetworkCommand, NetworkSnapshot, NetworkConfig } from '../types';

export interface UseNetworkBridgeOptions {
  systemId?: string;
  config?: Partial<NetworkConfig>;
  enableAutoUpdate?: boolean;
}

export interface UseNetworkBridgeResult {
  bridge: NetworkBridge | null;
  executeCommand: (command: NetworkCommand) => void;
  getSnapshot: () => NetworkSnapshot | null;
  getNetworkStats: () => ReturnType<NetworkBridge['getNetworkStats']>;
  getSystemState: () => ReturnType<NetworkBridge['getSystemState']>;
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
  const [bridge, setBridge] = useState<NetworkBridge | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  useEffect(() => {
    if (!bridgeRef.current) {
      bridgeRef.current = BridgeFactory.getOrCreate<NetworkBridge>('networks');
    }

    const b = bridgeRef.current;
    if (!b) {
      setBridge(null);
      setIsReady(false);
      return () => {
        // cleanup is managed by BridgeFactory
      };
    }

    // Ensure the engine for the requested systemId exists.
    if (systemId === 'main') {
      b.ensureMainEngine();
    } else if (!b.getEngine(systemId)) {
      b.register(systemId);
    }

    // Apply runtime config updates (works for both first-time and subsequent updates).
    if (config && Object.keys(config).length > 0) {
      b.execute(systemId, { type: 'updateConfig', data: { config } });
    }

    setBridge(b);
    setIsReady(true);

    return () => {
      // cleanup은 BridgeFactory에서 관리
    };
  }, [systemId, config]);

  // 자동 업데이트 (매 프레임)
  useFrame((_, deltaTime) => {
    if (enableAutoUpdate && bridgeRef.current && isReady) {
      bridgeRef.current.updateSystem(systemId, deltaTime);
    }
  });

  const executeCommand = useCallback((command: NetworkCommand) => {
    if (bridgeRef.current && isReady) {
      bridgeRef.current.execute(systemId, command);
    }
  }, [systemId, isReady]);

  const getSnapshot = useCallback((): NetworkSnapshot | null => {
    if (bridgeRef.current && isReady) {
      return bridgeRef.current.snapshot(systemId);
    }
    return null;
  }, [systemId, isReady]);

  const getNetworkStats = useCallback(() => {
    if (bridgeRef.current && isReady) {
      return bridgeRef.current.getNetworkStats(systemId);
    }
    return null;
  }, [systemId, isReady]);

  const getSystemState = useCallback(() => {
    if (bridgeRef.current && isReady) {
      return bridgeRef.current.getSystemState(systemId);
    }
    return null;
  }, [systemId, isReady]);

  const updateSystem = useCallback((deltaTime: number) => {
    if (bridgeRef.current && isReady) {
      bridgeRef.current.updateSystem(systemId, deltaTime);
    }
  }, [systemId, isReady]);

  return {
    bridge,
    executeCommand,
    getSnapshot,
    getNetworkStats,
    getSystemState,
    updateSystem,
    isReady
  };
} 