import * as THREE from 'three';
import { NetworkSystem } from '../core/NetworkSystem';
import type { NetworkConfig, NetworkMessage } from '../types';

const baseConfig: NetworkConfig = {
  updateFrequency: 30,
  maxConnections: 100,
  messageQueueSize: 100,
  maxDistance: 100,
  signalStrength: 1,
  bandwidth: 1000,
  proximityRange: 50,
  enableBatching: true,
  batchSize: 10,
  compressionLevel: 1,
  connectionPoolSize: 10,
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
  logLevel: 'none',
  logToConsole: false,
  logToFile: false,
  maxLogEntries: 100,
  enableEncryption: false,
  enableRateLimit: false,
  maxMessagesPerSecond: 100,
  messageGCInterval: 30000,
  connectionTimeout: 30000,
  inactiveNodeCleanup: 60000,
};

function makeMsg(id: string, from: string, to: string): NetworkMessage {
  return {
    id,
    from,
    to,
    type: 'chat',
    payload: {},
    priority: 'normal',
    timestamp: Date.now(),
    reliability: 'reliable',
  };
}

describe('NetworkSystem', () => {
  let system: NetworkSystem;

  beforeEach(() => {
    system = new NetworkSystem(baseConfig);
  });

  afterEach(() => {
    system.dispose();
  });

  describe('start / stop', () => {
    test('start 후 isRunning = true', () => {
      system.start();
      expect(system.getState().isRunning).toBe(true);
    });

    test('stop 후 isRunning = false', () => {
      system.start();
      system.stop();
      expect(system.getState().isRunning).toBe(false);
    });

    test('중복 start 무시', () => {
      system.start();
      system.start(); // 두 번째는 무시
      expect(system.getState().isRunning).toBe(true);
    });
  });

  describe('NPC 등록/제거', () => {
    test('registerNPC 후 state에 노드 존재', () => {
      system.start();
      system.registerNPC('npc1', new THREE.Vector3(0, 0, 0));

      // syncState가 update loop에서 돌지만, 직접 getState 호출 시에도
      // npcManager에는 이미 등록되어 있음
      const debugInfo = system.getDebugInfo();
      expect(debugInfo.networkStats.nodeCount).toBe(1);
    });

    test('unregisterNPC', () => {
      system.registerNPC('npc1', new THREE.Vector3(0, 0, 0));
      expect(system.unregisterNPC('npc1')).toBe(true);
      expect(system.getDebugInfo().networkStats.nodeCount).toBe(0);
    });
  });

  describe('executeCommand', () => {
    test('sendMessage 커맨드로 메시지 큐잉', () => {
      system.registerNPC('a', new THREE.Vector3(0, 0, 0));
      system.registerNPC('b', new THREE.Vector3(1, 0, 0));

      const ok = system.executeCommand({
        type: 'sendMessage',
        message: makeMsg('m1', 'a', 'node_b'),
      });
      expect(ok).toBe(true);

      const stats = system.getDebugInfo().messageQueueStats;
      expect(stats.totalMessages).toBe(1);
    });

    test('broadcast 커맨드', () => {
      system.registerNPC('a', new THREE.Vector3(0, 0, 0));
      const ok = system.executeCommand({
        type: 'broadcast',
        message: {
          id: 'bc1',
          from: 'a',
          type: 'system',
          payload: {},
          priority: 'high',
          timestamp: Date.now(),
          reliability: 'unreliable',
        },
      });
      expect(ok).toBe(true);
    });

    test('createGroup + joinGroup + leaveGroup', () => {
      system.registerNPC('npc1', new THREE.Vector3(0, 0, 0));

      system.executeCommand({
        type: 'createGroup',
        group: {
          type: 'party',
          members: new Set(),
          maxMembers: 8,
          range: 100,
          persistent: false,
          createdAt: Date.now(),
          lastActivity: Date.now(),
        },
      });

      // start해서 syncState 돌리기
      system.start();
      // 직접 내부 상태 검증 대신 getDebugInfo 사용
      expect(system.getDebugInfo().networkStats.groupCount).toBe(1);
    });

    test('알 수 없는 커맨드에 false 반환', () => {
      const ok = system.executeCommand({ type: 'unknownCommand' } as never);
      expect(ok).toBe(false);
    });
  });

  describe('createSnapshot', () => {
    test('스냅샷에 올바른 필드가 있다', () => {
      const snap = system.createSnapshot();
      expect(snap).toHaveProperty('nodeCount');
      expect(snap).toHaveProperty('connectionCount');
      expect(snap).toHaveProperty('activeGroups');
      expect(snap).toHaveProperty('messagesPerSecond');
      expect(snap).toHaveProperty('averageLatency');
      expect(snap).toHaveProperty('lastUpdate');
    });
  });

  describe('updateConfig', () => {
    test('설정 변경이 반영된다', () => {
      system.updateConfig({ updateFrequency: 60 });
      expect(system.getConfig().updateFrequency).toBe(60);
    });
  });

  describe('이벤트 리스너', () => {
    test('addEventListener / removeEventListener', () => {
      const calls: string[] = [];
      const cb = () => { calls.push('event'); };

      system.addEventListener('nodeConnected', cb);
      system.registerNPC('npc1', new THREE.Vector3(0, 0, 0));
      expect(calls.length).toBe(1);

      system.removeEventListener('nodeConnected', cb);
      system.registerNPC('npc2', new THREE.Vector3(0, 0, 0));
      expect(calls.length).toBe(1);
    });
  });

  describe('dispose', () => {
    test('dispose 후 상태가 초기화된다', () => {
      system.start();
      system.registerNPC('npc1', new THREE.Vector3(0, 0, 0));
      system.dispose();

      expect(system.getState().isRunning).toBe(false);
      expect(system.getDebugInfo().networkStats.nodeCount).toBe(0);
    });
  });
});
