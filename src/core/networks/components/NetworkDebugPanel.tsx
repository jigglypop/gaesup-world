import React, { useState, useEffect } from 'react';

import { useNetworkBridge, useNetworkStats } from '../hooks';
import type {
  NetworkSnapshot,
  NetworkMessage,
  NetworkSystemState,
  NetworkConnection,
  NPCNetworkNode,
} from '../types';

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
  onClose,
}) => {
  const { getSnapshot, getSystemState, isReady } = useNetworkBridge({ systemId });
  const { stats, refreshStats } = useNetworkStats({ systemId, enableRealTime: true });

  const [debugState, setDebugState] = useState<NetworkDebugState>({
    snapshot: null,
    system: null,
    messages: [],
    isExpanded: true,
    activeTab: 'overview',
  });

  // 실시간 데이터 업데이트
  useEffect(() => {
    if (!isReady) return;

    const interval = setInterval(() => {
      const snapshot = getSnapshot();
      const system = getSystemState() as NetworkSystemState | null;
      if (!snapshot && !system) return;

      const messages = system ? collectRecentMessages(system.messageQueues, 50) : [];

      setDebugState((prev) => ({
        ...prev,
        snapshot: snapshot ?? prev.snapshot,
        system: system ?? prev.system,
        messages,
      }));
    }, 500);

    return () => clearInterval(interval);
  }, [isReady, getSnapshot, getSystemState]);

  const renderOverview = () => {
    if (!debugState.snapshot) return <div>표시할 데이터가 없습니다</div>;

    const { snapshot } = debugState;
    const totalGroups = debugState.system?.groups.size ?? snapshot.activeGroups;

    return (
      <div style={{ padding: '10px' }}>
        <h4>네트워크 개요</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <strong>전체 노드:</strong> {snapshot.nodeCount}
          </div>
          <div>
            <strong>전체 연결:</strong> {snapshot.connectionCount}
          </div>
          <div>
            <strong>전체 그룹:</strong> {totalGroups}
          </div>
          <div>
            <strong>최근 메시지:</strong> {debugState.messages.length}
          </div>
        </div>

        {stats && (
          <div style={{ marginTop: '15px' }}>
            <h5>성능 지표</h5>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <strong>초당 메시지:</strong> {stats.messagesPerSecond.toFixed(2)}
              </div>
              <div>
                <strong>평균 지연:</strong> {stats.averageLatency.toFixed(2)}ms
              </div>
              <div>
                <strong>연결 성공률:</strong> {stats.connectionSuccessRate.toFixed(1)}%
              </div>
              <div>
                <strong>갱신 시간:</strong> {stats.updateTime.toFixed(2)}ms
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderNodes = () => {
    const system = debugState.system;
    if (!system) return <div>표시할 데이터가 없습니다</div>;

    const nodes: NPCNetworkNode[] = Array.from(system.nodes.values());

    return (
      <div style={{ padding: '10px' }}>
        <h4>네트워크 노드 ({nodes.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {nodes.map((node) => (
            <div
              key={node.id}
              style={{
                border: '1px solid #ccc',
                margin: '5px 0',
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              <div>
                <strong>ID:</strong> {node.id}
              </div>
              <div>
                <strong>위치:</strong> ({node.position.x.toFixed(1)}, {node.position.y.toFixed(1)},{' '}
                {node.position.z.toFixed(1)})
              </div>
              <div>
                <strong>연결:</strong> {node.connections.size}
              </div>
              <div>
                <strong>그룹:</strong>{' '}
                {Array.from(system.groups.values())
                  .filter((group) => group.members.has(node.id))
                  .map((group) => group.id)
                  .join(', ') || '없음'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderConnections = () => {
    const system = debugState.system;
    if (!system) return <div>표시할 데이터가 없습니다</div>;

    const connections: NetworkConnection[] = Array.from(system.connections.values());

    return (
      <div style={{ padding: '10px' }}>
        <h4>네트워크 연결 ({connections.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {connections.map((connection) => (
            <div
              key={connection.id}
              style={{
                border: '1px solid #ccc',
                margin: '5px 0',
                padding: '8px',
                borderRadius: '4px',
              }}
            >
              <div>
                <strong>ID:</strong> {connection.id}
              </div>
              <div>
                <strong>보낸 곳:</strong> {connection.nodeA} → <strong>받는 곳:</strong>{' '}
                {connection.nodeB}
              </div>
              <div>
                <strong>상태:</strong> {connection.status}
              </div>
              <div>
                <strong>지연:</strong> {connection.latency.toFixed(1)}ms
              </div>
              <div>
                <strong>최근 활동:</strong> {new Date(connection.lastActivity).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <div style={{ padding: '10px' }}>
        <h4>최근 메시지 ({debugState.messages.length})</h4>
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {debugState.messages
            .slice()
            .reverse()
            .map((message, index) => (
              <div
                key={`${message.id}-${index}`}
                style={{
                  border: '1px solid #ccc',
                  margin: '5px 0',
                  padding: '8px',
                  borderRadius: '4px',
                  backgroundColor: message.type === 'system' ? '#f0f8ff' : '#ffffff',
                }}
              >
                <div>
                  <strong>ID:</strong> {message.id}
                </div>
                <div>
                  <strong>유형:</strong> {message.type}
                </div>
                <div>
                  <strong>보낸 곳:</strong> {message.from} → <strong>받는 곳:</strong>{' '}
                  {message.to === 'group' ? `그룹: ${message.groupId ?? '알 수 없음'}` : message.to}
                </div>
                <div>
                  <strong>시간:</strong> {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div>
                  <strong>메시지 내용:</strong> {JSON.stringify(message.payload)}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (!stats) return <div>통계를 불러오는 중…</div>;

    return (
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <h4>네트워크 통계</h4>
          <button onClick={refreshStats}>새로고침</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <h5>기본 통계</h5>
            <div>전체 노드: {stats.totalNodes}</div>
            <div>전체 연결: {stats.totalConnections}</div>
            <div>전체 메시지: {stats.totalMessages}</div>
          </div>

          <div>
            <h5>성능</h5>
            <div>초당 메시지: {stats.messagesPerSecond.toFixed(2)}</div>
            <div>평균 지연: {stats.averageLatency.toFixed(2)}ms</div>
            <div>갱신 시간: {stats.updateTime.toFixed(2)}ms</div>
          </div>

          <div>
            <h5>연결 통계</h5>
            <div>활성: {stats.activeConnections}</div>
            <div>실패: {stats.failedConnections}</div>
            <div>성공률: {stats.connectionSuccessRate.toFixed(1)}%</div>
          </div>

          <div>
            <h5>그룹 통계</h5>
            <div>전체 그룹: {stats.totalGroups}</div>
            <div>활성 그룹: {stats.activeGroups}</div>
            <div>평균 그룹 크기: {stats.averageGroupSize.toFixed(1)}</div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (debugState.activeTab) {
      case 'overview':
        return renderOverview();
      case 'nodes':
        return renderNodes();
      case 'connections':
        return renderConnections();
      case 'messages':
        return renderMessages();
      case 'stats':
        return renderStats();
      default:
        return renderOverview();
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
          ...style,
        }}
        onClick={() => setDebugState((prev) => ({ ...prev, isExpanded: true }))}
      >
        네트워크 진단
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
        ...style,
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '10px',
          borderBottom: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: 0 }}>네트워크 진단 패널</h3>
        <div>
          <button onClick={() => setDebugState((prev) => ({ ...prev, isExpanded: false }))}>
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
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
        }}
      >
        {(['overview', 'nodes', 'connections', 'messages', 'stats'] as const).map((tab) => (
          <button
            key={tab}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: 'none',
              backgroundColor: debugState.activeTab === tab ? 'white' : 'transparent',
              borderBottom: debugState.activeTab === tab ? '2px solid #007acc' : 'none',
              cursor: 'pointer',
            }}
            onClick={() => setDebugState((prev) => ({ ...prev, activeTab: tab }))}
          >
            {
              {
                overview: '개요',
                nodes: '노드',
                connections: '연결',
                messages: '메시지',
                stats: '통계',
              }[tab]
            }
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>{renderTabContent()}</div>

      {/* Status bar */}
      <div
        style={{
          padding: '5px 10px',
          borderTop: '1px solid #ccc',
          backgroundColor: '#f9f9f9',
          fontSize: '12px',
          color: '#666',
        }}
      >
        상태: {isReady ? '연결됨' : '연결 끊김'} | 시스템: {systemId} | 마지막 갱신:{' '}
        {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};
