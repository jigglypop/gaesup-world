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
export declare function useNetworkBridge(options?: UseNetworkBridgeOptions): UseNetworkBridgeResult;
