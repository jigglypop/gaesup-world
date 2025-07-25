import { create } from 'zustand';
import { UIConfig } from '../types';

interface UIConfigStore {
  config: UIConfig;
  updateConfig: (partial: Partial<UIConfig>) => void;
  updateMinimapConfig: (config: Partial<UIConfig['minimap']>) => void;
  updateTooltipConfig: (config: Partial<UIConfig['tooltip']>) => void;
  updateHudConfig: (config: Partial<UIConfig['hud']>) => void;
  updateModalConfig: (config: Partial<UIConfig['modal']>) => void;
  updateNotificationsConfig: (config: Partial<UIConfig['notifications']>) => void;
  updateSpeechBalloonConfig: (config: Partial<UIConfig['speechBalloon']>) => void;
  resetConfig: () => void;
}

const defaultConfig: UIConfig = {
  minimap: {
    enabled: true,
    position: 'bottom-right',
    size: 200,
    opacity: 0.9,
    showZoom: true,
    showCompass: true,
    updateInterval: 33,
  },
  tooltip: {
    enabled: true,
    delay: 500,
    fadeSpeed: 200,
    maxWidth: 300,
    fontSize: 14,
  },
  hud: {
    enabled: true,
    opacity: 0.9,
    showHealthBar: true,
    showManaBar: true,
    showExperienceBar: true,
  },
  modal: {
    closeOnEscape: true,
    closeOnBackdrop: true,
    backdropOpacity: 0.5,
  },
  notifications: {
    maxCount: 5,
    autoHideDuration: 5000,
    position: 'top-right',
  },
  speechBalloon: {
    enabled: true,
    fontSize: 80,
    padding: 30,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#000000',
    maxWidth: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    textColor: '#000000',
    fadeDistance: 20,
    scaleMultiplier: 2.0,
    defaultOffset: { x: 0, y: 4.5, z: 0 },
  },
};

export const useUIConfigStore = create<UIConfigStore>((set) => ({
  config: defaultConfig,
  
  updateConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),
    
  updateMinimapConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        minimap: { ...state.config.minimap, ...config },
      },
    })),
    
  updateTooltipConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        tooltip: { ...state.config.tooltip, ...config },
      },
    })),
    
  updateHudConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        hud: { ...state.config.hud, ...config },
      },
    })),
    
  updateModalConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        modal: { ...state.config.modal, ...config },
      },
    })),
    
  updateNotificationsConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        notifications: { ...state.config.notifications, ...config },
      },
    })),
    
  updateSpeechBalloonConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        speechBalloon: { ...state.config.speechBalloon, ...config },
      },
    })),
    
  resetConfig: () => set({ config: defaultConfig }),
})); 