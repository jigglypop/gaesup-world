import * as THREE from 'three';
import { NPCNetworkNode, NetworkMessage, NetworkGroup } from '../../types';
import { PerformanceMetrics, NetworkEvent } from '../types';

// NPCNetworkManager 클래스 모의 구현
class NPCNetworkManager {
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
}

describe('NPCNetworkManager', () => {
  let manager: NPCNetworkManager;
  
  beforeEach(() => {
    manager = new NPCNetworkManager(50, 100);
  });

  describe('노드 관리', () => {
    test('NPC 노드 등록', () => {
      const position = new THREE.Vector3(10, 0, 20);
      const node = manager.registerNode('npc1', position, {
        communicationRange: 75,
        signalStrength: 1.5
      });

      expect(node.id).toBe('node_npc1');
      expect(node.npcId).toBe('npc1');
      expect(node.position).toEqual(position);
      expect(node.communicationRange).toBe(75);
      expect(node.signalStrength).toBe(1.5);
      expect(node.status).toBe('active');
      expect(node.connections.size).toBe(0);
      expect(node.messageQueue).toEqual([]);
    });

    test('기본 옵션으로 NPC 노드 등록', () => {
      const position = new THREE.Vector3(0, 0, 0);
      const node = manager.registerNode('npc2', position);

      expect(node.communicationRange).toBe(50); // 기본값
      expect(node.signalStrength).toBe(1.0); // 기본값
    });

    test('중복 NPC 노드 등록 시 오류', () => {
      const position = new THREE.Vector3(0, 0, 0);
      manager.registerNode('npc1', position);

      expect(() => {
        manager.registerNode('npc1', position);
      }).toThrow('Node node_npc1 is already registered');
    });

    test('NPC 노드 제거', () => {
      const position = new THREE.Vector3(0, 0, 0);
      manager.registerNode('npc1', position);
      
      const removed = manager.unregisterNode('npc1');
      expect(removed).toBe(true);
      
      const node = manager.getNode('npc1');
      expect(node).toBeNull();
    });

    test('존재하지 않는 NPC 노드 제거', () => {
      const removed = manager.unregisterNode('nonexistent');
      expect(removed).toBe(false);
    });

    test('노드 위치 업데이트', () => {
      const initialPosition = new THREE.Vector3(0, 0, 0);
      const newPosition = new THREE.Vector3(50, 0, 30);
      
      manager.registerNode('npc1', initialPosition);
      
      const updated = manager.updateNodePosition('npc1', newPosition);
      expect(updated).toBe(true);
      
      const node = manager.getNode('npc1');
      expect(node?.position).toEqual(newPosition);
    });
  });

  describe('노드 연결 관리', () => {
    beforeEach(() => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));
      manager.registerNode('npc3', new THREE.Vector3(200, 0, 0)); // 거리 제한 밖
    });

    test('두 노드 간 직접 연결', () => {
      const connected = manager.connectNodes('npc1', 'npc2');
      expect(connected).toBe(true);
      
      const node1 = manager.getNode('npc1');
      const node2 = manager.getNode('npc2');
      
      expect(node1?.connections.has('node_npc2')).toBe(true);
      expect(node2?.connections.has('node_npc1')).toBe(true);
    });

    test('거리 제한을 벗어난 노드 연결 실패', () => {
      const connected = manager.connectNodes('npc1', 'npc3');
      expect(connected).toBe(false);
      
      const node1 = manager.getNode('npc1');
      const node3 = manager.getNode('npc3');
      
      expect(node1?.connections.has('node_npc3')).toBe(false);
      expect(node3?.connections.has('node_npc1')).toBe(false);
    });

    test('두 노드 간 연결 해제', () => {
      manager.connectNodes('npc1', 'npc2');
      
      const disconnected = manager.disconnectNodes('npc1', 'npc2');
      expect(disconnected).toBe(true);
      
      const node1 = manager.getNode('npc1');
      const node2 = manager.getNode('npc2');
      
      expect(node1?.connections.has('node_npc2')).toBe(false);
      expect(node2?.connections.has('node_npc1')).toBe(false);
    });

    test('근접 기반 자동 연결', () => {
      // npc1과 npc2는 통신 범위 내 (거리 30, 범위 50)
      const node1 = manager.getNode('npc1');
      const node2 = manager.getNode('npc2');
      
      // 위치 업데이트로 근접 연결 트리거
      manager.updateNodePosition('npc1', new THREE.Vector3(0, 0, 0));
      
      expect(node1?.connections.has('node_npc2')).toBe(true);
      expect(node2?.connections.has('node_npc1')).toBe(true);
    });

    test('거리 이동으로 인한 자동 연결 해제', () => {
      manager.connectNodes('npc1', 'npc2');
      
      // npc2를 멀리 이동
      manager.updateNodePosition('npc2', new THREE.Vector3(100, 0, 0));
      
      const node1 = manager.getNode('npc1');
      const node2 = manager.getNode('npc2');
      
      expect(node1?.connections.has('node_npc2')).toBe(false);
      expect(node2?.connections.has('node_npc1')).toBe(false);
    });
  });

  describe('메시지 전송', () => {
    beforeEach(() => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));
      manager.registerNode('npc3', new THREE.Vector3(60, 0, 0));
    });

    test('직접 메시지 전송', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'npc1',
        to: 'npc2',
        type: 'chat',
        payload: { text: 'Hello NPC2!' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      const sent = manager.sendMessage(message);
      expect(sent).toBe(true);
      
      const messages = manager.getMessages('npc2');
      expect(messages).toHaveLength(1);
      expect(messages[0]).toEqual(message);
    });

    test('브로드캐스트 메시지 전송', () => {
      const message: NetworkMessage = {
        id: 'broadcast1',
        from: 'npc1',
        to: 'broadcast',
        type: 'system',
        payload: { announcement: 'Server maintenance' },
        priority: 'high',
        timestamp: Date.now(),
        reliability: 'unreliable'
      };

      const sent = manager.sendMessage(message);
      expect(sent).toBe(true);
      
      // npc2와 npc3가 메시지를 받아야 함 (npc1 제외)
      const messages2 = manager.getMessages('npc2');
      const messages3 = manager.getMessages('npc3');
      
      expect(messages2).toHaveLength(1);
      expect(messages3).toHaveLength(1);
      
      // 보낸 사람은 받지 않음
      const messages1 = manager.getMessages('npc1');
      expect(messages1).toHaveLength(0);
    });

    test('존재하지 않는 노드에게 메시지 전송 실패', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'npc1',
        to: 'nonexistent',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      const sent = manager.sendMessage(message);
      expect(sent).toBe(false);
    });

    test('메시지 가져오기 후 큐 비워짐', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'npc1',
        to: 'npc2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      manager.sendMessage(message);
      
      // 첫 번째 호출
      const messages1 = manager.getMessages('npc2');
      expect(messages1).toHaveLength(1);
      
      // 두 번째 호출 - 큐가 비워져야 함
      const messages2 = manager.getMessages('npc2');
      expect(messages2).toHaveLength(0);
    });
  });

  describe('그룹 관리', () => {
    beforeEach(() => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));
      manager.registerNode('npc3', new THREE.Vector3(60, 0, 0));
    });

    test('그룹 생성', () => {
      const group = manager.createGroup('party', {
        maxMembers: 4,
        range: 50,
        persistent: false
      });

      expect(group.id).toMatch(/^group_\d+$/);
      expect(group.type).toBe('party');
      expect(group.maxMembers).toBe(4);
      expect(group.range).toBe(50);
      expect(group.persistent).toBe(false);
      expect(group.members.size).toBe(0);
    });

    test('기본 옵션으로 그룹 생성', () => {
      const partyGroup = manager.createGroup('party');
      const guildGroup = manager.createGroup('guild');
      const proximityGroup = manager.createGroup('proximity');

      expect(partyGroup.maxMembers).toBe(8);
      expect(guildGroup.maxMembers).toBe(100);
      expect(proximityGroup.maxMembers).toBe(20);
      
      expect(partyGroup.persistent).toBe(false);
      expect(guildGroup.persistent).toBe(true);
      expect(proximityGroup.persistent).toBe(false);
    });

    test('그룹 참여', () => {
      const group = manager.createGroup('party');
      
      const joined = manager.joinGroup('npc1', group.id);
      expect(joined).toBe(true);
      expect(group.members.has('node_npc1')).toBe(true);
      expect(group.members.size).toBe(1);
    });

    test('그룹 최대 인원 초과 시 참여 실패', () => {
      const group = manager.createGroup('party', { maxMembers: 1 });
      
      manager.joinGroup('npc1', group.id);
      
      const joined = manager.joinGroup('npc2', group.id);
      expect(joined).toBe(false);
      expect(group.members.size).toBe(1);
    });

    test('그룹 탈퇴', () => {
      const group = manager.createGroup('party');
      manager.joinGroup('npc1', group.id);
      
      const left = manager.leaveGroup('npc1', group.id);
      expect(left).toBe(true);
      expect(group.members.has('node_npc1')).toBe(false);
      expect(group.members.size).toBe(0);
    });

    test('비영구 그룹의 마지막 멤버 탈퇴 시 그룹 삭제', () => {
      const group = manager.createGroup('party', { persistent: false });
      manager.joinGroup('npc1', group.id);
      
      manager.leaveGroup('npc1', group.id);
      
      const deletedGroup = manager.getGroup(group.id);
      expect(deletedGroup).toBeNull();
    });

    test('영구 그룹의 마지막 멤버 탈퇴 시 그룹 유지', () => {
      const group = manager.createGroup('guild', { persistent: true });
      manager.joinGroup('npc1', group.id);
      
      manager.leaveGroup('npc1', group.id);
      
      const persistentGroup = manager.getGroup(group.id);
      expect(persistentGroup).not.toBeNull();
      expect(persistentGroup?.members.size).toBe(0);
    });

    test('그룹 메시지 전송', () => {
      const group = manager.createGroup('party');
      manager.joinGroup('npc1', group.id);
      manager.joinGroup('npc2', group.id);
      manager.joinGroup('npc3', group.id);

      const message: NetworkMessage = {
        id: 'groupmsg1',
        from: 'npc1',
        to: 'group',
        type: 'action',
        payload: { action: 'attack' },
        priority: 'high',
        timestamp: Date.now(),
        reliability: 'reliable',
        groupId: group.id
      };

      const sent = manager.sendMessage(message);
      expect(sent).toBe(true);

      // npc2와 npc3가 메시지를 받아야 함 (보낸 npc1 제외)
      const messages2 = manager.getMessages('npc2');
      const messages3 = manager.getMessages('npc3');
      const messages1 = manager.getMessages('npc1');

      expect(messages2).toHaveLength(1);
      expect(messages3).toHaveLength(1);
      expect(messages1).toHaveLength(0);
    });
  });

  describe('이벤트 시스템', () => {
    test('노드 연결 이벤트', (done) => {
      manager.addEventListener('nodeConnected', (event) => {
        expect(event.type).toBe('nodeConnected');
        expect(event.nodeId).toBe('node_npc1');
        expect(event.data.npcId).toBe('npc1');
        done();
      });

      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
    });

    test('노드 해제 이벤트', (done) => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));

      manager.addEventListener('nodeDisconnected', (event) => {
        expect(event.type).toBe('nodeDisconnected');
        expect(event.nodeId).toBe('node_npc1');
        done();
      });

      manager.unregisterNode('npc1');
    });

    test('그룹 참여 이벤트', (done) => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      const group = manager.createGroup('party');

      manager.addEventListener('groupJoined', (event) => {
        expect(event.type).toBe('groupJoined');
        expect(event.nodeId).toBe('node_npc1');
        expect(event.data.groupId).toBe(group.id);
        done();
      });

      manager.joinGroup('npc1', group.id);
    });

    test('이벤트 리스너 제거', () => {
      const callback = jest.fn();
      
      manager.addEventListener('nodeConnected', callback);
      manager.removeEventListener('nodeConnected', callback);
      
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('성능 메트릭', () => {
    test('메시지 처리 통계', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));

      const message: NetworkMessage = {
        id: 'msg1',
        from: 'npc1',
        to: 'npc2',
        type: 'chat',
        payload: {},
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      manager.sendMessage(message);
      
      const metrics = manager.getPerformanceMetrics();
      expect(metrics.messagesProcessed).toBe(1);
      expect(metrics.lastUpdate).toBeGreaterThan(0);
    });

    test('연결 수 통계', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));
      
      manager.connectNodes('npc1', 'npc2');
      
      const metrics = manager.getPerformanceMetrics();
      expect(metrics.connectionCount).toBe(1);
    });
  });

  describe('데이터 조회', () => {
    test('모든 노드 가져오기', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      manager.registerNode('npc2', new THREE.Vector3(30, 0, 0));

      const allNodes = manager.getAllNodes();
      expect(allNodes).toHaveLength(2);
      expect(allNodes.map(node => node.npcId)).toEqual(['npc1', 'npc2']);
    });

    test('모든 그룹 가져오기', () => {
      const group1 = manager.createGroup('party');
      const group2 = manager.createGroup('guild');

      const allGroups = manager.getAllGroups();
      expect(allGroups).toHaveLength(2);
      expect(allGroups.map(group => group.id)).toEqual([group1.id, group2.id]);
    });
  });

  describe('매니저 초기화', () => {
    test('모든 데이터 초기화', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      const group = manager.createGroup('party');
      manager.joinGroup('npc1', group.id);

      manager.clear();

      expect(manager.getAllNodes()).toHaveLength(0);
      expect(manager.getAllGroups()).toHaveLength(0);
      
      const metrics = manager.getPerformanceMetrics();
      expect(metrics.messagesProcessed).toBe(0);
      expect(metrics.connectionCount).toBe(0);
    });
  });
}); 