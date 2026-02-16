import { NetworkBridge } from '../NetworkBridge';
import { NetworkCommand, NetworkConfig } from '../../types';
import * as THREE from 'three';

// NetworkSystem 모킹
jest.mock('../../core/NetworkSystem', () => {
  return {
    NetworkSystem: jest.fn().mockImplementation((config?: NetworkConfig) => ({
      updateConfig: jest.fn(),
      start: jest.fn(),
      executeCommand: jest.fn(),
      createSnapshot: jest.fn().mockReturnValue({
        nodeCount: 0,
        connectionCount: 0,
        activeGroups: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        lastUpdate: Date.now(),
      }),
      getDebugInfo: jest.fn().mockReturnValue({
        networkStats: {
          nodeCount: 0,
          connectionCount: 0,
          messagesPerSecond: 0,
          averageLatency: 0,
          bandwidth: 0,
          lastUpdate: Date.now(),
        },
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
    bridge.ensureMainEngine();
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
        npcId: 'npc-1',
        position: new THREE.Vector3(10, 0, 5),
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.executeCommand).toHaveBeenCalledWith(command);
    });

    test('NPC 연결 명령', () => {
      const command: NetworkCommand = {
        type: 'connect',
        npcId: 'npc-1',
        targetId: 'npc-2',
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.executeCommand).toHaveBeenCalledWith(command);
    });

    test('메시지 전송 명령', () => {
      const command: NetworkCommand = {
        type: 'sendMessage',
        message: {
          id: 'msg-1',
          from: 'npc-1',
          to: 'npc-2',
          type: 'chat',
          payload: { text: 'Hello!' },
          priority: 'normal',
          timestamp: Date.now(),
          reliability: 'unreliable',
        },
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.executeCommand).toHaveBeenCalledWith(command);
    });

    test('그룹 생성 명령', () => {
      const now = Date.now();
      const command: NetworkCommand = {
        type: 'createGroup',
        group: {
          type: 'party',
          members: new Set<string>(),
          maxMembers: 10,
          range: 1000,
          persistent: false,
          createdAt: now,
          lastActivity: now,
        },
      };

      bridge.execute('main', command);
      
      const entity = bridge.getEngine('main');
      expect(entity?.system.executeCommand).toHaveBeenCalledWith(command);
    });
  });

  describe('스냅샷 생성', () => {
    test('시스템 스냅샷 생성', () => {
      const snapshot = bridge.snapshot('main');
      
      expect(snapshot).toBeDefined();
      expect(typeof snapshot?.nodeCount).toBe('number');
      expect(typeof snapshot?.connectionCount).toBe('number');
      expect(typeof snapshot?.activeGroups).toBe('number');
      expect(typeof snapshot?.messagesPerSecond).toBe('number');
      expect(typeof snapshot?.averageLatency).toBe('number');
    });

    test('존재하지 않는 엔진 스냅샷', () => {
      const snapshot = bridge.snapshot('nonexistent');
      expect(snapshot).toBeNull();
    });
  });

  describe('시스템 업데이트', () => {
    test('시스템 업데이트 호출', () => {
      const deltaTime = 0.016; // 60fps
      
      expect(() => bridge.updateSystem('main', deltaTime)).not.toThrow();
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
      expect(typeof stats?.nodeCount).toBe('number');
      expect(typeof stats?.connectionCount).toBe('number');
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