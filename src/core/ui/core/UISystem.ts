import * as THREE from 'three';

import { UIState, UICommand } from '../types';
import { MinimapSystem } from './MinimapSystem';

export class UISystem {
  private state: UIState;
  private minimapSystem: MinimapSystem;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = {
      minimapVisible: true,
      hudVisible: true,
      tooltipText: '',
      tooltipPosition: new THREE.Vector2(0, 0),
      tooltipVisible: false,
      modalVisible: false,
      modalContent: null,
      notifications: [],
      lastUpdate: Date.now()
    };
    this.minimapSystem = MinimapSystem.getInstance();
  }

  public getState(): UIState {
    return { ...this.state };
  }

  public execute(command: UICommand): void {
    switch (command.type) {
      case 'showTooltip':
        this.state.tooltipText = command.text;
        this.state.tooltipPosition = command.position;
        this.state.tooltipVisible = true;
        break;

      case 'hideTooltip':
        this.state.tooltipVisible = false;
        this.state.tooltipText = '';
        break;

      case 'showModal':
        this.state.modalVisible = true;
        this.state.modalContent = command.content;
        break;

      case 'hideModal':
        this.state.modalVisible = false;
        this.state.modalContent = null;
        break;

      case 'toggleMinimap':
        this.state.minimapVisible = !this.state.minimapVisible;
        break;

      case 'toggleHUD':
        this.state.hudVisible = !this.state.hudVisible;
        break;

      case 'addNotification':
        this.state.notifications.push({
          id: command.id,
          message: command.message,
          type: command.notificationType || 'info',
          timestamp: Date.now()
        });
        break;

      case 'removeNotification':
        this.state.notifications = this.state.notifications.filter(
          n => n.id !== command.id
        );
        break;

      case 'addMinimapMarker':
        this.minimapSystem.addMarker(
          command.id,
          command.markerType,
          command.text,
          command.position,
          command.size
        );
        break;

      case 'removeMinimapMarker':
        this.minimapSystem.removeMarker(command.id);
        break;

      case 'updateMinimapMarker':
        this.minimapSystem.updateMarker(command.id, command.updates);
        break;

      default:
        console.warn('Unknown UI command:', command);
    }

    this.state.lastUpdate = Date.now();
    this.notifyListeners();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  public dispose(): void {
    this.listeners.clear();
    this.minimapSystem.clear();
  }

  public getMetrics() {
    return {
      notificationCount: this.state.notifications.length,
      isMinimapVisible: this.state.minimapVisible,
      isHudVisible: this.state.hudVisible,
      isTooltipVisible: this.state.tooltipVisible,
      isModalVisible: this.state.modalVisible,
      lastUpdate: this.state.lastUpdate
    };
  }
} 