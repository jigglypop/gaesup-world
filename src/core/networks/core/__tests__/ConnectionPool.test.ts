import { NetworkConnection } from '../../types';
import { ConnectionOptions } from '../types';

// ConnectionPool 클래스 모의 구현
class ConnectionPool {
  private availableConnections: NetworkConnection[] = [];
  private activeConnections: Map<string, NetworkConnection> = new Map();
  private connectionIdCounter: number = 1;
  private maxPoolSize: number;
  private defaultOptions: ConnectionOptions;

  constructor(maxPoolSize: number = 50, defaultOptions?: Partial<ConnectionOptions>) {
    this.maxPoolSize = maxPoolSize;
    this.defaultOptions = {
      timeout: 30000,
      retries: 3,
      bandwidth: 1000,
      encryption: false,
      ...defaultOptions
    };
  }

  // 새 연결 생성
  private createConnection(nodeA: string, nodeB: string, options?: Partial<ConnectionOptions>): NetworkConnection {
    const finalOptions = { ...this.defaultOptions, ...options };
    
    return {
      id: `conn_${this.connectionIdCounter++}`,
      nodeA,
      nodeB,
      strength: 1.0,
      latency: Math.random() * 50 + 10, // 10-60ms
      bandwidth: finalOptions.bandwidth,
      status: 'establishing',
      lastActivity: Date.now()
    };
  }

  // 연결 가져오기 또는 생성
  getConnection(nodeA: string, nodeB: string, options?: Partial<ConnectionOptions>): NetworkConnection {
    // 사용 가능한 연결이 있으면 재사용
    const available = this.availableConnections.pop();
    if (available) {
      available.nodeA = nodeA;
      available.nodeB = nodeB;
      available.status = 'establishing';
      available.lastActivity = Date.now();
      
      if (options?.bandwidth) {
        available.bandwidth = options.bandwidth;
      }
      
      this.activeConnections.set(available.id, available);
      return available;
    }

    // 새 연결 생성
    const newConnection = this.createConnection(nodeA, nodeB, options);
    this.activeConnections.set(newConnection.id, newConnection);
    return newConnection;
  }

  // 연결 해제 및 풀로 반환
  releaseConnection(connectionId: string): boolean {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      return false;
    }

    // 활성 연결에서 제거
    this.activeConnections.delete(connectionId);

    // 연결 상태 리셋
    this.resetConnection(connection);

    // 풀 크기 제한 확인 후 반환
    if (this.availableConnections.length < this.maxPoolSize) {
      this.availableConnections.push(connection);
    }

