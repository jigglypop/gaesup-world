import { NetworkBridge } from '../NetworkBridge';
import { NetworkCommand, NetworkConfig } from '../../types';

// NetworkSystem 모킹
jest.mock('../../core/NetworkSystem', () => {
  return {
    NetworkSystem: jest.fn().mockImplementation((config?: NetworkConfig) => ({
      registerNPC: jest.fn(),
      unregisterNPC: jest.fn(),
      updateNPCPosition: jest.fn(),
      connectNPCs: jest.fn(),
      disconnectNPCs: jest.fn(),
      sendMessage: jest.fn(),
      broadcastMessage: jest.fn(),
      createGroup: jest.fn(),
      joinGroup: jest.fn(),
      leaveGroup: jest.fn(),
      updateConfig: jest.fn(),
      start: jest.fn(),
      stop: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
      update: jest.fn(),
      createSnapshot: jest.fn().mockReturnValue({
        nodes: new Map(),
        connections: new Map(),
        groups: new Map(),
        messages: [],
        stats: {
          totalNodes: 0,
          totalConnections: 0,
          totalMessages: 0,
          averageLatency: 0,
          messagesPerSecond: 0
        },
        performance: {
          updateTime: 0,
          messageProcessingTime: 0,
          connectionProcessingTime: 0
        },
        timestamp: Date.now()
      }),
      getNetworkStats: jest.fn().mockReturnValue({
        totalNodes: 0,
        totalConnections: 0,
        totalMessages: 0
      }),
      getState: jest.fn().mockReturnValue({ isRunning: false }),
      dispose: jest.fn()
    }))
  };
});

