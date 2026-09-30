import * as THREE from 'three';

import { CoreBridge } from '@core/boilerplate';

import { UISystem } from '../core/UISystem';
import { UISnapshot, UICommand } from '../types';

export class UIBridge extends CoreBridge<UISystem, UISnapshot, UICommand> {
  constructor() {
    super({ metrics: true });
    this.register('main', new UISystem());
    this.setupEngineSubscriptions();
  }

  private setupEngineSubscriptions(): void {
    this.engines.forEach((system) => {
      system.subscribe(() => {
        this.notifyListeners('main');
      });
    });
  }

  protected buildEngine(): UISystem {
    return new UISystem();
  }

  protected executeCommand(system: UISystem, command: UICommand): void {
    system.execute(command);
  }

  protected createSnapshot(system: UISystem): UISnapshot {
    const state = system.getState();
    return {
      minimapVisible: state.minimapVisible,
      hudVisible: state.hudVisible,
      tooltipVisible: state.tooltipVisible,
      modalVisible: state.modalVisible,
      notificationCount: state.notifications.length,
      lastUpdate: state.lastUpdate
    };
  }

  public showTooltip(text: string, position: THREE.Vector2): void {
    this.execute('main', { type: 'showTooltip', text, position });
  }

  public hideTooltip(): void {
    this.execute('main', { type: 'hideTooltip' });
  }

  public showModal(content: React.ReactNode): void {
    this.execute('main', { type: 'showModal', content });
  }

  public hideModal(): void {
    this.execute('main', { type: 'hideModal' });
  }

  public toggleMinimap(): void {
    this.execute('main', { type: 'toggleMinimap' });
  }

  public toggleHUD(): void {
    this.execute('main', { type: 'toggleHUD' });
  }

  public addNotification(id: string, message: string, type?: 'info' | 'warning' | 'error' | 'success'): void {
    this.execute('main', { 
      type: 'addNotification', 
      id, 
      message, 
      notificationType: type || 'info' 
    });
  }

  public removeNotification(id: string): void {
    this.execute('main', { type: 'removeNotification', id });
  }

  public addMinimapMarker(id: string, markerType: 'normal' | 'ground', text: string, position: THREE.Vector3, size: THREE.Vector3): void {
    this.execute('main', { 
      type: 'addMinimapMarker', 
      id, 
      markerType, 
      text, 
      position, 
      size 
    });
  }

  public removeMinimapMarker(id: string): void {
    this.execute('main', { type: 'removeMinimapMarker', id });
  }

  public updateMinimapMarker(id: string, updates: Partial<{ text: string; position: THREE.Vector3; size: THREE.Vector3 }>): void {
    this.execute('main', { type: 'updateMinimapMarker', id, updates });
  }

  public getUIMetrics(): ReturnType<UISystem['getMetrics']> | null {
    const system = this.getEngine('main');
    return system ? system.getMetrics() : null;
  }

  override execute(type: string, command: UICommand): void {
    super.execute(type, command);
  }

  override snapshot(type: string): UISnapshot | null {
    return super.snapshot(type);
  }
}
