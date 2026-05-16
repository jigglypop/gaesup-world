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
    validateConfig: () => {
        isValid: boolean;
        errors: string[];
    };
}
export declare const useNetworkConfigStore: import("zustand").UseBoundStore<import("zustand").StoreApi<NetworkConfigStore>>;
export {};
