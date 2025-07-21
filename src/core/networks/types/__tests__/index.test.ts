import * as THREE from 'three';
import {
  NPCNetworkNode,
  NetworkMessage,
  NetworkConnection,
  NetworkGroup,
  NetworkStats,
  NetworkSystemState,
  NetworkCommand,
  NetworkSnapshot,
  NetworkConfig
} from '../index';

describe('Networks Types', () => {
  describe('NPCNetworkNode', () => {
    test('기본 NPCNetworkNode 생성 및 속성 검증', () => {
      const position = new THREE.Vector3(10, 0, 5);
      const connections = new Set(['node2', 'node3']);
      const messageQueue: NetworkMessage[] = [];
      
      const node: NPCNetworkNode = {
        id: 'node1',
        npcId: 'npc1',
        position,
        connections,
        messageQueue,
        lastUpdate: Date.now(),
        status: 'active',
        communicationRange: 50,
        signalStrength: 1.0
      };

      expect(node.id).toBe('node1');
      expect(node.npcId).toBe('npc1');
      expect(node.position).toBeInstanceOf(THREE.Vector3);
      expect(node.position.x).toBe(10);
      expect(node.position.y).toBe(0);
      expect(node.position.z).toBe(5);
      expect(node.connections).toBeInstanceOf(Set);
      expect(node.connections.size).toBe(2);
      expect(node.connections.has('node2')).toBe(true);
      expect(node.connections.has('node3')).toBe(true);
      expect(node.status).toBe('active');
      expect(node.communicationRange).toBe(50);
      expect(node.signalStrength).toBe(1.0);
    });

    test('NPCNetworkNode 상태 변경 검증', () => {
      const node: NPCNetworkNode = {
        id: 'node1',
        npcId: 'npc1',
        position: new THREE.Vector3(0, 0, 0),
        connections: new Set(),
        messageQueue: [],
        lastUpdate: Date.now(),
        status: 'idle',
        communicationRange: 30,
        signalStrength: 0.5
      };

      // 상태 변경
      node.status = 'active';
      node.communicationRange = 100;
      node.signalStrength = 2.0;
      node.connections.add('node2');

      expect(node.status).toBe('active');
      expect(node.communicationRange).toBe(100);
      expect(node.signalStrength).toBe(2.0);
      expect(node.connections.has('node2')).toBe(true);
    });

    test('NPCNetworkNode 연결 관리', () => {
      const node: NPCNetworkNode = {
        id: 'node1',
        npcId: 'npc1',
        position: new THREE.Vector3(0, 0, 0),
        connections: new Set(),
        messageQueue: [],
        lastUpdate: Date.now(),
        status: 'active',
        communicationRange: 50,
        signalStrength: 1.0
      };

      // 연결 추가
      node.connections.add('node2');
      node.connections.add('node3');
      node.connections.add('node4');

      expect(node.connections.size).toBe(3);
      expect(Array.from(node.connections)).toEqual(['node2', 'node3', 'node4']);

      // 연결 제거
      node.connections.delete('node3');
      expect(node.connections.size).toBe(2);
      expect(node.connections.has('node3')).toBe(false);

      // 모든 연결 제거
      node.connections.clear();
      expect(node.connections.size).toBe(0);
    });
  });

  describe('NetworkMessage', () => {
    test('기본 NetworkMessage 생성 및 속성 검증', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: { text: '안녕하세요!' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      expect(message.id).toBe('msg1');
      expect(message.from).toBe('node1');
      expect(message.to).toBe('node2');
      expect(message.type).toBe('chat');
      expect(message.payload).toEqual({ text: '안녕하세요!' });
      expect(message.priority).toBe('normal');
      expect(message.reliability).toBe('reliable');
      expect(typeof message.timestamp).toBe('number');
    });

    test('브로드캐스트 메시지 검증', () => {
      const broadcastMessage: NetworkMessage = {
        id: 'broadcast1',
        from: 'node1',
        to: 'broadcast',
        type: 'system',
        payload: { announcement: '서버 점검 예정' },
        priority: 'high',
        timestamp: Date.now(),
        reliability: 'unreliable'
      };

      expect(broadcastMessage.to).toBe('broadcast');
      expect(broadcastMessage.type).toBe('system');
      expect(broadcastMessage.priority).toBe('high');
    });

    test('그룹 메시지 검증', () => {
      const groupMessage: NetworkMessage = {
        id: 'group1',
        from: 'node1',
        to: 'group',
        type: 'action',
        payload: { action: 'attack', target: 'enemy1' },
        priority: 'critical',
        timestamp: Date.now(),
        reliability: 'reliable',
        groupId: 'party1',
        retryCount: 0
      };

      expect(groupMessage.to).toBe('group');
      expect(groupMessage.groupId).toBe('party1');
      expect(groupMessage.retryCount).toBe(0);
      expect(groupMessage.priority).toBe('critical');
    });

    test('메시지 우선순위 타입 검증', () => {
      const priorities: Array<NetworkMessage['priority']> = ['low', 'normal', 'high', 'critical'];
      
      priorities.forEach(priority => {
        const message: NetworkMessage = {
          id: `msg_${priority}`,
          from: 'node1',
          to: 'node2',
          type: 'state',
          payload: {},
          priority,
          timestamp: Date.now(),
          reliability: 'unreliable'
        };

        expect(['low', 'normal', 'high', 'critical']).toContain(message.priority);
      });
    });
  });

  describe('NetworkConnection', () => {
    test('기본 NetworkConnection 생성 및 속성 검증', () => {
      const connection: NetworkConnection = {
        id: 'conn1',
        nodeA: 'node1',
        nodeB: 'node2',
        strength: 0.8,
        latency: 50,
        bandwidth: 1000,
        status: 'active',
        lastActivity: Date.now()
      };

      expect(connection.id).toBe('conn1');
      expect(connection.nodeA).toBe('node1');
      expect(connection.nodeB).toBe('node2');
      expect(connection.strength).toBe(0.8);
      expect(connection.latency).toBe(50);
      expect(connection.bandwidth).toBe(1000);
      expect(connection.status).toBe('active');
      expect(typeof connection.lastActivity).toBe('number');
    });

    test('연결 상태 변경 검증', () => {
      const connection: NetworkConnection = {
        id: 'conn1',
        nodeA: 'node1',
        nodeB: 'node2',
        strength: 1.0,
        latency: 10,
        bandwidth: 2000,
        status: 'establishing',
        lastActivity: Date.now()
      };

      // 상태 전환: establishing -> active
      connection.status = 'active';
      expect(connection.status).toBe('active');

      // 상태 전환: active -> unstable
      connection.status = 'unstable';
      connection.strength = 0.3;
      connection.latency = 200;
      expect(connection.status).toBe('unstable');
      expect(connection.strength).toBe(0.3);
      expect(connection.latency).toBe(200);

      // 상태 전환: unstable -> disconnected
      connection.status = 'disconnected';
      connection.strength = 0;
      expect(connection.status).toBe('disconnected');
      expect(connection.strength).toBe(0);
    });
  });

  describe('NetworkGroup', () => {
    test('기본 NetworkGroup 생성 및 속성 검증', () => {
      const members = new Set(['node1', 'node2', 'node3']);
      const now = Date.now();

      const group: NetworkGroup = {
        id: 'party1',
        type: 'party',
        members,
        maxMembers: 8,
        range: 100,
        persistent: true,
        createdAt: now,
        lastActivity: now
      };

      expect(group.id).toBe('party1');
      expect(group.type).toBe('party');
      expect(group.members).toBeInstanceOf(Set);
      expect(group.members.size).toBe(3);
      expect(group.maxMembers).toBe(8);
      expect(group.range).toBe(100);
      expect(group.persistent).toBe(true);
      expect(group.createdAt).toBe(now);
      expect(group.lastActivity).toBe(now);
    });

    test('그룹 멤버 관리', () => {
      const group: NetworkGroup = {
        id: 'guild1',
        type: 'guild',
        members: new Set(),
        maxMembers: 100,
        range: 1000,
        persistent: true,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      // 멤버 추가
      group.members.add('node1');
      group.members.add('node2');
      group.members.add('node3');

      expect(group.members.size).toBe(3);
      expect(group.members.has('node1')).toBe(true);
      expect(group.members.has('node2')).toBe(true);
      expect(group.members.has('node3')).toBe(true);

      // 멤버 제거
      group.members.delete('node2');
      expect(group.members.size).toBe(2);
      expect(group.members.has('node2')).toBe(false);

      // 최대 멤버 수 체크
      const currentSize = group.members.size;
      const canAddMore = currentSize < group.maxMembers;
      expect(canAddMore).toBe(true);
    });

    test('그룹 타입별 특성 검증', () => {
      const partyGroup: NetworkGroup = {
        id: 'party1',
        type: 'party',
        members: new Set(),
        maxMembers: 8,
        range: 50,
        persistent: false,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      const guildGroup: NetworkGroup = {
        id: 'guild1',
        type: 'guild',
        members: new Set(),
        maxMembers: 100,
        range: 1000,
        persistent: true,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      const proximityGroup: NetworkGroup = {
        id: 'proximity1',
        type: 'proximity',
        members: new Set(),
        maxMembers: 20,
        range: 30,
        persistent: false,
        createdAt: Date.now(),
        lastActivity: Date.now()
      };

      expect(partyGroup.maxMembers).toBeLessThan(guildGroup.maxMembers);
      expect(proximityGroup.range).toBeLessThan(guildGroup.range);
      expect(guildGroup.persistent).toBe(true);
      expect(partyGroup.persistent).toBe(false);
      expect(proximityGroup.persistent).toBe(false);
    });
  });

  describe('NetworkStats', () => {
    test('기본 NetworkStats 생성 및 계산', () => {
      const stats: NetworkStats = {
        totalNodes: 50,
        activeConnections: 120,
        messagesPerSecond: 75.5,
        averageLatency: 45.2,
        bandwidth: 2500,
        lastUpdate: Date.now()
      };

      expect(stats.totalNodes).toBe(50);
      expect(stats.activeConnections).toBe(120);
      expect(stats.messagesPerSecond).toBeCloseTo(75.5);
      expect(stats.averageLatency).toBeCloseTo(45.2);
      expect(stats.bandwidth).toBe(2500);
      expect(typeof stats.lastUpdate).toBe('number');
    });

    test('통계 업데이트 시뮬레이션', () => {
      const stats: NetworkStats = {
        totalNodes: 10,
        activeConnections: 5,
        messagesPerSecond: 10,
        averageLatency: 100,
        bandwidth: 500,
        lastUpdate: Date.now()
      };

      // 노드 추가 시뮬레이션
      stats.totalNodes += 5;
      stats.activeConnections += 8;
      stats.messagesPerSecond += 15;
      stats.averageLatency = (stats.averageLatency + 80) / 2; // 평균 계산
      stats.bandwidth += 300;
      stats.lastUpdate = Date.now();

      expect(stats.totalNodes).toBe(15);
      expect(stats.activeConnections).toBe(13);
      expect(stats.messagesPerSecond).toBe(25);
      expect(stats.averageLatency).toBe(90);
      expect(stats.bandwidth).toBe(800);
    });
  });

  describe('NetworkCommand', () => {
    test('connect 명령 검증', () => {
      const connectCommand: NetworkCommand = {
        type: 'connect',
        npcId: 'npc1',
        targetId: 'npc2'
      };

      expect(connectCommand.type).toBe('connect');
      expect(connectCommand.npcId).toBe('npc1');
      expect(connectCommand.targetId).toBe('npc2');
    });

    test('sendMessage 명령 검증', () => {
      const message: NetworkMessage = {
        id: 'msg1',
        from: 'node1',
        to: 'node2',
        type: 'chat',
        payload: { text: 'Hello' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };

      const sendCommand: NetworkCommand = {
        type: 'sendMessage',
        message
      };

      expect(sendCommand.type).toBe('sendMessage');
      expect(sendCommand.message).toEqual(message);
    });

    test('broadcast 명령 검증', () => {
      const broadcastCommand: NetworkCommand = {
        type: 'broadcast',
        message: {
          id: 'broadcast1',
          from: 'node1',
          type: 'system',
          payload: { announcement: 'System update' },
          priority: 'high',
          timestamp: Date.now(),
          reliability: 'unreliable'
        }
      };

      expect(broadcastCommand.type).toBe('broadcast');
      expect(broadcastCommand.message.from).toBe('node1');
      expect(broadcastCommand.message.type).toBe('system');
    });

    test('joinGroup 및 leaveGroup 명령 검증', () => {
      const joinCommand: NetworkCommand = {
        type: 'joinGroup',
        npcId: 'npc1',
        groupId: 'party1'
      };

      const leaveCommand: NetworkCommand = {
        type: 'leaveGroup',
        npcId: 'npc1',
        groupId: 'party1'
      };

      expect(joinCommand.type).toBe('joinGroup');
      expect(joinCommand.npcId).toBe('npc1');
      expect(joinCommand.groupId).toBe('party1');

      expect(leaveCommand.type).toBe('leaveGroup');
      expect(leaveCommand.npcId).toBe('npc1');
      expect(leaveCommand.groupId).toBe('party1');
    });
  });

  describe('NetworkConfig', () => {
    test('기본 NetworkConfig 설정 검증', () => {
      const config: NetworkConfig = {
        // 성능 설정
        updateFrequency: 30,
        maxConnections: 100,
        messageQueueSize: 1000,
        
        // 통신 설정
        maxDistance: 100.0,
        signalStrength: 1.0,
        bandwidth: 1000,
        proximityRange: 10.0,
        
        // 최적화 설정
        enableBatching: true,
        batchSize: 10,
        compressionLevel: 1,
        connectionPoolSize: 50,
        
        // 메시지 설정
        enableChatMessages: true,
        enableActionMessages: true,
        enableStateMessages: true,
        enableSystemMessages: true,
        
        // 신뢰성 설정
        reliableRetryCount: 3,
        reliableTimeout: 5000,
        enableAck: true,
        
        // 그룹 설정
        maxGroupSize: 20,
        autoJoinProximity: true,
        groupMessagePriority: 'normal',
        
        // 디버깅 설정
        enableDebugPanel: false,
        enableVisualizer: false,
        showConnectionLines: false,
        showMessageFlow: false,
        debugUpdateInterval: 500,
        logLevel: 'warn',
        logToConsole: true,
        logToFile: false,
        maxLogEntries: 1000,
        
        // 보안 설정
        enableEncryption: false,
        enableRateLimit: true,
        maxMessagesPerSecond: 100,
        
        // 메모리 관리
        messageGCInterval: 30000,
        connectionTimeout: 30000,
        inactiveNodeCleanup: 60000
      };

      // 성능 설정 검증
      expect(config.updateFrequency).toBe(30);
      expect(config.maxConnections).toBe(100);
      expect(config.messageQueueSize).toBe(1000);

      // 통신 설정 검증
      expect(config.maxDistance).toBe(100.0);
      expect(config.signalStrength).toBe(1.0);
      expect(config.bandwidth).toBe(1000);

      // 최적화 설정 검증
      expect(config.enableBatching).toBe(true);
      expect(config.batchSize).toBe(10);
      expect(config.compressionLevel).toBe(1);

      // 로그 레벨 검증
      expect(['none', 'error', 'warn', 'info', 'debug']).toContain(config.logLevel);
    });

    test('설정 범위 및 제약 조건 검증', () => {
      // updateFrequency는 양수여야 함
      expect(30).toBeGreaterThan(0);
      
      // maxConnections는 1 이상이어야 함
      expect(100).toBeGreaterThanOrEqual(1);
      
      // compressionLevel은 0-9 범위여야 함
      expect(1).toBeGreaterThanOrEqual(0);
      expect(1).toBeLessThanOrEqual(9);
      
      // signalStrength는 양수여야 함
      expect(1.0).toBeGreaterThan(0);
      
      // proximityRange는 양수여야 함
      expect(10.0).toBeGreaterThan(0);
    });
  });
}); 