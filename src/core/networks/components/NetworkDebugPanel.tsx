import React, { useState, useEffect } from 'react';

import { useNetworkBridge, useNetworkStats } from '../hooks';
import type { NetworkSnapshot, NetworkMessage, NetworkSystemState, NetworkConnection, NPCNetworkNode } from '../types';

function collectRecentMessages(
  messageQueues: Map<string, NetworkMessage[]>,
  limit: number,
): NetworkMessage[] {
  if (limit <= 0) return [];
  const out: NetworkMessage[] = [];
  for (const queue of messageQueues.values()) {
    for (const msg of queue) {
      if (out.length >= limit) out.shift();
      out.push(msg);
    }
  }
  return out;
}

interface NetworkDebugPanelProps {
  systemId?: string;
  className?: string;
  style?: React.CSSProperties;
  onClose?: () => void;
}

interface NetworkDebugState {
  snapshot: NetworkSnapshot | null;
  system: NetworkSystemState | null;
  messages: NetworkMessage[];
  isExpanded: boolean;
  activeTab: 'overview' | 'nodes' | 'connections' | 'messages' | 'stats';
}

export const NetworkDebugPanel: React.FC<NetworkDebugPanelProps> = ({
  systemId = 'main',
  className,
  style,
  onClose
}) => {
  const { getSnapshot, getSystemState, isReady } = useNetworkBridge({ systemId });
  const { stats, refreshStats } = useNetworkStats({ systemId, enableRealTime: true });
  
  const [debugState, setDebugState] = useState<NetworkDebugState>({
    snapshot: null,
    system: null,
    messages: [],
    isExpanded: true,
    activeTab: 'overview'
  });

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      const snapshot = getSnapshot();
      const system = getSystemState() as NetworkSystemState | null;
      if (!snapshot && !system) return;

      const messages = system ? collectRecentMessages(system.messageQueues, 50) : [];

      setDebugState(prev => ({
        ...prev,
        snapshot: snapshot ?? prev.snapshot,
        system: system ?? prev.system,
        messages
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isReady, getSnapshot, getSystemState]);

  const renderOverview = () => {
    if (!debugState.snapshot) return <div>No data available</div>;

    const { snapshot } = debugState;
    const totalGroups = debugState.system?.groups.size ?? snapshot.activeGroups;
    
    return (
      <div style={{ padding: '10px' }}>
        <h4>Network Overview</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>Total Nodes:</strong> {snapshot.nodeCount}
          </div>
          <div>
            <strong>Total Connections:</strong> {snapshot.connectionCount}
          </div>
          <div>
            <strong>Total Groups:</strong> {totalGroups}
          </div>
          <div>
            <strong>Recent Messages:</strong> {debugState.messages.length}
          </div>
        </div>
        
        {stats && (
          <div style={{ marginTop: '15px' }}>
            <h5>Performance Metrics</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong>Messages/sec:</strong> {stats.messagesPerSecond.toFixed(2)}
              </div>
              <div>
                <strong>Avg Latency:</strong> {stats.averageLatency.toFixed(2)}ms
              </div>
              <div>
                <strong>Connection Success:</strong> {stats.connectionSuccessRate.toFixed(1)}%
              </div>
              <div>
                <strong>Update Time:</strong> {stats.updateTime.toFixed(2)}ms
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNodes = () => {
    const system = debugState.system;
    if (!system) return <div>No data available</div>;

    const nodes: NPCNetworkNode[] = Array.from(system.nodes.values());
    
    return (
      <div style={{ padding: '10px' }}>
        <h4>Network Nodes ({nodes.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {nodes.map(node => (
            <div 
              key={node.id} 
              style={{ 
                border: '1px solid #ccc', 
                margin: '5px 0', 
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              <div><strong>ID:</strong> {node.id}</div>
              <div><strong>Position:</strong> ({node.position.x.toFixed(1)}, {node.position.y.toFixed(1)}, {node.position.z.toFixed(1)})</div>
              <div><strong>Connections:</strong> {node.connections.size}</div>
              <div>
                <strong>Groups:</strong>{' '}
                {Array.from(system.groups.values())
                  .filter((group) => group.members.has(node.id))
                  .map((group) => group.id)
                  .join(', ') || 'None'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const system = debugState.system;
    if (!system) return <div>No data available</div>;

    const connections: NetworkConnection[] = Array.from(system.connections.values());
    
    return (
      <div style={{ padding: '10px' }}>
        <h4>Network Connections ({connections.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {connections.map(connection => (
            <div 
              key={connection.id} 
              style={{ 
                border: '1px solid #ccc', 
                margin: '5px 0', 
                padding: '8px',
                borderRadius: '4px'
              }}
            >
              <div><strong>ID:</strong> {connection.id}</div>
              <div><strong>From:</strong> {connection.nodeA} → <strong>To:</strong> {connection.nodeB}</div>
              <div><strong>Status:</strong> {connection.status}</div>
              <div><strong>Latency:</strong> {connection.latency.toFixed(1)}ms</div>
              <div><strong>Last Activity:</strong> {new Date(connection.lastActivity).toLocaleTimeString()}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <div style={{ padding: '10px' }}>
        <h4>Recent Messages ({debugState.messages.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {debugState.messages.slice().reverse().map((message, index) => (
            <div 
              key={`${message.id}-${index}`} 
              style={{ 
                border: '1px solid #ccc', 
                margin: '5px 0', 
                padding: '8px',
                borderRadius: '4px',
                backgroundColor: message.type === 'system' ? '#f0f8ff' : '#ffffff'
              }}
            >
              <div><strong>ID:</strong> {message.id}</div>
              <div><strong>Type:</strong> {message.type}</div>
              <div><strong>From:</strong> {message.from} → <strong>To:</strong> {message.to === 'group' ? `group:${message.groupId ?? 'unknown'}` : message.to}</div>
              <div><strong>Time:</strong> {new Date(message.timestamp).toLocaleTimeString()}</div>
              <div><strong>Payload:</strong> {JSON.stringify(message.payload)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return <div>Loading stats...</div>;
    
    return (
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4>Network Statistics</h4>
          <button onClick={refreshStats}>Refresh</button>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <h5>Basic Stats</h5>
            <div>Total Nodes: {stats.totalNodes}</div>
            <div>Total Connections: {stats.totalConnections}</div>
            <div>Total Messages: {stats.totalMessages}</div>
          </div>
          
          <div>
            <h5>Performance</h5>
            <div>Messages/sec: {stats.messagesPerSecond.toFixed(2)}</div>
            <div>Avg Latency: {stats.averageLatency.toFixed(2)}ms</div>
            <div>Update Time: {stats.updateTime.toFixed(2)}ms</div>
          </div>
          
          <div>
            <h5>Connection Stats</h5>
            <div>Active: {stats.activeConnections}</div>
            <div>Failed: {stats.failedConnections}</div>
            <div>Success Rate: {stats.connectionSuccessRate.toFixed(1)}%</div>
          </div>
          
          <div>
            <h5>Group Stats</h5>
            <div>Total Groups: {stats.totalGroups}</div>
            <div>Active Groups: {stats.activeGroups}</div>
            <div>Avg Group Size: {stats.averageGroupSize.toFixed(1)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (debugState.activeTab) {
      case 'overview': return renderOverview();
      case 'nodes': return renderNodes();
      case 'connections': return renderConnections();
      case 'messages': return renderMessages();
      case 'stats': return renderStats();
      default: return renderOverview();
    }
  };

  if (!debugState.isExpanded) {
    return (
      <div
        className={className}
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          backgroundColor: '#f0f0f0',
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '5px 10px',
          cursor: 'pointer',
          zIndex: 1000,
          ...style
        }}
        onClick={() => setDebugState(prev => ({ ...prev, isExpanded: true }))}
      >
        Network Debug
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        width: '600px',
        height: '500px',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        ...style
      }}
    >
      {/* Header */}
      <div style={{ 
        padding: '10px', 
        borderBottom: '1px solid #ccc',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{ margin: 0 }}>Network Debug Panel</h3>
        <div>
          <button onClick={() => setDebugState(prev => ({ ...prev, isExpanded: false }))}>
            −
          </button>
          {onClose && (
            <button onClick={onClose} style={{ marginLeft: '5px' }}>
              ×
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #ccc',
        backgroundColor: '#f9f9f9'
      }}>
        {(['overview', 'nodes', 'connections', 'messages', 'stats'] as const).map(tab => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              backgroundColor: debugState.activeTab === tab ? 'white' : 'transparent',
              borderBottom: debugState.activeTab === tab ? '2px solid #007acc' : 'none',
              cursor: 'pointer'
            }}
            onClick={() => setDebugState(prev => ({ ...prev, activeTab: tab }))}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderTabContent()}
      </div>

      {/* Status bar */}
      <div style={{ 
        padding: '5px 10px', 
        borderTop: '1px solid #ccc',
        backgroundColor: '#f9f9f9',
        fontSize: '12px',
        color: '#666'
      }}>
        Status: {isReady ? 'Connected' : 'Disconnected'} | 
        System: {systemId} | 
        Last Update: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
}; 