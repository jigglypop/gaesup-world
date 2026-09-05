import * as THREE from 'three';
import { StateCreator } from 'zustand';

import { InteractionSliceState, InteractionActions } from './types';
import { InteractionBridge } from '../bridge/InteractionBridge';
import { InteractionState, AutomationState, InteractionConfig, AutomationConfig, InteractionMetrics, AutomationMetrics, BridgeState } from '../bridge/types';
import { getDefaultInteractionInputBackend } from '../core/adapter';
import { getDefaultAutomationSystem, subscribeDefaultAutomation } from '../core/defaultAutomation';

const createDefaultInteractionState = (): InteractionState => ({
  keyboard: {
    forward: false,
    backward: false,
    leftward: false,
    rightward: false,
    shift: false,
    space: false,
    keyZ: false,
    keyR: false,
    keyF: false,
    keyE: false,
    escape: false
  },
  mouse: {
    target: new THREE.Vector3(),
    angle: 0,
    isActive: false,
    shouldRun: false,
    isLookAround: false,
    buttons: { left: false, right: false, middle: false },
    wheel: 0,
    position: new THREE.Vector2()
  },
  gamepad: {
    connected: false,
    leftStick: new THREE.Vector2(),
    rightStick: new THREE.Vector2(),
    triggers: { left: 0, right: 0 },
    buttons: {},
    vibration: { weak: 0, strong: 0 }
  },
  touch: {
    touches: [],
    gestures: {
      pinch: 1,
      rotation: 0,
      pan: new THREE.Vector2()
    }
  },
  lastUpdate: 0,
  isActive: true
});

const createDefaultAutomationState = (): AutomationState => ({
  isActive: false,
  queue: {
    actions: [],
    currentIndex: 0,
    isRunning: false,
    isPaused: false,
    loop: false,
    maxRetries: 3
  },
  currentAction: null,
  executionStats: {
    totalExecuted: 0,
    successRate: 100,
    averageTime: 0,
    errors: []
  },
  settings: {
    throttle: 100,
    autoStart: false,
    trackProgress: true,
    showVisualCues: true
  }
});

const createDefaultBridgeState = (): BridgeState => ({
  isActive: true,
  lastCommand: null,
  commandHistory: [],
  syncStatus: 'idle'
});

const createDefaultInteractionConfig = (): InteractionConfig => ({
  sensitivity: { mouse: 1, gamepad: 1, touch: 1 },
  deadzone: { gamepad: 0.1, touch: 0.05 },
  smoothing: { mouse: 0.1, gamepad: 0.2 },
  invertY: false,
  enableVibration: true
});

const createDefaultAutomationConfig = (): AutomationConfig => ({
  maxConcurrentActions: 1,
  defaultDelay: 100,
  retryDelay: 1000,
  timeoutDuration: 5000,
  enableLogging: true,
  visualCues: {
    showPath: true,
    showTargets: true,
    lineColor: '#00ff00',
    targetColor: '#ff0000'
  }
});

const createDefaultInteractionMetrics = (): InteractionMetrics => ({
  lastUpdate: 0,
  inputLatency: 0,
  frameTime: 0,
  eventCount: 0,
  activeInputs: [],
  performanceScore: 100
});

const createDefaultAutomationMetrics = (): AutomationMetrics => ({
  queueLength: 0,
  executionTime: 0,
  performance: 100,
  memoryUsage: 0,
  errorRate: 0
});

type Slice = InteractionSliceState & InteractionActions;

let systemListenersBound = false;

const ensureSystemListeners = (set: (fn: (state: Slice) => Partial<Slice>) => void): void => {
  if (systemListenersBound) return;
  systemListenersBound = true;
  let receivedInitialSnapshot = false;
  getDefaultInteractionInputBackend().subscribe?.(({ keyboard, mouse, gamepad, touch }) => {
    if (!receivedInitialSnapshot) {
      receivedInitialSnapshot = true;
      return;
    }

    set((state) => ({
      interaction: {
        ...state.interaction,
        keyboard,
        mouse,
        gamepad: gamepad ?? state.interaction.gamepad,
        touch: touch ?? state.interaction.touch,
      },
    }));
  });
};

