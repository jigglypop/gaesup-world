import React, { useRef, useEffect, useMemo } from 'react';

import { Line, Sphere, Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import { useNetworkBridge } from '../hooks';
import { NPCNetworkNode, NetworkConnection } from '../types';

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

export const NPCNetworkVisualizer: React.FC<NPCNetworkVisualizerProps> = ({
  systemId = 'main',
  showLabels = true,
  showConnectionLines = true,
  showGroups = true,
  nodeSize = 0.5,
  connectionWidth = 0.05,
  updateInterval = 100,
  maxRenderDistance = 100
}) => {
  const { getSnapshot, isReady } = useNetworkBridge({ systemId });
  const groupRef = useRef<THREE.Group>(null);
  const lastUpdateRef = useRef<number>(0);
  
  const [visualState, setVisualState] = React.useState<VisualizationState>({
    nodes: [],
    connections: [],
    groups: new Map()
  });

  // 데이터 업데이트
  useFrame(() => {
    const now = Date.now();
    if (!isReady || now - lastUpdateRef.current < updateInterval) return;
    
    const snapshot = getSnapshot();
    if (!snapshot) return;

    const nodes = Array.from(snapshot.nodes.values());
    const connections = Array.from(snapshot.connections.values());
    const groups = snapshot.groups;

    setVisualState({
      nodes,
      connections,
      groups
    });
    
    lastUpdateRef.current = now;
  });

  // 그룹별 색상 생성
  const groupColors = useMemo(() => {
    const colors = new Map<string, string>();
    const colorPalette = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    
    let colorIndex = 0;
    visualState.groups.forEach((_, groupId) => {
      colors.set(groupId, colorPalette[colorIndex % colorPalette.length]);
      colorIndex++;
    });
    
    return colors;
  }, [visualState.groups]);

  // 노드 색상 결정
  const getNodeColor = (node: NPCNetworkNode): string => {
    if (showGroups && node.groups.length > 0) {
      const firstGroup = node.groups[0];
      return groupColors.get(firstGroup) || '#cccccc';
    }
    return '#4a90e2';
  };

  // 연결선 색상 결정
  const getConnectionColor = (connection: NetworkConnection): string => {
    switch (connection.state) {
      case 'connected': return '#00ff00';
      case 'connecting': return '#ffff00';
      case 'failed': return '#ff0000';
      case 'disconnected': return '#cccccc';
      default: return '#666666';
    }
  };

  // 카메라로부터의 거리 확인
  const isWithinRenderDistance = (position: THREE.Vector3, camera: THREE.Camera): boolean => {
    return position.distanceTo(camera.position) <= maxRenderDistance;
  };

  // 노드 렌더링
  const renderNodes = () => {
    return visualState.nodes.map(node => {
      const position = new THREE.Vector3(node.position.x, node.position.y, node.position.z);
      const color = getNodeColor(node);
      
      return (
        <group key={node.id} position={position}>
          {/* 노드 구체 */}
          <Sphere args={[nodeSize]} position={[0, 0, 0]}>
            <meshBasicMaterial color={color} />
          </Sphere>
          
          {/* 연결 개수 표시 */}
          {node.connections.length > 0 && (
            <Sphere args={[nodeSize * 0.3]} position={[0, nodeSize + 0.2, 0]}>
              <meshBasicMaterial color="#ffffff" />
            </Sphere>
          )}
          
          {/* 노드 라벨 */}
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
          
          {/* 그룹 표시 */}
          {showGroups && node.groups.length > 0 && (
            <Text
              position={[0, nodeSize + 0.8, 0]}
              fontSize={0.2}
              color={getNodeColor(node)}
              anchorX="center"
              anchorY="middle"
            >
              {node.groups.join(', ')}
            </Text>
          )}
        </group>
      );
    });
  };

  // 연결선 렌더링
  const renderConnections = () => {
    if (!showConnectionLines) return null;

    return visualState.connections.map(connection => {
      const fromNode = visualState.nodes.find(n => n.id === connection.fromNodeId);
      const toNode = visualState.nodes.find(n => n.id === connection.toNodeId);
      
      if (!fromNode || !toNode) return null;
      
      const fromPos = new THREE.Vector3(fromNode.position.x, fromNode.position.y, fromNode.position.z);
      const toPos = new THREE.Vector3(toNode.position.x, toNode.position.y, toNode.position.z);
      const points = [fromPos, toPos];
      const color = getConnectionColor(connection);
      
      return (
        <Line
          key={connection.id}
          points={points}
          color={color}
          lineWidth={connectionWidth}
          transparent={true}
          opacity={connection.state === 'connected' ? 0.8 : 0.4}
        />
      );
    });
  };

  // 그룹 경계선 렌더링
  const renderGroupBoundaries = () => {
    if (!showGroups) return null;

    return Array.from(visualState.groups.entries()).map(([groupId, memberIds]) => {
      const groupNodes = visualState.nodes.filter(node => memberIds.includes(node.id));
      if (groupNodes.length < 2) return null;

      // 그룹의 중심점 계산
      const center = groupNodes.reduce(
        (acc, node) => ({
          x: acc.x + node.position.x,
          y: acc.y + node.position.y,
          z: acc.z + node.position.z
        }),
        { x: 0, y: 0, z: 0 }
      );
      center.x /= groupNodes.length;
      center.y /= groupNodes.length;
      center.z /= groupNodes.length;

      // 그룹의 반지름 계산
      const radius = Math.max(
        ...groupNodes.map(node =>
          Math.sqrt(
            Math.pow(node.position.x - center.x, 2) +
            Math.pow(node.position.y - center.y, 2) +
            Math.pow(node.position.z - center.z, 2)
          )
        )
      ) + 1;

      return (
        <group key={`group-${groupId}`}>
          {/* 그룹 경계 원 */}
          <mesh position={[center.x, center.y, center.z]}>
            <ringGeometry args={[radius - 0.1, radius + 0.1, 32]} />
            <meshBasicMaterial 
              color={groupColors.get(groupId) || '#cccccc'} 
              transparent={true} 
              opacity={0.3} 
            />
          </mesh>
          
          {/* 그룹 라벨 */}
          <Text
            position={[center.x, center.y + radius + 0.5, center.z]}
            fontSize={0.4}
            color={groupColors.get(groupId) || '#cccccc'}
            anchorX="center"
            anchorY="middle"
          >
            Group: {groupId}
          </Text>
        </group>
      );
    });
  };

  if (!isReady) {
    return (
      <Text
        position={[0, 0, 0]}
        fontSize={1}
        color="#ff0000"
        anchorX="center"
        anchorY="middle"
      >
        Network not ready
      </Text>
    );
  }

  return (
    <group ref={groupRef}>
      {/* 노드들 */}
      {renderNodes()}
      
      {/* 연결선들 */}
      {renderConnections()}
      
      {/* 그룹 경계선들 */}
      {renderGroupBoundaries()}
      
      {/* 범례 */}
      <group position={[-10, 10, 0]}>
        <Text
          position={[0, 2, 0]}
          fontSize={0.5}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          Network Visualization
        </Text>
        <Text
          position={[0, 1, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          Nodes: {visualState.nodes.length}
        </Text>
        <Text
          position={[0, 0.5, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          Connections: {visualState.connections.length}
        </Text>
        <Text
          position={[0, 0, 0]}
          fontSize={0.3}
          color="#ffffff"
          anchorX="left"
          anchorY="middle"
        >
          Groups: {visualState.groups.size}
        </Text>
      </group>
    </group>
  );
}; 