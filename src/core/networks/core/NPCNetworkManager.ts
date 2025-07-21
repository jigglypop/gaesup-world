import * as THREE from 'three';
import { NPCNetworkNode, NetworkMessage, NetworkGroup } from '../types';
import { PerformanceMetrics, NetworkEvent } from './types';

export class NPCNetworkManager {
  private nodes: Map<string, NPCNetworkNode> = new Map();
  private groups: Map<string, NetworkGroup> = new Map();
  private eventCallbacks: Map<string, ((event: NetworkEvent) => void)[]> = new Map();
  private performanceMetrics: PerformanceMetrics;
  private proximityRange: number;
  private maxDistance: number;
  private groupIdCounter: number = 1;

  constructor(proximityRange: number = 50, maxDistance: number = 100) {
    this.proximityRange = proximityRange;
    this.maxDistance = maxDistance;
    this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
  }

  // NPC 노드 등록
  registerNode(npcId: string, position: THREE.Vector3, options?: {
    communicationRange?: number;
    signalStrength?: number;
  }): NPCNetworkNode {
    const nodeId = `node_${npcId}`;
    
    if (this.nodes.has(nodeId)) {
      throw new Error(`Node ${nodeId} is already registered`);
    }

    const node: NPCNetworkNode = {
      id: nodeId,
      npcId,
      position: position.clone(),
      connections: new Set(),
      messageQueue: [],
      lastUpdate: Date.now(),
      status: 'active',
      communicationRange: options?.communicationRange || this.proximityRange,
      signalStrength: options?.signalStrength || 1.0
    };

    this.nodes.set(nodeId, node);
    this.emitEvent({
      type: 'nodeConnected',
      nodeId,
      data: { npcId, position },
      timestamp: Date.now()
    });

    return node;
  }

  // NPC 노드 제거
  unregisterNode(npcId: string): boolean {
    const nodeId = `node_${npcId}`;
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      return false;
    }

    // 모든 연결 해제
    this.disconnectAllConnections(nodeId);
    
    // 모든 그룹에서 제거
    this.leaveAllGroups(nodeId);
    
    // 노드 제거
    this.nodes.delete(nodeId);
    
    this.emitEvent({
      type: 'nodeDisconnected',
      nodeId,
      data: { npcId },
      timestamp: Date.now()
    });