describe('NetworkBridge', () => {
  let bridge: NetworkBridge;

  beforeEach(() => {
    bridge = new NetworkBridge();
  });

  afterEach(() => {
    bridge.dispose();
  });

  describe('브릿지 초기화', () => {
    test('기본 시스템 등록', () => {
      expect(bridge.getEngine('main')).toBeDefined();
    });

    test('브릿지 메타데이터 확인', () => {
      expect(bridge.constructor.name).toBe('NetworkBridge');
    });
  });

  describe('엔진 관리', () => {
    test('엔진 빌드', () => {
      const config: NetworkConfig = {
        updateFrequency: 60,
        maxConnections: 200,
        messageQueueSize: 2000,
        maxDistance: 150.0,
        signalStrength: 2.0,
        bandwidth: 2000,
        proximityRange: 25.0,
        enableBatching: true,
        batchSize: 20,
        compressionLevel: 3,
        connectionPoolSize: 100,
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

      bridge.register('test', config);
      const entity = bridge.getEngine('test');
      expect(entity).toBeDefined();
      expect(entity?.system).toBeDefined();
      expect(entity?.dispose).toBeInstanceOf(Function);
    });

    test('엔진 등록 해제', () => {
      bridge.register('temp');
      expect(bridge.getEngine('temp')).toBeDefined();
      
      bridge.unregister('temp');
      expect(bridge.getEngine('temp')).toBeUndefined();
    });
  });

  describe('명령 실행', () => {
    test('NPC 등록 명령', () => {
      const command: NetworkCommand = {
        type: 'registerNPC',
        data: {
          npcId: 'npc-1',
          position: { x: 10, y: 0, z: 5 },
          metadata: { name: 'TestNPC' }
        }
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.registerNPC).toHaveBeenCalledWith(
        'npc-1',
        { x: 10, y: 0, z: 5 },
        { name: 'TestNPC' }
      );
    });

    test('NPC 연결 명령', () => {
      const command: NetworkCommand = {
        type: 'connectNPCs',
        data: {
          fromId: 'npc-1',
          toId: 'npc-2',
          options: { reliable: true }
        }
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.connectNPCs).toHaveBeenCalledWith(
        'npc-1',
        'npc-2',
        { reliable: true }
      );
    });

    test('메시지 전송 명령', () => {
      const command: NetworkCommand = {
        type: 'sendMessage',
        data: {
          fromId: 'npc-1',
          toId: 'npc-2',
          message: {
            id: 'msg-1',
            type: 'chat',
            content: 'Hello!',
            timestamp: Date.now(),
            senderId: 'npc-1',
            receiverId: 'npc-2'
          }
        }
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.sendMessage).toHaveBeenCalledWith(
        'npc-1',
        'npc-2',
        command.data.message
      );
    });

    test('그룹 생성 명령', () => {
      const command: NetworkCommand = {
        type: 'createGroup',
        data: {
          groupId: 'group-1',
          npcIds: ['npc-1', 'npc-2'],
          options: { maxSize: 10 }
        }
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.createGroup).toHaveBeenCalledWith(
        'group-1',
        ['npc-1', 'npc-2'],
        { maxSize: 10 }
      );
    });

    test('시스템 제어 명령', () => {
      const startCommand: NetworkCommand = { type: 'start', data: {} };
      const stopCommand: NetworkCommand = { type: 'stop', data: {} };
      const pauseCommand: NetworkCommand = { type: 'pause', data: {} };
      const resumeCommand: NetworkCommand = { type: 'resume', data: {} };

      const entity = bridge.getEngine('main');

      bridge.execute('main', startCommand);
      expect(entity?.system.start).toHaveBeenCalled();

      bridge.execute('main', stopCommand);
      expect(entity?.system.stop).toHaveBeenCalled();

      bridge.execute('main', pauseCommand);
      expect(entity?.system.pause).toHaveBeenCalled();

      bridge.execute('main', resumeCommand);
      expect(entity?.system.resume).toHaveBeenCalled();
    });
  });

  describe('스냅샷 생성', () => {
    test('시스템 스냅샷 생성', () => {
      const snapshot = bridge.snapshot('main');
      
      expect(snapshot).toBeDefined();
      expect(snapshot?.nodes).toBeInstanceOf(Map);
      expect(snapshot?.connections).toBeInstanceOf(Map);
      expect(snapshot?.groups).toBeInstanceOf(Map);
      expect(snapshot?.messages).toBeInstanceOf(Array);
      expect(snapshot?.stats).toBeDefined();
      expect(snapshot?.performance).toBeDefined();
      expect(typeof snapshot?.timestamp).toBe('number');
    });

    test('존재하지 않는 엔진 스냅샷', () => {
      const snapshot = bridge.snapshot('nonexistent');
      expect(snapshot).toBeNull();
    });
  });

  describe('시스템 업데이트', () => {
    test('시스템 업데이트 호출', () => {
      const deltaTime = 0.016; // 60fps
      
      bridge.updateSystem('main', deltaTime);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.update).toHaveBeenCalledWith(deltaTime);
    });

    test('존재하지 않는 시스템 업데이트', () => {
      // 에러 없이 무시되어야 함
      expect(() => {
        bridge.updateSystem('nonexistent', 0.016);
      }).not.toThrow();
    });
  });

  describe('유틸리티 메서드', () => {
    test('네트워크 통계 조회', () => {
      const stats = bridge.getNetworkStats('main');
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalNodes).toBe('number');
      expect(typeof stats.totalConnections).toBe('number');
      expect(typeof stats.totalMessages).toBe('number');
    });

    test('시스템 상태 조회', () => {
      const state = bridge.getSystemState('main');
      
      expect(state).toBeDefined();
      expect(typeof state.isRunning).toBe('boolean');
    });

    test('존재하지 않는 시스템 조회', () => {
      const stats = bridge.getNetworkStats('nonexistent');
      const state = bridge.getSystemState('nonexistent');
      
      expect(stats).toBeNull();
      expect(state).toBeNull();
    });
  });

  describe('에러 처리', () => {
    test('잘못된 명령 타입', () => {
      const invalidCommand = {
        type: 'invalidCommand',
        data: {}
      } as any;

      // 에러 없이 무시되어야 함
      expect(() => {
        bridge.execute('main', invalidCommand);
      }).not.toThrow();
    });

    test('엔진 생성 실패 처리', () => {
      // NetworkSystem 생성자에서 에러 발생하도록 모킹
      const NetworkSystemMock = require('../../core/NetworkSystem').NetworkSystem;
      NetworkSystemMock.mockImplementationOnce(() => {
        throw new Error('System creation failed');
      });

      // 에러 로그가 출력되고 null이 반환되어야 함
      console.error = jest.fn();
      
      bridge.register('error-test');
      const entity = bridge.getEngine('error-test');
      
      expect(console.error).toHaveBeenCalledWith(
        '[NetworkBridge] Failed to build engine:',
        expect.any(Error)
      );
      expect(entity).toBeUndefined();
    });
  });

  describe('리소스 정리', () => {
    test('브릿지 dispose', () => {
      // 추가 엔진 등록
      bridge.register('test1');
      bridge.register('test2');
      
      // dispose 전 엔진 확인
      expect(bridge.getEngine('main')).toBeDefined();
      expect(bridge.getEngine('test1')).toBeDefined();
      expect(bridge.getEngine('test2')).toBeDefined();
      
      bridge.dispose();
      
      // dispose 후 모든 엔진이 제거되었는지 확인
      expect(bridge.getEngine('main')).toBeUndefined();
      expect(bridge.getEngine('test1')).toBeUndefined();
      expect(bridge.getEngine('test2')).toBeUndefined();
    });
  });
}); 