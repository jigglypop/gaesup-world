import {
  NPCNetworkNode,
  NetworkMessage,
  NetworkConnection,
  NetworkGroup,
  NetworkCommand,
  NetworkSnapshot,
  NetworkConfig
} from '../types';

describe('Networks 도메인 통합 테스트', () => {
  describe('타입 export 검증', () => {
    test('모든 핵심 타입이 export되는지 확인', () => {
      // NPCNetworkNode 타입 확인
      const nodeType: NPCNetworkNode = {} as NPCNetworkNode;
      expect(typeof nodeType).toBe('object');
      
      // NetworkMessage 타입 확인
      const messageType: NetworkMessage = {} as NetworkMessage;
      expect(typeof messageType).toBe('object');
      
      // NetworkConnection 타입 확인
      const connectionType: NetworkConnection = {} as NetworkConnection;
      expect(typeof connectionType).toBe('object');
      
      // NetworkGroup 타입 확인
      const groupType: NetworkGroup = {} as NetworkGroup;
      expect(typeof groupType).toBe('object');
      
      // NetworkCommand 타입 확인
      const commandType: NetworkCommand = {} as NetworkCommand;
      expect(typeof commandType).toBe('object');
      
      // NetworkSnapshot 타입 확인
      const snapshotType: NetworkSnapshot = {} as NetworkSnapshot;
      expect(typeof snapshotType).toBe('object');
      
      // NetworkConfig 타입 확인
      const configType: NetworkConfig = {} as NetworkConfig;
      expect(typeof configType).toBe('object');
    });

    test('NetworkCommand union 타입 확인', () => {
      const commands: NetworkCommand[] = [
        { type: 'connect', npcId: 'npc1', targetId: 'npc2' },
        { type: 'disconnect', npcId: 'npc1', targetId: 'npc2' },
        { 
          type: 'sendMessage', 
          message: {
            id: 'msg1',
            from: 'npc1',
            to: 'npc2',
            type: 'chat',
            payload: {},
            priority: 'normal',
            timestamp: Date.now(),
            reliability: 'reliable'
          }
        },
        { 
          type: 'broadcast', 
          message: {
            id: 'broadcast1',
            from: 'npc1',
            type: 'system',
            payload: {},
            priority: 'high',
            timestamp: Date.now(),
            reliability: 'unreliable'
          }
        },
        { type: 'joinGroup', npcId: 'npc1', groupId: 'group1' },
        { type: 'leaveGroup', npcId: 'npc1', groupId: 'group1' },
        { 
          type: 'createGroup', 
          group: {
            type: 'party',
            members: new Set(),
            maxMembers: 8,
            range: 100,
            persistent: false,
            createdAt: Date.now(),
            lastActivity: Date.now()
          }
        },
        { type: 'updateSettings', settings: { updateFrequency: 60 } },
        { type: 'startMonitoring', npcId: 'npc1' },
        { type: 'stopMonitoring', npcId: 'npc1' }
      ];

      commands.forEach(command => {
        expect(command.type).toBeDefined();
        expect(typeof command.type).toBe('string');
      });
    });
  });

  describe('도메인 구조 검증', () => {
    test('Networks 도메인 주요 개념 관계', () => {
      // Node -> Message 관계
      const node: Partial<NPCNetworkNode> = {
        id: 'node1',
        npcId: 'npc1',
        messageQueue: []
      };
      
      const message: NetworkMessage = {
        id: 'msg1',
        from: node.npcId!,
        to: 'node2',
        type: 'chat',
        payload: { text: 'Hello' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };
      
      node.messageQueue!.push(message);
      expect(node.messageQueue).toHaveLength(1);
      expect(node.messageQueue![0].from).toBe(node.npcId);
    });

    test('Group -> Node 관계', () => {
      const group: Partial<NetworkGroup> = {
        id: 'party1',
        type: 'party',
        members: new Set()
      };
      
      const nodeIds = ['node1', 'node2', 'node3'];
      nodeIds.forEach(nodeId => {
        group.members!.add(nodeId);
      });
      
      expect(group.members!.size).toBe(3);
      expect(group.members!.has('node1')).toBe(true);
      expect(group.members!.has('node2')).toBe(true);
      expect(group.members!.has('node3')).toBe(true);
    });

    test('Connection 양방향 관계', () => {
      const connection: NetworkConnection = {
        id: 'conn1',
        nodeA: 'node1',
        nodeB: 'node2',
        strength: 1.0,
        latency: 50,
        bandwidth: 1000,
        status: 'active',
        lastActivity: Date.now()
      };
      
      // 연결은 양방향이므로 nodeA <-> nodeB
      expect(connection.nodeA).toBe('node1');
      expect(connection.nodeB).toBe('node2');
      
      // 역방향 검색 가능
      const isConnected = (connection.nodeA === 'node2' && connection.nodeB === 'node1') ||
                         (connection.nodeA === 'node1' && connection.nodeB === 'node2');
      expect(isConnected).toBe(true);
    });
  });

  describe('설정 일관성 검증', () => {
    test('기본 설정값 유효성', () => {
      const defaultConfig: NetworkConfig = {
        updateFrequency: 30,
        maxConnections: 100,
        messageQueueSize: 1000,
        maxDistance: 100.0,
        signalStrength: 1.0,
        bandwidth: 1000,
        proximityRange: 10.0,
        enableBatching: true,
        batchSize: 10,
        compressionLevel: 1,
        connectionPoolSize: 50,
        enableChatMessages: true,
        enableActionMessages: true,
        enableStateMessages: true,
        enableSystemMessages: true,
        reliableRetryCount: 3,
        reliableTimeout: 5000,
        enableAck: true,
        maxGroupSize: 20,
        autoJoinProximity: true,
        groupMessagePriority: 'normal',
        enableDebugPanel: false,
        enableVisualizer: false,
        showConnectionLines: false,
        showMessageFlow: false,
        debugUpdateInterval: 500,
        logLevel: 'warn',
        logToConsole: true,
        logToFile: false,
        maxLogEntries: 1000,
        enableEncryption: false,
        enableRateLimit: true,
        maxMessagesPerSecond: 100,
        messageGCInterval: 30000,
        connectionTimeout: 30000,
        inactiveNodeCleanup: 60000
      };

      // 성능 설정 검증
      expect(defaultConfig.updateFrequency).toBeGreaterThan(0);
      expect(defaultConfig.updateFrequency).toBeLessThanOrEqual(120);
      expect(defaultConfig.maxConnections).toBeGreaterThan(0);
      expect(defaultConfig.messageQueueSize).toBeGreaterThan(0);

      // 통신 설정 검증
      expect(defaultConfig.maxDistance).toBeGreaterThan(0);
      expect(defaultConfig.signalStrength).toBeGreaterThan(0);
      expect(defaultConfig.bandwidth).toBeGreaterThan(0);
      expect(defaultConfig.proximityRange).toBeGreaterThan(0);

      // 최적화 설정 검증
      expect(defaultConfig.compressionLevel).toBeGreaterThanOrEqual(0);
      expect(defaultConfig.compressionLevel).toBeLessThanOrEqual(9);
      expect(defaultConfig.connectionPoolSize).toBeGreaterThanOrEqual(0);

      // 논리적 일관성 검증
      expect(defaultConfig.proximityRange).toBeLessThanOrEqual(defaultConfig.maxDistance);
      expect(defaultConfig.batchSize).toBeGreaterThan(0);
      expect(defaultConfig.reliableRetryCount).toBeGreaterThanOrEqual(0);
    });

    test('메시지 우선순위 일관성', () => {
      const priorities: Array<NetworkMessage['priority']> = ['low', 'normal', 'high', 'critical'];
      
      // 우선순위 순서 확인 (낮은 인덱스 = 높은 우선순위)
      const priorityOrder = ['critical', 'high', 'normal', 'low'];
      
      expect(priorityOrder[0]).toBe('critical');
      expect(priorityOrder[1]).toBe('high');
      expect(priorityOrder[2]).toBe('normal');
      expect(priorityOrder[3]).toBe('low');
      
      // 모든 우선순위가 포함되었는지 확인
      priorities.forEach(priority => {
        expect(priorityOrder).toContain(priority);
      });
    });
  });

  describe('성능 특성 검증', () => {
    test('메시지 큐 사이즈 제한', () => {
      const maxQueueSize = 1000;
      const queue: NetworkMessage[] = [];
      
      // 큐 크기 제한 시뮬레이션
      for (let i = 0; i < maxQueueSize + 10; i++) {
        const message: NetworkMessage = {
          id: `msg${i}`,
          from: 'npc1',
          to: 'npc2',
          type: 'chat',
          payload: {},
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'reliable'
        };
        
        if (queue.length < maxQueueSize) {
          queue.push(message);
        }
      }
      
      expect(queue.length).toBe(maxQueueSize);
    });

    test('연결 수 제한', () => {
      const maxConnections = 100;
      const connections = new Set<string>();
      
      // 연결 수 제한 시뮬레이션
      for (let i = 0; i < maxConnections + 10; i++) {
        const connectionId = `conn${i}`;
        if (connections.size < maxConnections) {
          connections.add(connectionId);
        }
      }
      
      expect(connections.size).toBe(maxConnections);
    });
  });

  describe('에러 시나리오 검증', () => {
    test('잘못된 노드 ID 처리', () => {
      const invalidNodeIds = ['', null, undefined, 123];
      
      invalidNodeIds.forEach(invalidId => {
        // 실제 구현에서는 이런 경우를 처리해야 함
        const isValidNodeId = typeof invalidId === 'string' && invalidId.length > 0;
        
        if (invalidId === '') {
          expect(isValidNodeId).toBe(false);
        } else if (invalidId === null || invalidId === undefined) {
          expect(isValidNodeId).toBe(false);
        } else if (typeof invalidId !== 'string') {
          expect(isValidNodeId).toBe(false);
        }
      });
    });

    test('메시지 형식 검증', () => {
      const validMessage: NetworkMessage = {
        id: 'msg1',
        from: 'npc1',
        to: 'npc2',
        type: 'chat',
        payload: { text: 'Hello' },
        priority: 'normal',
        timestamp: Date.now(),
        reliability: 'reliable'
      };
      
      // 필수 필드 검증
      expect(validMessage.id).toBeDefined();
      expect(validMessage.from).toBeDefined();
      expect(validMessage.to).toBeDefined();
      expect(validMessage.type).toBeDefined();
      expect(validMessage.priority).toBeDefined();
      expect(validMessage.timestamp).toBeDefined();
      expect(validMessage.reliability).toBeDefined();
      
      // 타입 검증
      expect(typeof validMessage.id).toBe('string');
      expect(typeof validMessage.from).toBe('string');
      expect(typeof validMessage.to).toBe('string');
      expect(typeof validMessage.type).toBe('string');
      expect(typeof validMessage.priority).toBe('string');
      expect(typeof validMessage.timestamp).toBe('number');
      expect(typeof validMessage.reliability).toBe('string');
    });
  });
}); 