export const createInteractionSlice: StateCreator<Slice, [], [], Slice> = (set) => {
  ensureSystemListeners(set as (fn: (state: Slice) => Partial<Slice>) => void);
  subscribeDefaultAutomation(() => {
    const system = getDefaultAutomationSystem();
    const state = system.getState();
    set((current) => ({
      automation: {
        ...state,
        queue: { ...state.queue, actions: [...state.queue.actions] },
        settings: { ...state.settings },
        executionStats: { ...state.executionStats, errors: [...state.executionStats.errors] },
      },
      config: { ...current.config, automation: system.getConfig() },
      metrics: { ...current.metrics, automation: { ...system.getMetrics() } },
    }));
  });
  return ({
  interaction: createDefaultInteractionState(),
  automation: createDefaultAutomationState(),
  bridge: createDefaultBridgeState(),
  config: {
    interaction: createDefaultInteractionConfig(),
    automation: createDefaultAutomationConfig()
  },
  metrics: {
    interaction: createDefaultInteractionMetrics(),
    automation: createDefaultAutomationMetrics()
  },

  dispatchInput: (updates) => {
    getDefaultInteractionInputBackend().updateMouse(updates);
  },

  addAutomationAction: (action) => InteractionBridge.getGlobal().getAutomationSystem().addAction(action),
  removeAutomationAction: (id) => { getDefaultAutomationSystem().removeAction(id); },
  startAutomation: () => { void InteractionBridge.getGlobal().getAutomationSystem().start(); },
  pauseAutomation: () => getDefaultAutomationSystem().pause(),
  resumeAutomation: () => getDefaultAutomationSystem().resume(),
  stopAutomation: () => getDefaultAutomationSystem().stop(),
  clearAutomationQueue: () => getDefaultAutomationSystem().clearQueue(),
  updateAutomationSettings: (settings) => getDefaultAutomationSystem().updateSettings(settings),

  updateInteractionConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        interaction: { ...state.config.interaction, ...config }
      }
    })),

  updateAutomationConfig: (config) => getDefaultAutomationSystem().updateConfig(config),

  updateInteractionMetrics: (metrics) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        interaction: { ...state.metrics.interaction, ...metrics }
      }
    })),

  updateAutomationMetrics: (metrics) =>
    set((state) => ({
      metrics: {
        ...state.metrics,
        automation: { ...state.metrics.automation, ...metrics }
      }
    })),

  setBridgeStatus: (status) =>
    set((state) => ({
      bridge: { ...state.bridge, syncStatus: status }
    })),

  addCommandToHistory: (command) =>
    set((state) => ({
      bridge: {
        ...state.bridge,
        lastCommand: command,
        commandHistory: [...state.bridge.commandHistory, command].slice(-100)
      }
    })),

  resetInteractions: () => {
    getDefaultAutomationSystem().reset();
    set(() => ({
      interaction: createDefaultInteractionState(),
      automation: createDefaultAutomationState(),
      bridge: createDefaultBridgeState(),
      config: {
        interaction: createDefaultInteractionConfig(),
        automation: createDefaultAutomationConfig()
      },
      metrics: {
        interaction: createDefaultInteractionMetrics(),
        automation: createDefaultAutomationMetrics()
      }
    }));
  },

  updateMouse: (updates) => {
    getDefaultInteractionInputBackend().updateMouse(updates);
  },

  updateKeyboard: (updates) => {
    getDefaultInteractionInputBackend().updateKeyboard(updates);
  },

  updateGamepad: (updates) => {
    getDefaultInteractionInputBackend().updateGamepad?.(updates);
  },

  updateTouch: (updates) => {
    getDefaultInteractionInputBackend().updateTouch?.(updates);
  },

  setInteractionActive: (active) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        isActive: active
      }
    }))
});
};
