import { useRef, useCallback, useEffect, useState } from 'react';

import { BridgeFactory } from '@core/boilerplate';

import { useGaesupRuntime, useGaesupRuntimeRevision } from '../../runtime/runtimeContext';
import { getTimeClock } from '../../time/core/timeClock';
import { useTimeStoreApi } from '../../time/stores/timeStore';
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
  const runtime = useGaesupRuntime();
  const revision = useGaesupRuntimeRevision();
  const timeStore = useTimeStoreApi();

  useEffect(() => {
    bridgeRef.current = runtime ? (runtime.isActive() ? runtime.networkBridge : null) : BridgeFactory.getOrCreate<NetworkBridge>('networks');

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
    const currentConfig = b.getEngine(systemId)?.system.getConfig();
    if (config && Object.entries(config).some(([key, value]) => value !== undefined && currentConfig?.[key as keyof NetworkConfig] !== value)) {
      b.execute(systemId, { type: 'updateConfig', data: { config } });
    }

    setBridge(b);
    setIsReady(true);

    return () => {
      // cleanup은 BridgeFactory에서 관리
    };
  }, [systemId, config, runtime, revision]);

  useEffect(() => {
    if (!enableAutoUpdate || !bridge || bridge !== bridgeRef.current || !isReady || runtime && !runtime.isActive()) return;
    return bridge.acquireUpdates(systemId, runtime?.clockLoop ?? getTimeClock(timeStore));
  }, [enableAutoUpdate, bridge, isReady, systemId, runtime, revision, timeStore]);

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
