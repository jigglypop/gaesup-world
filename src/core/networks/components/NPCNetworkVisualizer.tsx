import React, { useRef, useMemo } from 'react';

import { Line, Sphere, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useNetworkBridge } from '../hooks';
import type { NPCNetworkNode, NetworkConnection, NetworkSystemState } from '../types';

interface NPCNetworkVisualizerProps {
  systemId?: string;
  showLabels?: boolean;
  showConnectionLines?: boolean;
  showGroups?: boolean;
  nodeSize?: number;
  connectionWidth?: number;
  updateInterval?: number;
  maxRenderDistance?: number;
  className?: string;
}

interface VisualizationState {
  nodes: NPCNetworkNode[];
  connections: NetworkConnection[];
  groups: Map<string, string[]>;
}

const COLOR_PALETTE = [
  '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
  '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43',
] as const;

const FALLBACK_GROUP_COLOR = '#cccccc';
const DEFAULT_NODE_COLOR = '#4a90e2';

const CONNECTION_COLORS: Record<NetworkConnection['status'], string> = {
  active: '#00ff00',
  establishing: '#ffff00',
  unstable: '#ff9f43',
  disconnected: '#cccccc',
};

const getConnectionColor = (status: NetworkConnection['status']): string =>
  CONNECTION_COLORS[status] ?? '#666666';

