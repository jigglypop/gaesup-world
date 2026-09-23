import { CoreBridge, DomainBridge, EnableMetrics, ValidateCommand, LogSnapshot } from '@core/boilerplate';

import type { AnimationClockLoop } from '../../simulation/AnimationClockLoop';
import type { FixedStepClock } from '../../simulation/FixedStepClock';
import { NetworkSystem } from '../core/NetworkSystem';
import { NetworkSnapshot, NetworkCommand, NetworkConfig, NetworkSystemState } from '../types';

let nextBridgeClockId = 0;
type UpdateLease = { entity: NetworkBridgeEntity; loop: AnimationClockLoop; references: number; dispose: () => void };

export interface NetworkBridgeEntity {
  system: NetworkSystem;
  dispose: () => void;
}

@DomainBridge('networks')
@EnableMetrics()
export class NetworkBridge extends CoreBridge<NetworkBridgeEntity, NetworkSnapshot, NetworkCommand> {
  private readonly updates = new Map<string, UpdateLease>();
  private readonly clockId = `network-publish:${++nextBridgeClockId}`;
  private clock: FixedStepClock | undefined;

  constructor() {
    super();
    this.setupEngineSubscriptions();
  }

  static forClock(clock: FixedStepClock): NetworkBridge {
    const bridge = new NetworkBridge(); bridge.clock = clock; return bridge;
  }

  /**
   * Register the 'main' engine with default config (call from consumer, not constructor).
   */
  ensureMainEngine(config?: NetworkConfig): void {
    if (this.getEngine('main')) return;
    this.register('main', config ?? this.createDefaultConfig());
  }

  protected buildEngine(_id: string, config?: NetworkConfig): NetworkBridgeEntity | null {
    try {
      const system = new NetworkSystem(config ?? this.createDefaultConfig());
      const releaseOwnedClock = this.clock ? system.acquireClock(this.clock) : undefined;
      system.start();
      return {
        system,
        dispose: () => {
          system.dispose();
          releaseOwnedClock?.();
        }
      };
    } catch (error) {
      console.error('[NetworkBridge] Failed to build engine:', error);
      return null;
    }
  }

  @ValidateCommand()
  protected executeCommand(entity: NetworkBridgeEntity, command: NetworkCommand, id: string): void {
    const { system } = entity;
    void id;
    system.executeCommand(command);
  }

  @LogSnapshot()
  protected createSnapshot(entity: NetworkBridgeEntity, id: string): NetworkSnapshot {
    const { system } = entity;
    void id;
    return system.createSnapshot();
  }

  /**
   * 시스템 업데이트 (매 프레임 호출)
   */
  updateSystem(id: string, deltaTime: number): void {
    const entity = this.getEngine(id);
    if (!entity) return;
    void deltaTime;
    this.notifyListeners(id);
  }

  /** All hooks observing this engine share one clock registration and one publication per update. */
  acquireUpdates(id: string, loop: AnimationClockLoop): () => void {
    const entity = this.getEngine(id);
    if (!entity) throw new Error(`Unknown network engine: ${id}`);
    let lease = this.updates.get(id);
    if (lease && (lease.entity !== entity || lease.loop !== loop)) throw new Error('Network updates already have another clock owner');
    if (!lease) {
      let current = entity;
      let releaseClock = current.system.acquireClock(loop.clock);
      let revision = entity.system.updateRevision;
      const releasePublish = loop.clock.addSystem({ id: `${this.clockId}:${id}`, phase: 'publish', update: () => {
        if (revision === current.system.updateRevision) return;
        revision = current.system.updateRevision;
        this.notifyListeners(id);
      } });
      const releaseLoop = loop.acquire();
      const owned: UpdateLease = { entity, loop, references: 0, dispose: () => {
        if (this.updates.get(id) !== owned) return;
        this.updates.delete(id); releaseRegistration(); releaseLoop(); releasePublish(); releaseClock();
      } };
      const releaseRegistration = this.on('register', event => {
        if (event.id !== id) return;
        const replacement = this.getEngine(id);
        if (!replacement || replacement === current) return;
        releaseClock(); current = replacement; owned.entity = replacement;
        releaseClock = current.system.acquireClock(loop.clock); revision = current.system.updateRevision;
      });
      lease = owned; this.updates.set(id, lease);
    }
    lease.references++;
    const owned = lease; let released = false;
    return () => {
      if (released || this.updates.get(id) !== owned) return;
      released = true; if (--owned.references === 0) owned.dispose();
    };
  }

  override unregister(id: string): void { this.updates.get(id)?.dispose(); super.unregister(id); }

  override dispose(): void {
    for (const lease of this.updates.values()) lease.dispose();
    super.dispose();
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
      void event;
      // 추가적인 이벤트 처리 로직
    });
  }

  /**
   * 네트워크 통계 조회
   */
  getNetworkStats(id: string = 'main'): ReturnType<NetworkSystem['getDebugInfo']>['networkStats'] | null {
    const entity = this.getEngine(id);
    if (!entity) return null;
    
    return entity.system.getDebugInfo()?.networkStats ?? null;
  }

  /**
   * 시스템 상태 조회
   */
  getSystemState(id: string = 'main'): NetworkSystemState | null {
    const entity = this.getEngine(id);
    if (!entity) return null;
    
    return entity.system.getState();
  }
}
