import * as THREE from 'three';

import { CoreBridge } from '@core/boilerplate';
import { DomainBridge, EnableMetrics, Command, ValidateCommand, LogSnapshot, CacheSnapshot, RequireEngineById } from '@core/boilerplate/decorators';

import { UISystem } from '../core/UISystem';
import { UISnapshot, UICommand } from '../types';

@DomainBridge('ui')
@EnableMetrics()
export class UIBridge extends CoreBridge<UISystem, UISnapshot, UICommand> {
  constructor() {
    super();
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

  @Command('ui')
  @ValidateCommand()
  protected executeCommand(system: UISystem, command: UICommand): void {
    system.execute(command);
  }

  @LogSnapshot()
  @CacheSnapshot(16)
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

  @RequireEngineById()
  public showTooltip(text: string, position: THREE.Vector2): void {
    this.execute('main', { type: 'showTooltip', text, position });
  }

  @RequireEngineById()
  public hideTooltip(): void {
    this.execute('main', { type: 'hideTooltip' });
  }

  @RequireEngineById()
  public showModal(content: React.ReactNode): void {
    this.execute('main', { type: 'showModal', content });
  }

  @RequireEngineById()
  public hideModal(): void {
    this.execute('main', { type: 'hideModal' });
  }

  @RequireEngineById()
  public toggleMinimap(): void {
    this.execute('main', { type: 'toggleMinimap' });
  }

  @RequireEngineById()
  public toggleHUD(): void {
    this.execute('main', { type: 'toggleHUD' });
  }

  @RequireEngineById()
  public addNotification(id: string, message: string, type?: 'info' | 'warning' | 'error' | 'success'): void {
    this.execute('main', { 
      type: 'addNotification', 
      id, 
      message, 
      notificationType: type || 'info' 
    });
  }

  @RequireEngineById()
  public removeNotification(id: string): void {
    this.execute('main', { type: 'removeNotification', id });
  }

  @RequireEngineById()
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

  @RequireEngineById()
  public removeMinimapMarker(id: string): void {
    this.execute('main', { type: 'removeMinimapMarker', id });
  }

  @RequireEngineById()
  public updateMinimapMarker(id: string, updates: Partial<{ text: string; position: THREE.Vector3; size: THREE.Vector3 }>): void {
    this.execute('main', { type: 'updateMinimapMarker', id, updates });
  }

  @RequireEngineById()
  public getUIMetrics(): ReturnType<UISystem['getMetrics']> | null {
    const system = this.getEngine('main');
    return system ? system.getMetrics() : null;
  }

  override execute(type: string, command: UICommand): void {
    super.execute(type, command);
  }

  @LogSnapshot()
  @CacheSnapshot(16)
  override snapshot(type: string): UISnapshot | null {
    return super.snapshot(type);
  }
} 