export const NPCNetworkVisualizer: React.FC<NPCNetworkVisualizerProps> = ({
  systemId = 'main',
  showLabels = true,
  showConnectionLines = true,
  showGroups = true,
  nodeSize = 0.5,
  connectionWidth = 0.05,
  updateInterval = 100,
  maxRenderDistance = 100,
}) => {
  void maxRenderDistance;
  const { getSystemState, isReady } = useNetworkBridge({ systemId });
  const groupRef = useRef<THREE.Group>(null);
  const lastUpdateRef = useRef<number>(0);

  const [visualState, setVisualState] = React.useState<VisualizationState>({
    nodes: [],
    connections: [],
    groups: new Map(),
  });

  useFrame(() => {
    const now = Date.now();
    if (!isReady || now - lastUpdateRef.current < updateInterval) return;

    const system = getSystemState() as NetworkSystemState | null;
    if (!system) return;

    const groups = new Map<string, string[]>();
    system.groups.forEach((group, groupId) => {
      groups.set(groupId, Array.from(group.members));
    });

    setVisualState({
      nodes: Array.from(system.nodes.values()),
      connections: Array.from(system.connections.values()),
      groups,
    });

    lastUpdateRef.current = now;
  });

  // groupId -> color (안정적 매핑)
  const groupColors = useMemo(() => {
    const colors = new Map<string, string>();
    let idx = 0;
    visualState.groups.forEach((_, groupId) => {
      colors.set(groupId, COLOR_PALETTE[idx % COLOR_PALETTE.length] ?? FALLBACK_GROUP_COLOR);
      idx++;
    });
    return colors;
  }, [visualState.groups]);

  // nodeId -> [groupId...] 인덱스 (매 노드 렌더에서 전 그룹을 순회하지 않도록)
  const nodeGroupIndex = useMemo(() => {
    const index = new Map<string, string[]>();
    visualState.groups.forEach((memberIds, groupId) => {
      for (const id of memberIds) {
        const arr = index.get(id);
        if (arr) arr.push(groupId);
        else index.set(id, [groupId]);
      }
    });
    return index;
  }, [visualState.groups]);

  // nodeId -> node 룩업 (연결선 렌더에서 array.find O(N) 회피)
  const nodeIndex = useMemo(() => {
    const index = new Map<string, NPCNetworkNode>();
    for (const node of visualState.nodes) index.set(node.id, node);
    return index;
  }, [visualState.nodes]);

  // 그룹 경계선 사전 계산 (매 렌더 reduce/max 회피)
  const groupBounds = useMemo(() => {
    const result: Array<{ groupId: string; center: [number, number, number]; radius: number }> = [];
    visualState.groups.forEach((memberIds, groupId) => {
      const members: NPCNetworkNode[] = [];
      for (const id of memberIds) {
        const n = nodeIndex.get(id);
        if (n) members.push(n);
      }
      if (members.length < 2) return;

      let cx = 0, cy = 0, cz = 0;
      for (const m of members) {
        cx += m.position.x; cy += m.position.y; cz += m.position.z;
      }
      cx /= members.length; cy /= members.length; cz /= members.length;

      let r2max = 0;
      for (const m of members) {
        const dx = m.position.x - cx;
        const dy = m.position.y - cy;
        const dz = m.position.z - cz;
        const r2 = dx * dx + dy * dy + dz * dz;
        if (r2 > r2max) r2max = r2;
      }

      result.push({ groupId, center: [cx, cy, cz], radius: Math.sqrt(r2max) + 1 });
    });
    return result;
  }, [visualState.groups, nodeIndex]);

  if (!isReady) {
    return (
      <Text position={[0, 0, 0]} fontSize={1} color="#ff0000" anchorX="center" anchorY="middle">
        Network not ready
      </Text>
    );
  }

  const resolveNodeColor = (nodeId: string): string => {
    if (!showGroups) return DEFAULT_NODE_COLOR;
    const groups = nodeGroupIndex.get(nodeId);
    const firstGroup = groups?.[0];
    if (!firstGroup) return DEFAULT_NODE_COLOR;
    return groupColors.get(firstGroup) ?? FALLBACK_GROUP_COLOR;
  };

  return (
    <group ref={groupRef}>
      {visualState.nodes.map((node) => {
        const color = resolveNodeColor(node.id);
        const groups = nodeGroupIndex.get(node.id);
        return (
          <group key={node.id} position={[node.position.x, node.position.y, node.position.z]}>
            <Sphere args={[nodeSize]} position={[0, 0, 0]}>
              <meshBasicMaterial color={color} />
            </Sphere>

            {node.connections.size > 0 && (
              <Sphere args={[nodeSize * 0.3]} position={[0, nodeSize + 0.2, 0]}>
                <meshBasicMaterial color="#ffffff" />
              </Sphere>
            )}

            {showLabels && (
              <Text
                position={[0, nodeSize + 0.5, 0]}
                fontSize={0.3}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
              >
                {node.id}
              </Text>
            )}

            {showGroups && groups && groups.length > 0 && (
              <Text
                position={[0, nodeSize + 0.8, 0]}
                fontSize={0.2}
                color={color}
                anchorX="center"
                anchorY="middle"
              >
                {groups.join(', ')}
              </Text>
            )}
          </group>
        );
      })}

      {showConnectionLines && visualState.connections.map((connection) => {
        const fromNode = nodeIndex.get(connection.nodeA);
        const toNode = nodeIndex.get(connection.nodeB);
        if (!fromNode || !toNode) return null;

        return (
          <Line
            key={connection.id}
            points={[
              [fromNode.position.x, fromNode.position.y, fromNode.position.z],
              [toNode.position.x, toNode.position.y, toNode.position.z],
            ]}
            color={getConnectionColor(connection.status)}
            lineWidth={connectionWidth}
            transparent
            opacity={connection.status === 'active' ? 0.8 : 0.4}
          />
        );
      })}

      {showGroups && groupBounds.map(({ groupId, center, radius }) => {
        const color = groupColors.get(groupId) ?? FALLBACK_GROUP_COLOR;
        return (
          <group key={`group-${groupId}`}>
            <mesh position={center}>
              <ringGeometry args={[radius - 0.1, radius + 0.1, 32]} />
              <meshBasicMaterial color={color} transparent opacity={0.3} />
            </mesh>
            <Text
              position={[center[0], center[1] + radius + 0.5, center[2]]}
              fontSize={0.4}
              color={color}
              anchorX="center"
              anchorY="middle"
            >
              Group: {groupId}
            </Text>
          </group>
        );
      })}

      <group position={[-10, 10, 0]}>
        <Text position={[0, 2, 0]} fontSize={0.5} color="#ffffff" anchorX="left" anchorY="middle">
          Network Visualization
        </Text>
        <Text position={[0, 1, 0]} fontSize={0.3} color="#ffffff" anchorX="left" anchorY="middle">
          Nodes: {visualState.nodes.length}
        </Text>
        <Text position={[0, 0.5, 0]} fontSize={0.3} color="#ffffff" anchorX="left" anchorY="middle">
          Connections: {visualState.connections.length}
        </Text>
        <Text position={[0, 0, 0]} fontSize={0.3} color="#ffffff" anchorX="left" anchorY="middle">
          Groups: {visualState.groups.size}
        </Text>
      </group>
    </group>
  );
};
