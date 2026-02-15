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
  private maxMessageQueueSize: number;
  private gridCellSize: number;
  private grid: Map<string, Set<string>> = new Map();
  private nodeCellKey: Map<string, string> = new Map();
  private scratchNearbyNodeIds: Set<string> = new Set();
  private scratchDisconnectIds: string[] = [];
  private scratchCenter: THREE.Vector3 = new THREE.Vector3();

  constructor(proximityRange: number = 50, maxDistance: number = 100, maxMessageQueueSize: number = 200) {
    this.proximityRange = proximityRange;
    this.maxDistance = maxDistance;
    this.maxMessageQueueSize = maxMessageQueueSize;
    // 2D grid (x,z) for proximity queries. Cell size follows default proximity range.
    this.gridCellSize = Math.max(1, proximityRange);
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
    this.addToGrid(nodeId, node.position);
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
    this.removeFromGrid(nodeId);
    
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
    this.updateGridPosition(nodeId, node.position);
    
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
    const maxDistanceSq = this.maxDistance * this.maxDistance;
    if (nodeA.position.distanceToSquared(nodeB.position) > maxDistanceSq) {
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

    const shouldBeConnected = (a: NPCNetworkNode, b: NPCNetworkNode): boolean => {
      const range = Math.min(a.communicationRange, b.communicationRange);
      return a.position.distanceToSquared(b.position) <= range * range;
    };

    // 1) 이미 연결된 노드가 멀어졌으면 해제 (그리드 후보에 없을 수 있음)
    const toDisconnect = this.scratchDisconnectIds;
    toDisconnect.length = 0;
    for (const connectedId of node.connections) {
      const other = this.nodes.get(connectedId);
      if (!other) {
        toDisconnect.push(connectedId);
        continue;
      }
      if (!shouldBeConnected(node, other)) {
        toDisconnect.push(connectedId);
      }
    }
    for (const connectedId of toDisconnect) {
      node.connections.delete(connectedId);
      const other = this.nodes.get(connectedId);
      if (other) other.connections.delete(nodeId);
    }

    // 2) 근처 후보만 신규 연결 시도 (연결/해제 O(n^2) 완화)
    const candidates = this.getNearbyNodeIds(node, this.scratchNearbyNodeIds);
    for (const otherNodeId of candidates) {
      if (nodeId === otherNodeId) continue;
      if (node.connections.has(otherNodeId)) continue;
      const otherNode = this.nodes.get(otherNodeId);
      if (!otherNode) continue;

      if (shouldBeConnected(node, otherNode)) {
        node.connections.add(otherNodeId);
        otherNode.connections.add(nodeId);
      }
    }
  }

  // nodeId 정규화: npcId 또는 nodeId 모두 받아서 nodeId로 통일
  private resolveNodeId(id: string): string {
    return id.startsWith('node_') ? id : `node_${id}`;
  }

  private getCellKey(pos: THREE.Vector3): string {
    const s = this.gridCellSize;
    const cx = Math.floor(pos.x / s);
    const cz = Math.floor(pos.z / s);
    return `${cx},${cz}`;
  }

  private addToGrid(nodeId: string, pos: THREE.Vector3): void {
    const key = this.getCellKey(pos);
    const set = this.grid.get(key) ?? new Set<string>();
    set.add(nodeId);
    this.grid.set(key, set);
    this.nodeCellKey.set(nodeId, key);
  }

  private removeFromGrid(nodeId: string): void {
    const key = this.nodeCellKey.get(nodeId);
    if (!key) return;
    const set = this.grid.get(key);
    if (set) {
      set.delete(nodeId);
      if (set.size === 0) this.grid.delete(key);
    }
    this.nodeCellKey.delete(nodeId);
  }

  private updateGridPosition(nodeId: string, pos: THREE.Vector3): void {
    const prevKey = this.nodeCellKey.get(nodeId);
    const nextKey = this.getCellKey(pos);
    if (prevKey === nextKey) return;
    this.removeFromGrid(nodeId);
    const set = this.grid.get(nextKey) ?? new Set<string>();
    set.add(nodeId);
    this.grid.set(nextKey, set);
    this.nodeCellKey.set(nodeId, nextKey);
  }

  private collectNearbyNodeIdsByPosition(pos: THREE.Vector3, range: number, out: Set<string>): void {
    out.clear();
    const s = this.gridCellSize;
    const radiusCells = Math.max(1, Math.ceil(Math.max(1, range) / s));
    const baseX = Math.floor(pos.x / s);
    const baseZ = Math.floor(pos.z / s);

    for (let dx = -radiusCells; dx <= radiusCells; dx++) {
      for (let dz = -radiusCells; dz <= radiusCells; dz++) {
        const key = `${baseX + dx},${baseZ + dz}`;
        const set = this.grid.get(key);
        if (!set) continue;
        set.forEach((id) => out.add(id));
      }
    }
  }

  private getNearbyNodeIds(node: NPCNetworkNode, out?: Set<string>): Set<string> {
    const target = out ?? new Set<string>();
    this.collectNearbyNodeIdsByPosition(node.position, node.communicationRange, target);
    return target;
  }

  // 노드에 메시지를 추가하되 큐 크기를 제한
  private enqueueMessage(node: NPCNetworkNode, message: NetworkMessage): void {
    if (node.messageQueue.length >= this.maxMessageQueueSize) {
      node.messageQueue.shift();
    }
    node.messageQueue.push(message);
  }

  // 메시지 전송
  sendMessage(message: NetworkMessage): boolean {
    const fromNode = this.nodes.get(this.resolveNodeId(message.from));
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

    this.enqueueMessage(toNode, message);
    
    const now = Date.now();
    this.performanceMetrics.messagesProcessed++;
    this.performanceMetrics.lastUpdate = now;
    
    this.emitEvent({
      type: 'messageReceived',
      nodeId: toNodeId,
      data: message,
      timestamp: now
    });
    
    return true;
  }

  // 브로드캐스트 메시지 전송
  private broadcastMessage(message: NetworkMessage): boolean {
    let successCount = 0;
    
    const fromNodeId = this.resolveNodeId(message.from);
    for (const node of this.nodes.values()) {
      if (node.id === fromNodeId) continue;
      
      const directMessage: NetworkMessage = {
        ...message,
        to: node.id
      };
      
      this.enqueueMessage(node, directMessage);
      successCount++;
    }
    
    const now = Date.now();
    this.performanceMetrics.messagesProcessed += successCount;
    this.performanceMetrics.lastUpdate = now;
    
    return successCount > 0;
  }

  // 그룹 메시지 전송
  private sendGroupMessage(message: NetworkMessage): boolean {
    if (!message.groupId) return false;
    
    const group = this.groups.get(message.groupId);
    if (!group) return false;
    
    let successCount = 0;
    
    const fromNodeId = this.resolveNodeId(message.from);
    for (const nodeId of group.members) {
      if (nodeId === fromNodeId) continue;
      
      const node = this.nodes.get(nodeId);
      if (node) {
        const directMessage: NetworkMessage = {
          ...message,
          to: nodeId
        };
        
        this.enqueueMessage(node, directMessage);
        successCount++;
      }
    }
    
    const now = Date.now();
    this.performanceMetrics.messagesProcessed += successCount;
    this.performanceMetrics.lastUpdate = now;
    
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
    const center = this.scratchCenter;
    const candidates = this.scratchNearbyNodeIds;

    for (const group of this.groups.values()) {
      if (group.type !== 'proximity') continue;
      if (group.members.size === 0) continue;
      if (group.range <= 0) continue;

      // 중심점 계산 (불필요한 배열/Vector3 생성 방지)
      let sx = 0;
      let sy = 0;
      let sz = 0;
      let count = 0;
      for (const nodeId of group.members) {
        const node = this.nodes.get(nodeId);
        if (!node) continue;
        sx += node.position.x;
        sy += node.position.y;
        sz += node.position.z;
        count += 1;
      }
      if (count === 0) continue;

      center.set(sx / count, sy / count, sz / count);

      // Grid 기반 후보만 확인
      this.collectNearbyNodeIdsByPosition(center, group.range, candidates);
      const rangeSq = group.range * group.range;

      for (const nodeId of candidates) {
        if (group.members.size >= group.maxMembers) break;
        if (group.members.has(nodeId)) continue;
        const node = this.nodes.get(nodeId);
        if (!node) continue;
        const dx = node.position.x - center.x;
        const dy = node.position.y - center.y;
        const dz = node.position.z - center.z;
        if (dx * dx + dy * dy + dz * dz <= rangeSq) {
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

  // Map을 array로 만들지 않고 순회
  forEachNode(callback: (node: NPCNetworkNode) => void): void {
    for (const node of this.nodes.values()) callback(node);
  }

  // 그룹 정보 가져오기
  getGroup(groupId: string): NetworkGroup | null {
    return this.groups.get(groupId) || null;
  }

  // 모든 그룹 가져오기
  getAllGroups(): NetworkGroup[] {
    return Array.from(this.groups.values());
  }

  // Map을 array로 만들지 않고 순회
  forEachGroup(callback: (group: NetworkGroup) => void): void {
    for (const group of this.groups.values()) callback(group);
  }

  // 매니저 초기화
  clear(): void {
    this.nodes.clear();
    this.groups.clear();
    this.eventCallbacks.clear();
    this.grid.clear();
    this.nodeCellKey.clear();
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
    let totalMessages = 0;
    for (const node of this.nodes.values()) {
      totalMessages += node.messageQueue.length;
    }

    return {
      nodeCount,
      connectionCount,
      groupCount,
      averageConnections,
      totalMessages
    };
  }
} 