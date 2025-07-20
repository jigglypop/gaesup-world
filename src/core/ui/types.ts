import * as THREE from 'three';

export interface MinimapMarker {
  id: string;
  type: 'normal' | 'ground';
  text: string;
  center: THREE.Vector3;
  size: THREE.Vector3;
}

export interface UINotification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: number;
}

export interface UIState {
  minimapVisible: boolean;
  hudVisible: boolean;
  tooltipText: string;
  tooltipPosition: THREE.Vector2;
  tooltipVisible: boolean;
  modalVisible: boolean;
  modalContent: React.ReactNode | null;
  notifications: UINotification[];
  lastUpdate: number;
}

export type UICommand = 
  | { type: 'showTooltip'; text: string; position: THREE.Vector2 }
  | { type: 'hideTooltip' }
  | { type: 'showModal'; content: React.ReactNode }
  | { type: 'hideModal' }
  | { type: 'toggleMinimap' }
  | { type: 'toggleHUD' }
  | { type: 'addNotification'; id: string; message: string; notificationType?: 'info' | 'warning' | 'error' | 'success' }
  | { type: 'removeNotification'; id: string }
  | { type: 'addMinimapMarker'; id: string; markerType: 'normal' | 'ground'; text: string; position: THREE.Vector3; size: THREE.Vector3 }
  | { type: 'removeMinimapMarker'; id: string }
  | { type: 'updateMinimapMarker'; id: string; updates: Partial<{ text: string; position: THREE.Vector3; size: THREE.Vector3 }> };

export interface UISnapshot {
  minimapVisible: boolean;
  hudVisible: boolean;
  tooltipVisible: boolean;
  modalVisible: boolean;
  notificationCount: number;
  lastUpdate: number;
}

export interface UIConfig {
  minimap: {
    enabled: boolean;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
    size: number;
    opacity: number;
    showZoom: boolean;
    showCompass: boolean;
    updateInterval: number;
  };
  tooltip: {
    enabled: boolean;
    delay: number;
    fadeSpeed: number;
    maxWidth: number;
    fontSize: number;
  };
  hud: {
    enabled: boolean;
    opacity: number;
    showHealthBar: boolean;
    showManaBar: boolean;
    showExperienceBar: boolean;
  };
  modal: {
    closeOnEscape: boolean;
    closeOnBackdrop: boolean;
    backdropOpacity: number;
  };
  notifications: {
    maxCount: number;
    autoHideDuration: number;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  };
  speechBalloon: {
    enabled: boolean;
    fontSize: number;
    padding: number;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    maxWidth: number;
    backgroundColor: string;
    textColor: string;
    fadeDistance: number;
    scaleMultiplier: number;
    defaultOffset: { x: number; y: number; z: number };
  };
} 