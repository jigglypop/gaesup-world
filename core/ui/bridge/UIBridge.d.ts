import * as THREE from 'three';
import { CoreBridge } from '@core/boilerplate';
import { UISystem } from '../core/UISystem';
import { UISnapshot, UICommand } from '../types';
export declare class UIBridge extends CoreBridge<UISystem, UISnapshot, UICommand> {
    constructor();
    private setupEngineSubscriptions;
    protected buildEngine(): UISystem;
    protected executeCommand(system: UISystem, command: UICommand): void;
    protected createSnapshot(system: UISystem): UISnapshot;
    showTooltip(text: string, position: THREE.Vector2): void;
    hideTooltip(): void;
    showModal(content: React.ReactNode): void;
    hideModal(): void;
    toggleMinimap(): void;
    toggleHUD(): void;
    addNotification(id: string, message: string, type?: 'info' | 'warning' | 'error' | 'success'): void;
    removeNotification(id: string): void;
    addMinimapMarker(id: string, markerType: 'normal' | 'ground', text: string, position: THREE.Vector3, size: THREE.Vector3): void;
    removeMinimapMarker(id: string): void;
    updateMinimapMarker(id: string, updates: Partial<{
        text: string;
        position: THREE.Vector3;
        size: THREE.Vector3;
    }>): void;
    getUIMetrics(): ReturnType<UISystem['getMetrics']> | null;
    execute(type: string, command: UICommand): void;
    snapshot(type: string): UISnapshot | null;
}
