import * as THREE from 'three';

import { NetworkSystemState, NetworkConfig, NetworkCommand, NetworkSnapshot } from '../types';
import { ConnectionPool } from './ConnectionPool';
import { MessageQueue } from './MessageQueue';
import { NPCNetworkManager } from './NPCNetworkManager';
import { PerformanceMetrics, NetworkEvent } from './types';

export class NetworkSystem {
  private state: NetworkSystemState;
  private npcManager: NPCNetworkManager;
  private messageQueue: MessageQueue;
  private connectionPool: ConnectionPool;
  private config: NetworkConfig;
  private lastUpdate: number = 0;
  private lastCleanupTime: number = 0;
  private updateTimer: NodeJS.Timeout | undefined;

  constructor(config: NetworkConfig) {
    this.config = { ...config };
    
    // 컴포넌트 초기화
    this.npcManager = new NPCNetworkManager(config.proximityRange, config.maxDistance);
    this.messageQueue = new MessageQueue(config.messageQueueSize, config.batchSize, config.enableBatching);
    this.connectionPool = new ConnectionPool(config.connectionPoolSize);

    // 초기 상태 설정
    this.state = {
      nodes: new Map(),
      connections: new Map(),
      groups: new Map(),
      messageQueues: new Map(),
      stats: {
        totalNodes: 0,
        activeConnections: 0,
        messagesPerSecond: 0,
        averageLatency: 0,
        bandwidth: 0,
        lastUpdate: Date.now()
      },
      isRunning: false,
      lastUpdate: Date.now()
    };
  }

  // 시스템 시작
  start(): void {
    if (this.state.isRunning) return;
    
    this.state.isRunning = true;
    const now = Date.now();
    this.lastUpdate = now;
    this.lastCleanupTime = now;
    this.startUpdateLoop();
  }