    return true;
  }

  // 연결 상태 리셋
  private resetConnection(connection: NetworkConnection): void {
    connection.nodeA = '';
    connection.nodeB = '';
    connection.status = 'disconnected';
    connection.strength = 0;
    connection.latency = 0;
    connection.lastActivity = 0;
  }

  // 활성 연결 가져오기
  getActiveConnection(connectionId: string): NetworkConnection | null {
    return this.activeConnections.get(connectionId) || null;
  }

  // 두 노드 간 활성 연결 찾기
  findActiveConnection(nodeA: string, nodeB: string): NetworkConnection | null {
    for (const connection of this.activeConnections.values()) {
      if ((connection.nodeA === nodeA && connection.nodeB === nodeB) ||
          (connection.nodeA === nodeB && connection.nodeB === nodeA)) {
        return connection;
      }
    }
    return null;
  }

  // 연결 상태 업데이트
  updateConnectionStatus(connectionId: string, status: NetworkConnection['status']): boolean {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      return false;
    }

    connection.status = status;
    connection.lastActivity = Date.now();
    return true;
  }

  // 연결 성능 업데이트
  updateConnectionMetrics(connectionId: string, metrics: { latency?: number; bandwidth?: number; strength?: number }): boolean {
    const connection = this.activeConnections.get(connectionId);
    if (!connection) {
      return false;
    }

    if (metrics.latency !== undefined) {
      connection.latency = metrics.latency;
    }
    if (metrics.bandwidth !== undefined) {
      connection.bandwidth = metrics.bandwidth;
    }
    if (metrics.strength !== undefined) {
      connection.strength = metrics.strength;
    }

    connection.lastActivity = Date.now();
    return true;
  }

  // 오래된 연결 정리
  cleanupInactiveConnections(maxAge: number = 300000): number { // 5분
    const now = Date.now();
    let cleanedCount = 0;

    for (const [id, connection] of this.activeConnections.entries()) {
      if (now - connection.lastActivity > maxAge) {
        this.releaseConnection(id);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  // 풀 통계 정보
  getPoolStats(): {
    available: number;
    active: number;
    total: number;
    maxSize: number;
    utilizationRate: number;
  } {
    const available = this.availableConnections.length;
    const active = this.activeConnections.size;
    const total = available + active;
    const utilizationRate = total > 0 ? active / total : 0;

    return {
      available,
      active,
      total,
      maxSize: this.maxPoolSize,
      utilizationRate
    };
  }

  // 풀 비우기
  clear(): void {
    this.activeConnections.clear();
    this.availableConnections = [];
    this.connectionIdCounter = 1;
  }

  // 특정 노드의 모든 연결 해제
  disconnectNode(nodeId: string): number {
    let disconnectedCount = 0;
    const connectionsToRemove: string[] = [];

    for (const [id, connection] of this.activeConnections.entries()) {
      if (connection.nodeA === nodeId || connection.nodeB === nodeId) {
        connectionsToRemove.push(id);
      }
    }

    connectionsToRemove.forEach(id => {
      this.releaseConnection(id);
      disconnectedCount++;
    });

    return disconnectedCount;
  }
}

describe('ConnectionPool', () => {
  let connectionPool: ConnectionPool;
  
  beforeEach(() => {
    connectionPool = new ConnectionPool(10, {
      timeout: 5000,
      retries: 2,
      bandwidth: 500,
      encryption: false
    });
  });

  describe('기본 연결 관리', () => {
    test('새 연결 생성', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      
      expect(connection).toBeDefined();
      expect(connection.id).toMatch(/^conn_\d+$/);
      expect(connection.nodeA).toBe('node1');
      expect(connection.nodeB).toBe('node2');
      expect(connection.status).toBe('establishing');
      expect(connection.bandwidth).toBe(500); // 기본 설정
      expect(connection.lastActivity).toBeGreaterThan(0);
    });

    test('연결 옵션 커스터마이징', () => {
      const connection = connectionPool.getConnection('node1', 'node2', {
        bandwidth: 2000,
        timeout: 10000
      });
      
      expect(connection.bandwidth).toBe(2000);
      // timeout은 connection 객체에 직접 저장되지 않지만, 옵션이 적용되었는지 확인
    });

    test('연결 해제 및 풀 반환', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      const connectionId = connection.id;
      
      // 활성 연결 확인
      expect(connectionPool.getActiveConnection(connectionId)).toBe(connection);
      
      // 연결 해제
      const released = connectionPool.releaseConnection(connectionId);
      expect(released).toBe(true);
      
      // 활성 연결에서 제거되었는지 확인
      expect(connectionPool.getActiveConnection(connectionId)).toBeNull();
      
      // 풀 통계 확인
      const stats = connectionPool.getPoolStats();
      expect(stats.available).toBe(1);
      expect(stats.active).toBe(0);
    });

    test('존재하지 않는 연결 해제 시도', () => {
      const released = connectionPool.releaseConnection('nonexistent');
      expect(released).toBe(false);
    });
  });

  describe('연결 재사용', () => {
    test('풀에서 연결 재사용', () => {
      // 첫 번째 연결 생성 및 해제
      const connection1 = connectionPool.getConnection('nodeA', 'nodeB');
      const connectionId1 = connection1.id;
      connectionPool.releaseConnection(connectionId1);
      
      // 두 번째 연결 요청 - 재사용되어야 함
      const connection2 = connectionPool.getConnection('nodeC', 'nodeD');
      
      expect(connection2.id).toBe(connectionId1); // 같은 ID = 재사용됨
      expect(connection2.nodeA).toBe('nodeC'); // 새로운 노드로 설정됨
      expect(connection2.nodeB).toBe('nodeD');
      expect(connection2.status).toBe('establishing'); // 상태 리셋됨
    });

    test('풀 크기 제한', () => {
      const smallPool = new ConnectionPool(2);
      
      // 3개 연결 생성 및 해제
      const connections = [];
      for (let i = 1; i <= 3; i++) {
        const conn = smallPool.getConnection(`nodeA${i}`, `nodeB${i}`);
        connections.push(conn);
      }
      
      // 모든 연결 해제
      connections.forEach(conn => {
        smallPool.releaseConnection(conn.id);
      });
      
      // 풀 크기가 제한되어야 함
      const stats = smallPool.getPoolStats();
      expect(stats.available).toBe(2); // 최대 2개만 풀에 저장
    });
  });

  describe('연결 검색 및 관리', () => {
    test('활성 연결 찾기', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      
      const found = connectionPool.getActiveConnection(connection.id);
      expect(found).toBe(connection);
      
      const notFound = connectionPool.getActiveConnection('nonexistent');
      expect(notFound).toBeNull();
    });

    test('두 노드 간 활성 연결 찾기', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      
      // 정방향 검색
      const found1 = connectionPool.findActiveConnection('node1', 'node2');
      expect(found1).toBe(connection);
      
      // 역방향 검색 (무방향 연결)
      const found2 = connectionPool.findActiveConnection('node2', 'node1');
      expect(found2).toBe(connection);
      
      // 존재하지 않는 연결
      const notFound = connectionPool.findActiveConnection('node3', 'node4');
      expect(notFound).toBeNull();
    });

    test('연결 상태 업데이트', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      
      // 상태 업데이트
      const updated = connectionPool.updateConnectionStatus(connection.id, 'active');
      expect(updated).toBe(true);
      expect(connection.status).toBe('active');
      
      // 존재하지 않는 연결 업데이트 시도
      const notUpdated = connectionPool.updateConnectionStatus('nonexistent', 'active');
      expect(notUpdated).toBe(false);
    });

    test('연결 성능 메트릭 업데이트', (done) => {
      const connection = connectionPool.getConnection('node1', 'node2');
      const originalLastActivity = connection.lastActivity;
      
      // 작은 지연 후 성능 메트릭 업데이트
      setTimeout(() => {
        const updated = connectionPool.updateConnectionMetrics(connection.id, {
          latency: 25,
          bandwidth: 1500,
          strength: 0.8
        });
        
        expect(updated).toBe(true);
        expect(connection.latency).toBe(25);
        expect(connection.bandwidth).toBe(1500);
        expect(connection.strength).toBe(0.8);
        expect(connection.lastActivity).toBeGreaterThan(originalLastActivity);
        done();
      }, 10);
    });
  });

  describe('연결 정리 및 유지보수', () => {
    test('비활성 연결 정리', (done) => {
      // 연결 생성
      const connection1 = connectionPool.getConnection('node1', 'node2');
      const connection2 = connectionPool.getConnection('node3', 'node4');
      
      // connection1을 오래된 것으로 만들기
      connection1.lastActivity = Date.now() - 400000; // 6분 전
      
      setTimeout(() => {
        // 5분 이상 비활성 연결 정리
        const cleanedCount = connectionPool.cleanupInactiveConnections(300000);
        
        expect(cleanedCount).toBe(1);
        expect(connectionPool.getActiveConnection(connection1.id)).toBeNull();
        expect(connectionPool.getActiveConnection(connection2.id)).toBe(connection2);
        
        done();
      }, 10);
    });

    test('특정 노드의 모든 연결 해제', () => {
      // 여러 연결 생성
      connectionPool.getConnection('node1', 'node2');
      connectionPool.getConnection('node1', 'node3');
      connectionPool.getConnection('node2', 'node4');
      connectionPool.getConnection('node5', 'node6');
      
      const initialStats = connectionPool.getPoolStats();
      expect(initialStats.active).toBe(4);
      
      // node1과 관련된 모든 연결 해제
      const disconnectedCount = connectionPool.disconnectNode('node1');
      
      expect(disconnectedCount).toBe(2); // node1-node2, node1-node3
      
      const finalStats = connectionPool.getPoolStats();
      expect(finalStats.active).toBe(2); // node2-node4, node5-node6만 남음
    });

    test('풀 완전 정리', () => {
      // 여러 연결 생성 및 해제 (재사용되지 않도록)
      const connections = [];
      for (let i = 1; i <= 5; i++) {
        const conn = connectionPool.getConnection(`nodeA${i}`, `nodeB${i}`);
        connections.push(conn);
      }
      
      // 처음 3개 연결 해제 (풀로 반환됨)
      for (let i = 0; i < 3; i++) {
        connectionPool.releaseConnection(connections[i].id);
      }
      
      const beforeClear = connectionPool.getPoolStats();
      expect(beforeClear.active).toBe(2);
      expect(beforeClear.available).toBe(3);
      
      // 풀 완전 정리
      connectionPool.clear();
      
      const afterClear = connectionPool.getPoolStats();
      expect(afterClear.active).toBe(0);
      expect(afterClear.available).toBe(0);
      expect(afterClear.total).toBe(0);
    });
  });

  describe('풀 통계 및 모니터링', () => {
    test('풀 통계 정보', () => {
      // 초기 상태
      let stats = connectionPool.getPoolStats();
      expect(stats.available).toBe(0);
      expect(stats.active).toBe(0);
      expect(stats.total).toBe(0);
      expect(stats.maxSize).toBe(10);
      expect(stats.utilizationRate).toBe(0);
      
      // 연결 생성
      const conn1 = connectionPool.getConnection('node1', 'node2');
      const conn2 = connectionPool.getConnection('node3', 'node4');
      
      stats = connectionPool.getPoolStats();
      expect(stats.active).toBe(2);
      expect(stats.total).toBe(2);
      expect(stats.utilizationRate).toBe(1); // 2/2 = 100%
      
      // 연결 해제
      connectionPool.releaseConnection(conn1.id);
      
      stats = connectionPool.getPoolStats();
      expect(stats.available).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.total).toBe(2);
      expect(stats.utilizationRate).toBe(0.5); // 1/2 = 50%
    });

    test('풀 사용률 계산', () => {
      const pool = new ConnectionPool(5);
      
      // 5개 연결 생성 (재사용되지 않도록)
      const connections = [];
      for (let i = 1; i <= 5; i++) {
        const conn = pool.getConnection(`nodeA${i}`, `nodeB${i}`);
        connections.push(conn);
      }
      
      // 마지막 2개 연결 해제 (풀로 반환)
      for (let i = 3; i < 5; i++) {
        pool.releaseConnection(connections[i].id);
      }
      
      const stats = pool.getPoolStats();
      expect(stats.active).toBe(3);
      expect(stats.available).toBe(2);
      expect(stats.total).toBe(5);
      expect(stats.utilizationRate).toBe(0.6); // 3/5 = 60%
    });
  });

  describe('에러 처리 및 경계 조건', () => {
    test('빈 노드 ID로 연결 생성', () => {
      const connection = connectionPool.getConnection('', 'node2');
      
      expect(connection.nodeA).toBe('');
      expect(connection.nodeB).toBe('node2');
      expect(connection.id).toBeDefined();
    });

    test('동일한 노드끼리 연결', () => {
      const connection = connectionPool.getConnection('node1', 'node1');
      
      expect(connection.nodeA).toBe('node1');
      expect(connection.nodeB).toBe('node1');
      expect(connection.id).toBeDefined();
    });

    test('최대 풀 크기 0인 경우', () => {
      const zeroPool = new ConnectionPool(0);
      
      const conn = zeroPool.getConnection('node1', 'node2');
      expect(conn).toBeDefined();
      
      // 해제 시 풀에 저장되지 않아야 함
      zeroPool.releaseConnection(conn.id);
      
      const stats = zeroPool.getPoolStats();
      expect(stats.available).toBe(0);
      expect(stats.maxSize).toBe(0);
    });

    test('중복 연결 해제 시도', () => {
      const connection = connectionPool.getConnection('node1', 'node2');
      
      // 첫 번째 해제
      const released1 = connectionPool.releaseConnection(connection.id);
      expect(released1).toBe(true);
      
      // 두 번째 해제 시도
      const released2 = connectionPool.releaseConnection(connection.id);
      expect(released2).toBe(false);
    });
  });
}); 