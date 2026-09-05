import * as THREE from 'three';
import { NPCNetworkManager } from '../core/NPCNetworkManager';
import type { NetworkMessage } from '../types';

function makeMessage(overrides: Partial<NetworkMessage> = {}): NetworkMessage {
  return {
    id: `msg_${Date.now()}_${Math.random()}`,
    from: 'npc1',
    to: 'npc2',
    type: 'chat',
    payload: {},
    priority: 'normal',
    timestamp: Date.now(),
    reliability: 'reliable',
    ...overrides,
  };
}

describe('NPCNetworkManager', () => {
  let manager: NPCNetworkManager;

  beforeEach(() => {
    manager = new NPCNetworkManager(50, 100, 10);
  });

  afterEach(() => {
    manager.clear();
  });

  // ---- resolveNodeId (간접 검증) ----

  describe('resolveNodeId - sendMessage from 필드 정규화', () => {
    test('from이 npcId일 때 정상 전송', () => {
      manager.registerNode('alice', new THREE.Vector3(0, 0, 0));
      manager.registerNode('bob', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('alice', 'bob');

      const ok = manager.sendMessage(makeMessage({ from: 'alice', to: 'node_bob' }));
      expect(ok).toBe(true);

      const msgs = manager.getMessages('bob');
      expect(msgs.length).toBe(1);
    });

    test('from이 node_ 접두어 포함이어도 정상 전송', () => {
      manager.registerNode('alice', new THREE.Vector3(0, 0, 0));
      manager.registerNode('bob', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('alice', 'bob');

      const ok = manager.sendMessage(makeMessage({ from: 'node_alice', to: 'node_bob' }));
      expect(ok).toBe(true);
    });

    test('from이 node_node_ 접두어(이중)여도 올바르게 처리', () => {
      // npcId가 "node_abc"인 경우 nodeId = "node_node_abc"
      manager.registerNode('node_abc', new THREE.Vector3(0, 0, 0));
      manager.registerNode('target', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('node_abc', 'target');

      // from = "node_node_abc"는 이미 node_ prefix가 있으므로 그대로 사용
      const ok = manager.sendMessage(makeMessage({ from: 'node_node_abc', to: 'node_target' }));
      expect(ok).toBe(true);
    });

    test('존재하지 않는 from이면 false', () => {
      manager.registerNode('bob', new THREE.Vector3(0, 0, 0));
      const ok = manager.sendMessage(makeMessage({ from: 'ghost', to: 'node_bob' }));
      expect(ok).toBe(false);
    });
  });

  // ---- messageQueue 크기 제한 ----

  describe('messageQueue 크기 제한', () => {
    test('maxMessageQueueSize 초과 시 가장 오래된 메시지가 제거된다', () => {
      manager.registerNode('alice', new THREE.Vector3(0, 0, 0));
      manager.registerNode('bob', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('alice', 'bob');

      // maxMessageQueueSize = 10으로 생성됨
      for (let i = 0; i < 15; i++) {
        manager.sendMessage(makeMessage({
          id: `msg_${i}`,
          from: 'alice',
          to: 'node_bob',
        }));
      }

      const msgs = manager.getMessages('bob');
      expect(msgs.length).toBe(10);
      // 가장 오래된 5개(0~4)가 evict되고, 5~14가 남아야 함
      expect(msgs[0].id).toBe('msg_5');
      expect(msgs[9].id).toBe('msg_14');
    });

    test('broadcast도 큐 크기 제한을 지킨다', () => {
      manager.registerNode('alice', new THREE.Vector3(0, 0, 0));
      manager.registerNode('bob', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('alice', 'bob');

      for (let i = 0; i < 15; i++) {
        manager.sendMessage(makeMessage({
          id: `bc_${i}`,
          from: 'alice',
          to: 'broadcast',
        }));
      }

      const msgs = manager.getMessages('bob');
      expect(msgs.length).toBeLessThanOrEqual(10);
    });
  });

  // ---- 기본 기능 ----

  describe('registerNode / unregisterNode', () => {
    test('노드 등록 후 조회', () => {
      const node = manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      expect(node.npcId).toBe('npc1');
      expect(manager.getNode('npc1')).toBeTruthy();
    });

    test('중복 등록 시 에러', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      expect(() => manager.registerNode('npc1', new THREE.Vector3(0, 0, 0))).toThrow();
    });

    test('노드 제거', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      expect(manager.unregisterNode('npc1')).toBe(true);
      expect(manager.getNode('npc1')).toBeNull();
    });

    test('존재하지 않는 노드 제거 시 false', () => {
      expect(manager.unregisterNode('ghost')).toBe(false);
    });
  });

  describe('connectNodes / disconnectNodes', () => {
    test('거리 내 연결 성공', () => {
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(10, 0, 0));
      expect(manager.connectNodes('a', 'b')).toBe(true);
    });

    test('maxDistance 초과 시 연결 실패', () => {
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(200, 0, 0));
      expect(manager.connectNodes('a', 'b')).toBe(false);
    });

    test('연결 해제', () => {
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(10, 0, 0));
      manager.connectNodes('a', 'b');
      expect(manager.disconnectNodes('a', 'b')).toBe(true);

      const nodeA = manager.getNode('a')!;
      expect(nodeA.connections.has('node_b')).toBe(false);
    });
  });

  describe('proximity auto connections', () => {
    test('updateNodePosition는 근접 노드만 자동 연결한다', () => {
      manager = new NPCNetworkManager(50, 100, 10);
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(10, 0, 0)); // near
      manager.registerNode('c', new THREE.Vector3(500, 0, 0)); // far

      // Trigger proximity update for node a (position unchanged is fine)
      manager.updateNodePosition('a', new THREE.Vector3(0, 0, 0));

      const nodeA = manager.getNode('a')!;
      expect(nodeA.connections.has('node_b')).toBe(true);
      expect(nodeA.connections.has('node_c')).toBe(false);
    });

    test('멀어지면 자동 연결이 해제된다', () => {
      manager = new NPCNetworkManager(50, 100, 10);
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(10, 0, 0));

      manager.updateNodePosition('a', new THREE.Vector3(0, 0, 0));
      expect(manager.getNode('a')!.connections.has('node_b')).toBe(true);

      manager.updateNodePosition('b', new THREE.Vector3(999, 0, 0));
      // b moved far; update proximity for a too
      manager.updateNodePosition('a', new THREE.Vector3(0, 0, 0));
      expect(manager.getNode('a')!.connections.has('node_b')).toBe(false);
    });
  });

  describe('그룹', () => {
    test('그룹 생성 및 참여', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      const group = manager.createGroup('party', { maxMembers: 4 });
      expect(manager.joinGroup('npc1', group.id)).toBe(true);
      expect(manager.getGroup(group.id)!.members.has('node_npc1')).toBe(true);
    });

    test('그룹 최대 인원 초과 시 참여 실패', () => {
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(0, 0, 0));
      manager.registerNode('c', new THREE.Vector3(0, 0, 0));
      const group = manager.createGroup('party', { maxMembers: 2 });
      manager.joinGroup('a', group.id);
      manager.joinGroup('b', group.id);
      expect(manager.joinGroup('c', group.id)).toBe(false);
    });

    test('비영구 그룹은 모든 멤버 탈퇴 시 삭제', () => {
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      const group = manager.createGroup('party');
      manager.joinGroup('npc1', group.id);
      manager.leaveGroup('npc1', group.id);
      expect(manager.getGroup(group.id)).toBeNull();
    });
  });

  describe('이벤트', () => {
    test('addEventListener / removeEventListener', () => {
      const calls: string[] = [];
      const cb = () => { calls.push('called'); };
      manager.addEventListener('nodeConnected', cb);
      manager.registerNode('npc1', new THREE.Vector3(0, 0, 0));
      expect(calls.length).toBe(1);

      manager.removeEventListener('nodeConnected', cb);
      manager.registerNode('npc2', new THREE.Vector3(0, 0, 0));
      expect(calls.length).toBe(1);
    });
  });

  describe('getNetworkStats', () => {
    test('통계 반환', () => {
      manager.registerNode('a', new THREE.Vector3(0, 0, 0));
      manager.registerNode('b', new THREE.Vector3(1, 0, 0));
      manager.connectNodes('a', 'b');

      const stats = manager.getNetworkStats();
      expect(stats.nodeCount).toBe(2);
      expect(stats.connectionCount).toBe(1);
    });
  });
});
