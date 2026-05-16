import { NetworkSnapshot, NPCNetworkNode, NetworkGroup, NetworkMessage } from '../types';
interface NetworkState {
    snapshot: NetworkSnapshot | null;
    connectedNodes: Map<string, NPCNetworkNode>;
    activeGroups: Map<string, NetworkGroup>;
    recentMessages: NetworkMessage[];
    isConnected: boolean;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    lastError: string | null;
    lastUpdate: number;
}
interface NetworkStateStore {
    state: NetworkState;
    updateSnapshot: (snapshot: NetworkSnapshot) => void;
    updateConnectedNodes: (nodes: NPCNetworkNode[]) => void;
    updateActiveGroups: (groups: NetworkGroup[]) => void;
    addRecentMessage: (message: NetworkMessage) => void;
    setConnectionStatus: (status: NetworkState['connectionStatus'], error?: string) => void;
    clearRecentMessages: () => void;
    getNodeById: (nodeId: string) => NPCNetworkNode | null;
    getGroupById: (groupId: string) => NetworkGroup | null;
    getNodesByGroup: (groupId: string) => NPCNetworkNode[];
    getMessagesForNode: (nodeId: string) => NetworkMessage[];
    resetState: () => void;
}
export declare const useNetworkStateStore: import("zustand").UseBoundStore<import("zustand").StoreApi<NetworkStateStore>>;
export declare const useNetworkStats: () => {
    nodeCount: number;
    connectionCount: number;
    activeGroups: number;
    messagesPerSecond: number;
    averageLatency: number;
    isOnline: boolean;
};
export declare const useNetworkConnection: () => {
    status: "error" | "connected" | "disconnected" | "connecting";
    isConnected: boolean;
    lastError: string | null;
    isConnecting: boolean;
    hasError: boolean;
};
export declare const useRecentMessages: (limit?: number) => NetworkMessage[];
export declare const useNetworkNodes: () => NPCNetworkNode[];
export declare const useNetworkGroups: () => NetworkGroup[];
export {};
