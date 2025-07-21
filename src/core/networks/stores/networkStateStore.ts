import { create } from 'zustand';
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

const initialState: NetworkState = {
  snapshot: null,
  connectedNodes: new Map(),
  activeGroups: new Map(),
  recentMessages: [],
  isConnected: false,
  connectionStatus: 'disconnected',
  lastError: null,
  lastUpdate: 0
};

export const useNetworkStateStore = create<NetworkStateStore>((set, get) => ({
  state: { ...initialState },

  updateSnapshot: (snapshot) =>
    set((store) => ({
      state: {
        ...store.state,
        snapshot: { ...snapshot },
        lastUpdate: Date.now()
      }
    })),

  updateConnectedNodes: (nodes) =>
    set((store) => {
      const connectedNodes = new Map<string, NPCNetworkNode>();
      nodes.forEach(node => {
        connectedNodes.set(node.id, { ...node });
      });

      return {
        state: {
          ...store.state,
          connectedNodes,
          lastUpdate: Date.now()
        }
      };
    }),

  updateActiveGroups: (groups) =>
    set((store) => {
      const activeGroups = new Map<string, NetworkGroup>();
      groups.forEach(group => {
        activeGroups.set(group.id, { 
          ...group,
          members: new Set(group.members) // Set 복사
        });
      });

      return {
        state: {
          ...store.state,
          activeGroups,
          lastUpdate: Date.now()
        }
      };
    }),

  addRecentMessage: (message) =>
    set((store) => {
      const recentMessages = [...store.state.recentMessages, { ...message }];
      
      // 최대 100개 메시지만 유지
      if (recentMessages.length > 100) {
        recentMessages.shift();
      }

      return {
        state: {
          ...store.state,
          recentMessages,
          lastUpdate: Date.now()
        }
      };
    }),

  setConnectionStatus: (status, error) =>
    set((store) => ({
      state: {
        ...store.state,
        connectionStatus: status,
        isConnected: status === 'connected',
        lastError: error || null,
        lastUpdate: Date.now()
      }
    })),

  clearRecentMessages: () =>
    set((store) => ({
      state: {
        ...store.state,
        recentMessages: [],
        lastUpdate: Date.now()
      }
    })),

  getNodeById: (nodeId) => {
    const { state } = get();
    return state.connectedNodes.get(nodeId) || null;
  },

  getGroupById: (groupId) => {
    const { state } = get();
    return state.activeGroups.get(groupId) || null;
  },

  getNodesByGroup: (groupId) => {
    const { state } = get();
    const group = state.activeGroups.get(groupId);
    if (!group) return [];

    const nodes: NPCNetworkNode[] = [];
    group.members.forEach(nodeId => {
      const node = state.connectedNodes.get(nodeId);
      if (node) {
        nodes.push(node);
      }
    });

    return nodes;
  },

  getMessagesForNode: (nodeId) => {
    const { state } = get();
    return state.recentMessages.filter(
      message => message.from === nodeId || message.to === nodeId
    );
  },

  resetState: () =>
    set({
      state: {
        ...initialState,
        connectedNodes: new Map(),
        activeGroups: new Map(),
        recentMessages: []
      }
    })
}));

// 유틸리티 함수들
export const useNetworkStats = () => {
  const snapshot = useNetworkStateStore(state => state.state.snapshot);
  
  return {
    nodeCount: snapshot?.nodeCount || 0,
    connectionCount: snapshot?.connectionCount || 0,
    activeGroups: snapshot?.activeGroups || 0,
    messagesPerSecond: snapshot?.messagesPerSecond || 0,
    averageLatency: snapshot?.averageLatency || 0,
    isOnline: snapshot !== null
  };
};

export const useNetworkConnection = () => {
  const { connectionStatus, isConnected, lastError } = useNetworkStateStore(state => state.state);
  
  return {
    status: connectionStatus,
    isConnected,
    lastError,
    isConnecting: connectionStatus === 'connecting',
    hasError: connectionStatus === 'error'
  };
};

export const useRecentMessages = (limit?: number) => {
  const messages = useNetworkStateStore(state => state.state.recentMessages);
  
  if (limit && limit > 0) {
    return messages.slice(-limit);
  }
  
  return messages;
};

export const useNetworkNodes = () => {
  const connectedNodes = useNetworkStateStore(state => state.state.connectedNodes);
  return Array.from(connectedNodes.values());
};

export const useNetworkGroups = () => {
  const activeGroups = useNetworkStateStore(state => state.state.activeGroups);
  return Array.from(activeGroups.values());
}; 