import { CoreBridge } from '@core/boilerplate';
import { NetworkSystem } from '../core/NetworkSystem';
import { NetworkSnapshot, NetworkCommand, NetworkConfig, NetworkSystemState } from '../types';
export interface NetworkBridgeEntity {
    system: NetworkSystem;
    dispose: () => void;
}
export declare class NetworkBridge extends CoreBridge<NetworkBridgeEntity, NetworkSnapshot, NetworkCommand> {
    constructor();
    /**
     * Register the 'main' engine with default config (call from consumer, not constructor).
     */
    ensureMainEngine(config?: NetworkConfig): void;
    protected buildEngine(_: string, config?: NetworkConfig): NetworkBridgeEntity | null;
    protected executeCommand(entity: NetworkBridgeEntity, command: NetworkCommand, id: string): void;
    protected createSnapshot(entity: NetworkBridgeEntity, id: string): NetworkSnapshot;
    /**
     * 시스템 업데이트 (매 프레임 호출)
     */
    updateSystem(id: string, deltaTime: number): void;
    /**
     * 기본 설정으로 시스템 등록
     */
    private createDefaultConfig;
    /**
     * 엔진 구독 설정
     */
    private setupEngineSubscriptions;
    /**
     * 네트워크 통계 조회
     */
    getNetworkStats(id?: string): ReturnType<NetworkSystem['getDebugInfo']>['networkStats'] | null;
    /**
     * 시스템 상태 조회
     */
    getSystemState(id?: string): NetworkSystemState | null;
}
