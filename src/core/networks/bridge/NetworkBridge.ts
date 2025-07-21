import { CoreBridge, DomainBridge, EnableMetrics, ValidateCommand, LogSnapshot, CacheSnapshot } from '@core/boilerplate';
import { NetworkSystem } from '../core/NetworkSystem';
import { NetworkSnapshot, NetworkCommand, NetworkConfig } from '../types';
import { NetworkConfigStore } from './types';

export interface NetworkBridgeEntity {
  system: NetworkSystem;
  dispose: () => void;
}

@DomainBridge('networks')
@EnableMetrics()
export class NetworkBridge extends CoreBridge<NetworkBridgeEntity, NetworkSnapshot, NetworkCommand> {
  constructor() {
    super();
    this.register('main', this.createDefaultConfig());
    this.setupEngineSubscriptions();
  }

  protected buildEngine(_: string, config?: NetworkConfig): NetworkBridgeEntity | null {
    try {
      const system = new NetworkSystem(config);
      return {
        system,
        dispose: () => system.dispose()
      };
    } catch (error) {
      console.error('[NetworkBridge] Failed to build engine:', error);
      return null;
    }
  }

  @ValidateCommand()
  protected executeCommand(entity: NetworkBridgeEntity, command: NetworkCommand, id: string): void {
    const { system } = entity;
    
    switch (command.type) {
      case 'registerNPC':
        system.registerNPC(command.data.npcId, command.data.position, command.data.metadata);
        break;
        
      case 'unregisterNPC':
        system.unregisterNPC(command.data.npcId);
        break;
        
      case 'updateNPCPosition':
        system.updateNPCPosition(command.data.npcId, command.data.position);
        break;
        
      case 'connectNPCs':
        system.connectNPCs(command.data.fromId, command.data.toId, command.data.options);
        break;
        
      case 'disconnectNPCs':
        system.disconnectNPCs(command.data.fromId, command.data.toId);
        break;
        
      case 'sendMessage':
        system.sendMessage(command.data.fromId, command.data.toId, command.data.message);
        break;
        
      case 'broadcastMessage':
        system.broadcastMessage(command.data.fromId, command.data.message, command.data.options);
        break;
        
      case 'createGroup':
        system.createGroup(command.data.groupId, command.data.npcIds, command.data.options);
        break;
        
      case 'joinGroup':
        system.joinGroup(command.data.npcId, command.data.groupId);
        break;
        
      case 'leaveGroup':
        system.leaveGroup(command.data.npcId, command.data.groupId);
        break;
        
      case 'updateConfig':
        system.updateConfig(command.data.config);
        break;
        
      case 'start':
        system.start();
        break;
        
      case 'stop':
        system.stop();
        break;
        
      case 'pause':
        system.pause();
        break;
        
      case 'resume':
        system.resume();
        break;
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16) // 60fps에서 16프레임마다 캐싱
  protected createSnapshot(entity: NetworkBridgeEntity, id: string): NetworkSnapshot {
    const { system } = entity;
    return system.createSnapshot();
  }

  /**
   * 시스템 업데이트 (매 프레임 호출)
   */
  updateSystem(id: string, deltaTime: number): void {
    const entity = this.getEngine(id);
    if (!entity) return;
    
    entity.system.update(deltaTime);
    this.notifyListeners(id);
  }

  /**
   * 기본 설정으로 시스템 등록
   */
  private createDefaultConfig(): NetworkConfig {
    return {
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
  }

  /**
   * 엔진 구독 설정
   */
  private setupEngineSubscriptions(): void {
    // 스냅샷 변경 시 자동 알림
    this.on('snapshot', (event) => {
      // 추가적인 이벤트 처리 로직
    });
  }

  /**
   * 네트워크 통계 조회
   */
  getNetworkStats(id: string = 'main'): any {
    const entity = this.getEngine(id);
    if (!entity) return null;
    
    return entity.system.getNetworkStats();
  }

  /**
   * 시스템 상태 조회
   */
  getSystemState(id: string = 'main'): any {
    const entity = this.getEngine(id);
    if (!entity) return null;
    
    return entity.system.getState();
  }
} 