import { NetworkConnection } from '../types';
import { ConnectionOptions } from './types';

export class ConnectionPool {
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

  // 풀 설정 업데이트
  updatePoolSettings(maxPoolSize: number, defaultOptions?: Partial<ConnectionOptions>): void {
    this.maxPoolSize = Math.max(0, maxPoolSize);
    
    if (defaultOptions) {
      this.defaultOptions = { ...this.defaultOptions, ...defaultOptions };
    }

    // 풀 크기가 줄어들면 초과 연결 제거
    while (this.availableConnections.length > this.maxPoolSize) {
      this.availableConnections.pop();
    }
  }
} 