    return true;
  }

  // 노드 위치 업데이트
  updateNodePosition(npcId: string, position: THREE.Vector3): boolean {
    const nodeId = `node_${npcId}`;
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      return false;
    }

    node.position.copy(position);
    node.lastUpdate = Date.now();
    
    // 근접 기반 자동 연결/해제 확인
    this.updateProximityConnections(nodeId);
    
    return true;
  }

  // 두 노드 간 직접 연결
  connectNodes(npcIdA: string, npcIdB: string): boolean {
    const nodeIdA = `node_${npcIdA}`;
    const nodeIdB = `node_${npcIdB}`;
    
    const nodeA = this.nodes.get(nodeIdA);
    const nodeB = this.nodes.get(nodeIdB);
    
    if (!nodeA || !nodeB) {
      return false;
    }

    // 거리 확인
    const distance = nodeA.position.distanceTo(nodeB.position);
    if (distance > this.maxDistance) {
      return false;
    }

    // 연결 추가
    nodeA.connections.add(nodeIdB);
    nodeB.connections.add(nodeIdA);
    
    this.performanceMetrics.connectionCount = this.getTotalConnections();
    
    return true;
  }

  // 두 노드 간 연결 해제
  disconnectNodes(npcIdA: string, npcIdB: string): boolean {
    const nodeIdA = `node_${npcIdA}`;
    const nodeIdB = `node_${npcIdB}`;
    
    const nodeA = this.nodes.get(nodeIdA);
    const nodeB = this.nodes.get(nodeIdB);
    
    if (!nodeA || !nodeB) {
      return false;
    }

    nodeA.connections.delete(nodeIdB);
    nodeB.connections.delete(nodeIdA);
    
    this.performanceMetrics.connectionCount = this.getTotalConnections();
    
    return true;
  }

  // 노드의 모든 연결 해제
  private disconnectAllConnections(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    // 연결된 모든 노드에서 이 노드 제거
    for (const connectedNodeId of node.connections) {
      const connectedNode = this.nodes.get(connectedNodeId);
      if (connectedNode) {
        connectedNode.connections.delete(nodeId);
      }
    }

    node.connections.clear();
  }

  // 근접 기반 자동 연결 업데이트
  private updateProximityConnections(nodeId: string): void {
    const node = this.nodes.get(nodeId);
    if (!node) return;

    for (const [otherNodeId, otherNode] of this.nodes.entries()) {
      if (nodeId === otherNodeId) continue;

      const distance = node.position.distanceTo(otherNode.position);
      const isConnected = node.connections.has(otherNodeId);
      const shouldBeConnected = distance <= Math.min(node.communicationRange, otherNode.communicationRange);

      if (shouldBeConnected && !isConnected) {
        // 자동 연결
        node.connections.add(otherNodeId);
        otherNode.connections.add(nodeId);
      } else if (!shouldBeConnected && isConnected) {
        // 자동 해제
        node.connections.delete(otherNodeId);
        otherNode.connections.delete(nodeId);
      }
    }
  }

  // 메시지 전송
  sendMessage(message: NetworkMessage): boolean {
    const fromNode = this.nodes.get(`node_${message.from.replace('node_', '')}`);
    if (!fromNode) {
      return false;
    }

    if (message.to === 'broadcast') {
      return this.broadcastMessage(message);
    } else if (message.to === 'group' && message.groupId) {
      return this.sendGroupMessage(message);
    } else {
      return this.sendDirectMessage(message);
    }
  }

  // 직접 메시지 전송
  private sendDirectMessage(message: NetworkMessage): boolean {
    const toNodeId = message.to.startsWith('node_') ? message.to : `node_${message.to}`;
    const toNode = this.nodes.get(toNodeId);
    
    if (!toNode) {
      return false;
    }

    // 메시지 큐에 추가
    toNode.messageQueue.push(message);
    
    this.performanceMetrics.messagesProcessed++;
    this.performanceMetrics.lastUpdate = Date.now();
    
    this.emitEvent({
      type: 'messageReceived',
      nodeId: toNodeId,
      data: message,
      timestamp: Date.now()
    });
    
    return true;
  }

  // 브로드캐스트 메시지 전송
  private broadcastMessage(message: NetworkMessage): boolean {
    let successCount = 0;
    
    for (const node of this.nodes.values()) {
      if (node.id === `node_${message.from.replace('node_', '')}`) continue;
      
      const directMessage: NetworkMessage = {
        ...message,
        to: node.id
      };
      
      node.messageQueue.push(directMessage);
      successCount++;
    }
    
    this.performanceMetrics.messagesProcessed += successCount;
    this.performanceMetrics.lastUpdate = Date.now();
    
    return successCount > 0;
  }

  // 그룹 메시지 전송
  private sendGroupMessage(message: NetworkMessage): boolean {
    if (!message.groupId) return false;
    
    const group = this.groups.get(message.groupId);
    if (!group) return false;
    
    let successCount = 0;
    
    for (const nodeId of group.members) {
      if (nodeId === `node_${message.from.replace('node_', '')}`) continue;
      
      const node = this.nodes.get(nodeId);
      if (node) {
        const directMessage: NetworkMessage = {
          ...message,
          to: nodeId
        };
        
        node.messageQueue.push(directMessage);
        successCount++;
      }
    }
    
    this.performanceMetrics.messagesProcessed += successCount;
    this.performanceMetrics.lastUpdate = Date.now();
    
    return successCount > 0;
  }

  // 노드의 메시지 가져오기
  getMessages(npcId: string): NetworkMessage[] {
    const nodeId = `node_${npcId}`;
    const node = this.nodes.get(nodeId);
    
    if (!node) {
      return [];
    }

    const messages = [...node.messageQueue];
    node.messageQueue = []; // 메시지 큐 비우기
    
    return messages;
  }

  // 그룹 생성
  createGroup(type: NetworkGroup['type'], options?: {
    maxMembers?: number;
    range?: number;
    persistent?: boolean;
  }): NetworkGroup {
    const groupId = `group_${this.groupIdCounter++}`;
    
    const group: NetworkGroup = {
      id: groupId,
      type,
      members: new Set(),
      maxMembers: options?.maxMembers || (type === 'party' ? 8 : type === 'guild' ? 100 : 20),
      range: options?.range || (type === 'proximity' ? 30 : 1000),
      persistent: options?.persistent !== undefined ? options.persistent : type === 'guild',
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    this.groups.set(groupId, group);
    return group;
  }

  // 그룹 참여
  joinGroup(npcId: string, groupId: string): boolean {
    const nodeId = `node_${npcId}`;
    const node = this.nodes.get(nodeId);
    const group = this.groups.get(groupId);
    
    if (!node || !group) {
      return false;
    }

    if (group.members.size >= group.maxMembers) {
      return false; // 그룹이 가득 참
    }

    group.members.add(nodeId);
    group.lastActivity = Date.now();
    
    this.emitEvent({
      type: 'groupJoined',
      nodeId,
      data: { groupId },
      timestamp: Date.now()
    });
    
    return true;
  }

  // 그룹 탈퇴
  leaveGroup(npcId: string, groupId: string): boolean {
    const nodeId = `node_${npcId}`;
    const group = this.groups.get(groupId);
    
    if (!group || !group.members.has(nodeId)) {
      return false;
    }

    group.members.delete(nodeId);
    group.lastActivity = Date.now();
    
    // 비영구 그룹이고 멤버가 없으면 제거
    if (!group.persistent && group.members.size === 0) {
      this.groups.delete(groupId);
    }
    
    this.emitEvent({
      type: 'groupLeft',
      nodeId,
      data: { groupId },
      timestamp: Date.now()
    });
    
    return true;
  }

  // 노드의 모든 그룹 탈퇴
  private leaveAllGroups(nodeId: string): void {
    for (const [groupId, group] of this.groups.entries()) {
      if (group.members.has(nodeId)) {
        group.members.delete(nodeId);
        
        if (!group.persistent && group.members.size === 0) {
          this.groups.delete(groupId);
        }
      }
    }
  }

  // 근접 그룹 자동 참여
  updateProximityGroups(): void {
    const proximityGroups = Array.from(this.groups.values())
      .filter(group => group.type === 'proximity');

    for (const group of proximityGroups) {
      // 기존 멤버들의 중심점 계산
      if (group.members.size === 0) continue;

      const memberPositions: THREE.Vector3[] = [];
      for (const nodeId of group.members) {
        const node = this.nodes.get(nodeId);
        if (node) {
          memberPositions.push(node.position);
        }
      }

      if (memberPositions.length === 0) continue;

      // 중심점 계산
      const center = new THREE.Vector3();
      for (const pos of memberPositions) {
        center.add(pos);
      }
      center.divideScalar(memberPositions.length);

      // 근처 노드들 확인
      for (const [nodeId, node] of this.nodes.entries()) {
        if (group.members.has(nodeId)) continue;
        
        const distance = node.position.distanceTo(center);
        if (distance <= group.range && group.members.size < group.maxMembers) {
          group.members.add(nodeId);
        }
      }
    }
  }

  // 이벤트 리스너 등록
  addEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  // 이벤트 발생
  private emitEvent(event: NetworkEvent): void {
    const callbacks = this.eventCallbacks.get(event.type);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(event);
        } catch (error) {
          console.error('Error in event callback:', error);
        }
      });
    }
  }

  // 총 연결 수 계산
  private getTotalConnections(): number {
    let total = 0;
    for (const node of this.nodes.values()) {
      total += node.connections.size;
    }
    return total / 2; // 양방향 연결이므로 2로 나눔
  }

  // 성능 메트릭 가져오기
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  // 노드 정보 가져오기
  getNode(npcId: string): NPCNetworkNode | null {
    const nodeId = `node_${npcId}`;
    return this.nodes.get(nodeId) || null;
  }

  // 모든 노드 가져오기
  getAllNodes(): NPCNetworkNode[] {
    return Array.from(this.nodes.values());
  }

  // 그룹 정보 가져오기
  getGroup(groupId: string): NetworkGroup | null {
    return this.groups.get(groupId) || null;
  }

  // 모든 그룹 가져오기
  getAllGroups(): NetworkGroup[] {
    return Array.from(this.groups.values());
  }

  // 매니저 초기화
  clear(): void {
    this.nodes.clear();
    this.groups.clear();
    this.eventCallbacks.clear();
    this.performanceMetrics = {
      messagesProcessed: 0,
      averageLatency: 0,
      bandwidth: 0,
      connectionCount: 0,
      errorRate: 0,
      lastUpdate: Date.now()
    };
    this.groupIdCounter = 1;
  }

  // 설정 업데이트
  updateSettings(proximityRange?: number, maxDistance?: number): void {
    if (proximityRange !== undefined) {
      this.proximityRange = Math.max(0, proximityRange);
    }
    if (maxDistance !== undefined) {
      this.maxDistance = Math.max(0, maxDistance);
    }
  }

  // 네트워크 통계 정보
  getNetworkStats(): {
    nodeCount: number;
    connectionCount: number;
    groupCount: number;
    averageConnections: number;
    totalMessages: number;
  } {
    const nodeCount = this.nodes.size;
    const connectionCount = this.getTotalConnections();
    const groupCount = this.groups.size;
    const averageConnections = nodeCount > 0 ? connectionCount / nodeCount : 0;
    const totalMessages = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.messageQueue.length, 0);

    return {
      nodeCount,
      connectionCount,
      groupCount,
      averageConnections,
      totalMessages
    };
  }
} 