  // 시스템 정지
  stop(): void {
    if (!this.state.isRunning) return;
    
    this.state.isRunning = false;
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
      this.updateTimer = undefined;
    }
  }

  // 업데이트 루프 시작
  private startUpdateLoop(): void {
    if (this.updateTimer) {
      clearInterval(this.updateTimer);
    }

    const interval = 1000 / this.config.updateFrequency; // FPS를 ms로 변환
    this.updateTimer = setInterval(() => {
      this.update();
    }, interval);
  }

  // 시스템 업데이트
  private update(): void {
    if (!this.state.isRunning) return;

    const now = Date.now();
    const deltaTime = now - this.lastUpdate;
    this.lastUpdate = now;
    void deltaTime;

    // 메시지 배치 처리
    this.processMessageBatch();

    // 근접 기반 자동 그룹 업데이트
    this.npcManager.updateProximityGroups();

    // 비활성 연결 정리
    if (now - this.lastCleanupTime >= this.config.connectionTimeout) {
      this.connectionPool.cleanupInactiveConnections(this.config.connectionTimeout);
      this.lastCleanupTime = now;
    }

    // 통계 업데이트
    this.updateStatistics();

    // 상태 동기화
    this.syncState();

    this.state.lastUpdate = now;
  }

  // 메시지 배치 처리
  private processMessageBatch(): void {
    const batch = this.messageQueue.dequeueBatch();
    
    for (const message of batch) {
      try {
        this.npcManager.sendMessage(message);
      } catch (error) {
        console.error('Error processing message:', error);
      }
    }
  }

  // 통계 업데이트
  private updateStatistics(): void {
    const networkStats = this.npcManager.getNetworkStats();
    const performanceMetrics = this.npcManager.getPerformanceMetrics();
    const poolStats = this.connectionPool.getPoolStats();
    void poolStats;

    this.state.stats = {
      totalNodes: networkStats.nodeCount,
      activeConnections: networkStats.connectionCount,
      messagesPerSecond: this.calculateMessagesPerSecond(performanceMetrics),
      averageLatency: performanceMetrics.averageLatency,
      bandwidth: performanceMetrics.bandwidth,
      lastUpdate: Date.now()
    };
  }

  // 초당 메시지 수 계산
  private calculateMessagesPerSecond(metrics: PerformanceMetrics): number {
    const timeDiff = (Date.now() - metrics.lastUpdate) / 1000;
    return timeDiff > 0 ? metrics.messagesProcessed / timeDiff : 0;
  }

  // 상태 동기화
  private syncState(): void {
    // NPC 노드 동기화
    this.state.nodes.clear();
    for (const node of this.npcManager.getAllNodes()) {
      this.state.nodes.set(node.id, node);
    }

    // 그룹 동기화
    this.state.groups.clear();
    for (const group of this.npcManager.getAllGroups()) {
      this.state.groups.set(group.id, group);
    }

    // 메시지 큐 동기화
    this.state.messageQueues.clear();
    for (const [nodeId, node] of this.state.nodes.entries()) {
      if (node.messageQueue.length > 0) {
        this.state.messageQueues.set(nodeId, [...node.messageQueue]);
      }
    }
  }

  // 명령 실행
  executeCommand(command: NetworkCommand): boolean {
    try {
      switch (command.type) {
        case 'registerNPC':
          this.registerNPC(command.npcId, command.position, command.options);
          return true;

        case 'unregisterNPC':
          return this.unregisterNPC(command.npcId);

        case 'updateNPCPosition':
          return this.updateNPCPosition(command.npcId, command.position);

        case 'connect':
          return this.npcManager.connectNodes(command.npcId, command.targetId);

        case 'disconnect':
          if (command.targetId) {
            return this.npcManager.disconnectNodes(command.npcId, command.targetId);
          } else {
            // 모든 연결 해제
            return this.npcManager.unregisterNode(command.npcId);
          }

        case 'sendMessage':
          this.messageQueue.enqueue(command.message);
          return true;

        case 'broadcast':
          const broadcastMessage = {
            ...command.message,
            to: 'broadcast' as const
          };
          this.messageQueue.enqueue(broadcastMessage);
          return true;

        case 'joinGroup':
          return this.npcManager.joinGroup(command.npcId, command.groupId);

        case 'leaveGroup':
          return this.npcManager.leaveGroup(command.npcId, command.groupId);

        case 'createGroup':
          const group = this.npcManager.createGroup(command.group.type, {
            maxMembers: command.group.maxMembers,
            range: command.group.range,
            persistent: command.group.persistent
          });
          return !!group;

        case 'updateSettings':
          this.updateConfig(command.settings);
          return true;

        case 'updateConfig':
          this.updateConfig(command.data.config);
          return true;

        case 'startMonitoring':
          // 모니터링 시작 로직
          return true;

        case 'stopMonitoring':
          // 모니터링 정지 로직
          return true;

        default:
          console.warn('Unknown network command:', command);
          return false;
      }
    } catch (error) {
      console.error('Error executing network command:', error);
      return false;
    }
  }

  // 스냅샷 생성
  createSnapshot(): NetworkSnapshot {
    return {
      nodeCount: this.state.stats.totalNodes,
      connectionCount: this.state.stats.activeConnections,
      activeGroups: this.state.groups.size,
      messagesPerSecond: this.state.stats.messagesPerSecond,
      averageLatency: this.state.stats.averageLatency,
      lastUpdate: this.state.lastUpdate
    };
  }

  // 설정 업데이트
  updateConfig(partialConfig: Partial<NetworkConfig>): void {
    this.config = { ...this.config, ...partialConfig };

    // 컴포넌트 설정 업데이트
    if (partialConfig.messageQueueSize || partialConfig.batchSize || partialConfig.enableBatching) {
      this.messageQueue.updateBatchSettings(
        this.config.batchSize,
        this.config.enableBatching
      );
      this.messageQueue.updateMaxSize(this.config.messageQueueSize);
    }

    if (partialConfig.connectionPoolSize) {
      this.connectionPool.updatePoolSettings(this.config.connectionPoolSize);
    }

    if (partialConfig.proximityRange || partialConfig.maxDistance) {
      this.npcManager.updateSettings(this.config.proximityRange, this.config.maxDistance);
    }

    if (partialConfig.updateFrequency) {
      // 업데이트 주기 변경: 실행 중일 때만 interval 재시작
      if (this.state.isRunning) {
        this.startUpdateLoop();
      }
    }
  }

  // NPC 등록
  registerNPC(npcId: string, position: THREE.Vector3, options?: {
    communicationRange?: number;
    signalStrength?: number;
  }) {
    return this.npcManager.registerNode(npcId, position, options);
  }

  // NPC 제거
  unregisterNPC(npcId: string): boolean {
    return this.npcManager.unregisterNode(npcId);
  }

  // NPC 위치 업데이트
  updateNPCPosition(npcId: string, position: THREE.Vector3): boolean {
    return this.npcManager.updateNodePosition(npcId, position);
  }

  // 메시지 가져오기
  getMessages(npcId: string) {
    return this.npcManager.getMessages(npcId);
  }

  // 시스템 상태 가져오기
  getState(): NetworkSystemState {
    return { ...this.state };
  }

  // 설정 가져오기
  getConfig(): NetworkConfig {
    return { ...this.config };
  }

  // 시스템 정리
  dispose(): void {
    this.stop();
    this.npcManager.clear();
    this.messageQueue.clear();
    this.connectionPool.clear();
    
    this.state.nodes.clear();
    this.state.connections.clear();
    this.state.groups.clear();
    this.state.messageQueues.clear();
  }

  // 이벤트 리스너 등록
  addEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void {
    this.npcManager.addEventListener(eventType, callback);
  }

  // 이벤트 리스너 제거
  removeEventListener(eventType: NetworkEvent['type'], callback: (event: NetworkEvent) => void): void {
    this.npcManager.removeEventListener(eventType, callback);
  }

  // 디버그 정보
  getDebugInfo() {
    return {
      isRunning: this.state.isRunning,
      config: this.config,
      stats: this.state.stats,
      networkStats: this.npcManager.getNetworkStats(),
      performanceMetrics: this.npcManager.getPerformanceMetrics(),
      poolStats: this.connectionPool.getPoolStats(),
      messageQueueStats: this.messageQueue.getStats()
    };
  }
} 