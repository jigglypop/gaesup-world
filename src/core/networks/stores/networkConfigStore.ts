import { create } from 'zustand';

import { lazyStore } from '../../stores/lazyStore';
import { DEFAULT_NETWORK_CONFIG } from '../config/defaultConfig';
import { NetworkConfig } from '../types';

interface NetworkConfigStore {
  config: NetworkConfig;
  updateConfig: (partial: Partial<NetworkConfig>) => void;
  updatePerformanceConfig: (config: Partial<Pick<NetworkConfig, 'updateFrequency' | 'maxConnections' | 'messageQueueSize'>>) => void;
  updateCommunicationConfig: (config: Partial<Pick<NetworkConfig, 'maxDistance' | 'signalStrength' | 'bandwidth' | 'proximityRange'>>) => void;
  updateOptimizationConfig: (config: Partial<Pick<NetworkConfig, 'enableBatching' | 'batchSize' | 'compressionLevel' | 'connectionPoolSize'>>) => void;
  updateDebugConfig: (config: Partial<Pick<NetworkConfig, 'enableDebugPanel' | 'enableVisualizer' | 'logLevel' | 'debugUpdateInterval'>>) => void;
  resetConfig: () => void;
  resetToProfile: (profile: 'high' | 'balanced' | 'low') => void;
  validateConfig: () => { isValid: boolean; errors: string[] };
}

const performanceProfiles = {
  high: {
    updateFrequency: 60,
    maxConnections: 200,
    messageQueueSize: 2000,
    enableBatching: true,
    batchSize: 20,
    compressionLevel: 3,
    connectionPoolSize: 100,
    bandwidth: 2000,
    signalStrength: 2.0,
  },
  balanced: {
    updateFrequency: 30,
    maxConnections: 100,
    messageQueueSize: 1000,
    enableBatching: true,
    batchSize: 10,
    compressionLevel: 1,
    connectionPoolSize: 50,
    bandwidth: 1000,
    signalStrength: 1.0,
  },
  low: {
    updateFrequency: 15,
    maxConnections: 50,
    messageQueueSize: 500,
    enableBatching: false,
    batchSize: 5,
    compressionLevel: 0,
    connectionPoolSize: 25,
    bandwidth: 500,
    signalStrength: 0.5,
  }
};

// 설정 유효성 검사 함수
const validateConfig = (config: NetworkConfig): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // 성능 설정 검증
  if (config.updateFrequency <= 0 || config.updateFrequency > 120) {
    errors.push('updateFrequency must be between 1 and 120');
  }
  if (config.maxConnections <= 0) {
    errors.push('maxConnections must be greater than 0');
  }
  if (config.messageQueueSize <= 0) {
    errors.push('messageQueueSize must be greater than 0');
  }

  // 통신 설정 검증
  if (config.maxDistance <= 0) {
    errors.push('maxDistance must be greater than 0');
  }
  if (config.signalStrength <= 0) {
    errors.push('signalStrength must be greater than 0');
  }
  if (config.bandwidth <= 0) {
    errors.push('bandwidth must be greater than 0');
  }
  if (config.proximityRange <= 0) {
    errors.push('proximityRange must be greater than 0');
  }

  // 최적화 설정 검증
  if (config.batchSize <= 0) {
    errors.push('batchSize must be greater than 0');
  }
  if (config.compressionLevel < 0 || config.compressionLevel > 9) {
    errors.push('compressionLevel must be between 0 and 9');
  }
  if (config.connectionPoolSize < 0) {
    errors.push('connectionPoolSize must be non-negative');
  }

  // 신뢰성 설정 검증
  if (config.reliableRetryCount < 0) {
    errors.push('reliableRetryCount must be non-negative');
  }
  if (config.reliableTimeout <= 0) {
    errors.push('reliableTimeout must be greater than 0');
  }

  // 그룹 설정 검증
  if (config.maxGroupSize <= 0) {
    errors.push('maxGroupSize must be greater than 0');
  }

  // 디버깅 설정 검증
  if (config.debugUpdateInterval <= 0) {
    errors.push('debugUpdateInterval must be greater than 0');
  }
  if (config.maxLogEntries <= 0) {
    errors.push('maxLogEntries must be greater than 0');
  }

  // 보안 설정 검증
  if (config.maxMessagesPerSecond <= 0) {
    errors.push('maxMessagesPerSecond must be greater than 0');
  }

  // 메모리 관리 검증
  if (config.messageGCInterval <= 0) {
    errors.push('messageGCInterval must be greater than 0');
  }
  if (config.connectionTimeout <= 0) {
    errors.push('connectionTimeout must be greater than 0');
  }
  if (config.inactiveNodeCleanup <= 0) {
    errors.push('inactiveNodeCleanup must be greater than 0');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const useNetworkConfigStore = lazyStore(() => create<NetworkConfigStore>((set, get) => ({
  config: { ...DEFAULT_NETWORK_CONFIG },
  
  updateConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),
    
  updatePerformanceConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),
    
  updateCommunicationConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),
    
  updateOptimizationConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),
    
  updateDebugConfig: (config) =>
    set((state) => ({
      config: { ...state.config, ...config },
    })),
    
  resetConfig: () => set({ config: { ...DEFAULT_NETWORK_CONFIG } }),
  
  resetToProfile: (profile) => 
    set((state) => ({
      config: { 
        ...state.config, 
        ...performanceProfiles[profile] 
      },
    })),
    
  validateConfig: () => validateConfig(get().config),
})));