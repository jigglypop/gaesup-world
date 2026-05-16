import * as THREE from 'three';
export type NetworkPayload = object | string | number | boolean | null | undefined;
export interface PlayerState {
    name: string;
    color: string;
    position: [number, number, number];
    rotation: [number, number, number, number];
    animation?: string;
    velocity?: [number, number, number];
    modelUrl?: string;
}
export interface NPCNetworkNode {
    id: string;
    npcId: string;
    position: THREE.Vector3;
    connections: Set<string>;
    messageQueue: NetworkMessage[];
    lastUpdate: number;
    status: 'active' | 'idle' | 'disconnected';
    communicationRange: number;
    signalStrength: number;
}
export interface NetworkMessage {
    id: string;
    from: string;
    to: string | 'broadcast' | 'group';
    type: 'chat' | 'action' | 'state' | 'system';
    payload: NetworkPayload;
    priority: 'low' | 'normal' | 'high' | 'critical';
    timestamp: number;
    reliability: 'unreliable' | 'reliable';
    groupId?: string;
    retryCount?: number;
}
export interface NetworkConnection {
    id: string;
    nodeA: string;
    nodeB: string;
    strength: number;
    latency: number;
    bandwidth: number;
    status: 'establishing' | 'active' | 'unstable' | 'disconnected';
    lastActivity: number;
}
export interface NetworkGroup {
    id: string;
    type: 'party' | 'proximity' | 'broadcast' | 'guild';
    members: Set<string>;
    maxMembers: number;
    range: number;
    persistent: boolean;
    createdAt: number;
    lastActivity: number;
}
export interface NetworkStats {
    totalNodes: number;
    activeConnections: number;
    messagesPerSecond: number;
    averageLatency: number;
    bandwidth: number;
    lastUpdate: number;
}
export interface NetworkSystemState {
    nodes: Map<string, NPCNetworkNode>;
    connections: Map<string, NetworkConnection>;
    groups: Map<string, NetworkGroup>;
    messageQueues: Map<string, NetworkMessage[]>;
    stats: NetworkStats;
    isRunning: boolean;
    lastUpdate: number;
}
export type NetworkCommand = {
    type: 'registerNPC';
    npcId: string;
    position: THREE.Vector3;
    options?: {
        communicationRange?: number;
        signalStrength?: number;
    };
} | {
    type: 'unregisterNPC';
    npcId: string;
} | {
    type: 'updateNPCPosition';
    npcId: string;
    position: THREE.Vector3;
} | {
    type: 'connect';
    npcId: string;
    targetId: string;
} | {
    type: 'disconnect';
    npcId: string;
    targetId?: string;
} | {
    type: 'sendMessage';
    message: NetworkMessage;
} | {
    type: 'broadcast';
    message: Omit<NetworkMessage, 'to'>;
} | {
    type: 'joinGroup';
    npcId: string;
    groupId: string;
} | {
    type: 'leaveGroup';
    npcId: string;
    groupId: string;
} | {
    type: 'createGroup';
    group: Omit<NetworkGroup, 'id'>;
} | {
    type: 'updateConfig';
    data: {
        config: Partial<NetworkConfig>;
    };
} | {
    type: 'updateSettings';
    settings: Partial<NetworkConfig>;
} | {
    type: 'startMonitoring';
    npcId: string;
} | {
    type: 'stopMonitoring';
    npcId: string;
};
export interface NetworkSnapshot {
    nodeCount: number;
    connectionCount: number;
    activeGroups: number;
    messagesPerSecond: number;
    averageLatency: number;
    lastUpdate: number;
}
export interface NetworkConfig {
    updateFrequency: number;
    maxConnections: number;
    messageQueueSize: number;
    maxDistance: number;
    signalStrength: number;
    bandwidth: number;
    proximityRange: number;
    enableBatching: boolean;
    batchSize: number;
    compressionLevel: number;
    connectionPoolSize: number;
    enableChatMessages: boolean;
    enableActionMessages: boolean;
    enableStateMessages: boolean;
    enableSystemMessages: boolean;
    reliableRetryCount: number;
    reliableTimeout: number;
    enableAck: boolean;
    maxGroupSize: number;
    autoJoinProximity: boolean;
    groupMessagePriority: 'low' | 'normal' | 'high' | 'critical';
    enableDebugPanel: boolean;
    enableVisualizer: boolean;
    showConnectionLines: boolean;
    showMessageFlow: boolean;
    debugUpdateInterval: number;
    logLevel: 'none' | 'error' | 'warn' | 'info' | 'debug';
    logToConsole: boolean;
    logToFile: boolean;
    maxLogEntries: number;
    enableEncryption: boolean;
    enableRateLimit: boolean;
    maxMessagesPerSecond: number;
    messageGCInterval: number;
    connectionTimeout: number;
    inactiveNodeCleanup: number;
}
export interface MultiplayerConfig extends NetworkConfig {
    websocket: {
        url: string;
        reconnectAttempts: number;
        reconnectDelay: number;
        pingInterval: number;
    };
    tracking: {
        updateRate: number;
        velocityThreshold: number;
        sendRateLimit: number;
        interpolationSpeed: number;
    };
    rendering: {
        nameTagHeight: number;
        nameTagSize: number;
        characterScale: number;
    };
}
export interface MultiplayerConnectionOptions {
    roomId: string;
    playerName: string;
    playerColor: string;
    characterUrl?: string;
}
export interface MultiplayerState {
    isConnected: boolean;
    connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
    players: Map<string, PlayerState>;
    localPlayerId: string | null;
    roomId: string | null;
    error: string | null;
    ping: number;
    lastUpdate: number;
}
