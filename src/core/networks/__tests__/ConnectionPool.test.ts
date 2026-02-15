import { ConnectionPool } from '../core/ConnectionPool';

describe('ConnectionPool', () => {
  let pool: ConnectionPool;

  beforeEach(() => {
    pool = new ConnectionPool(5, { bandwidth: 500, timeout: 1000, retries: 2, encryption: false });
  });

  afterEach(() => {
    pool.clear();
  });

  describe('getConnection', () => {
    test('새 연결을 생성하고 활성 목록에 추가', () => {
      const conn = pool.getConnection('a', 'b');
      expect(conn.nodeA).toBe('a');
      expect(conn.nodeB).toBe('b');
      expect(conn.status).toBe('establishing');

      const stats = pool.getPoolStats();
      expect(stats.active).toBe(1);
    });

    test('풀에서 재사용할 때 strength/latency가 초기화된다', () => {
      const conn = pool.getConnection('a', 'b');
      // strength/latency를 인위적으로 변경
      pool.updateConnectionMetrics(conn.id, { strength: 0.1, latency: 999 });
      pool.releaseConnection(conn.id);

      // 재사용
      const reused = pool.getConnection('c', 'd');
      expect(reused.id).toBe(conn.id); // 같은 ID 재사용
      expect(reused.nodeA).toBe('c');
      expect(reused.nodeB).toBe('d');
      expect(reused.strength).toBe(1.0);
      expect(reused.latency).toBe(0);
      expect(reused.bandwidth).toBe(500); // defaultOptions.bandwidth
    });

    test('options.bandwidth가 재사용 커넥션에 반영된다', () => {
      const conn = pool.getConnection('a', 'b');
      pool.releaseConnection(conn.id);

      const reused = pool.getConnection('c', 'd', { bandwidth: 9999 });
      expect(reused.bandwidth).toBe(9999);
    });
  });

  describe('releaseConnection', () => {
    test('활성에서 제거 후 풀로 반환', () => {
      const conn = pool.getConnection('a', 'b');
      expect(pool.releaseConnection(conn.id)).toBe(true);

      const stats = pool.getPoolStats();
      expect(stats.active).toBe(0);
      expect(stats.available).toBe(1);
    });

    test('maxPoolSize 초과 시 풀에 넣지 않는다', () => {
      // maxPoolSize = 5
      const conns = Array.from({ length: 6 }, (_, i) => pool.getConnection(`a${i}`, `b${i}`));
      conns.forEach(c => pool.releaseConnection(c.id));

      const stats = pool.getPoolStats();
      expect(stats.available).toBeLessThanOrEqual(5);
    });

    test('존재하지 않는 ID로 release하면 false', () => {
      expect(pool.releaseConnection('nonexistent')).toBe(false);
    });
  });

  describe('findActiveConnection', () => {
    test('양방향으로 검색 가능', () => {
      const conn = pool.getConnection('x', 'y');
      expect(pool.findActiveConnection('x', 'y')).toBe(conn);
      expect(pool.findActiveConnection('y', 'x')).toBe(conn);
    });

    test('없으면 null', () => {
      expect(pool.findActiveConnection('x', 'y')).toBeNull();
    });
  });

  describe('updateConnectionStatus', () => {
    test('상태 업데이트', () => {
      const conn = pool.getConnection('a', 'b');
      expect(pool.updateConnectionStatus(conn.id, 'active')).toBe(true);
      expect(pool.getActiveConnection(conn.id)!.status).toBe('active');
    });

    test('존재하지 않으면 false', () => {
      expect(pool.updateConnectionStatus('ghost', 'active')).toBe(false);
    });
  });

  describe('cleanupInactiveConnections', () => {
    test('오래된 연결 정리', () => {
      const conn = pool.getConnection('a', 'b');
      // lastActivity를 과거로 조작
      const active = pool.getActiveConnection(conn.id)!;
      active.lastActivity = Date.now() - 999999;

      const cleaned = pool.cleanupInactiveConnections(1000);
      expect(cleaned).toBe(1);
      expect(pool.getPoolStats().active).toBe(0);
    });
  });

  describe('disconnectNode', () => {
    test('특정 노드의 모든 연결 해제', () => {
      pool.getConnection('a', 'b');
      pool.getConnection('a', 'c');
      pool.getConnection('b', 'c');

      const count = pool.disconnectNode('a');
      expect(count).toBe(2);
      expect(pool.getPoolStats().active).toBe(1); // b-c만 남음
    });
  });

  describe('updatePoolSettings', () => {
    test('풀 크기가 줄면 초과 연결이 제거된다', () => {
      // 풀에 5개 넣기
      const conns = Array.from({ length: 5 }, (_, i) => pool.getConnection(`a${i}`, `b${i}`));
      conns.forEach(c => pool.releaseConnection(c.id));
      expect(pool.getPoolStats().available).toBe(5);

      pool.updatePoolSettings(2);
      expect(pool.getPoolStats().available).toBe(2);
    });
  });
});
