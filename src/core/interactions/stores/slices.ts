import { StateCreator } from 'zustand';
import { StoreState } from '../../stores/types';
import { InteractionSliceState, InteractionActions } from './types';
import { InteractionState, AutomationState, InteractionConfig, AutomationConfig, InteractionMetrics, AutomationMetrics, BridgeState } from '../bridge/types';
import * as THREE from 'three';
import { InteractionSystem } from '../core/InteractionSystem';

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

export const createInteractionSlice: StateCreator<
  StoreState,
  [],
  [],
  InteractionSliceState & InteractionActions
> = (set, get) => ({
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
    const system = InteractionSystem.getInstance();
    system.dispatchInput(updates);
  },

  addAutomationAction: (actionData) => {
    const id = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const action = {
      ...actionData,
      id,
      timestamp: Date.now()
    };

    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          actions: [...state.automation.queue.actions, action]
        }
      }
    }));

    return id;
  },

  removeAutomationAction: (id) =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          actions: state.automation.queue.actions.filter(action => action.id !== id)
        }
      }
    })),

  startAutomation: () =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          isRunning: true,
          isPaused: false
        }
      }
    })),

  pauseAutomation: () =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          isPaused: true
        }
      }
    })),

  resumeAutomation: () =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          isPaused: false
        }
      }
    })),

  stopAutomation: () =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          isRunning: false,
          isPaused: false,
          currentIndex: 0
        },
        currentAction: null
      }
    })),

  clearAutomationQueue: () =>
    set((state) => ({
      automation: {
        ...state.automation,
        queue: {
          ...state.automation.queue,
          actions: [],
          currentIndex: 0
        }
      }
    })),

  updateAutomationSettings: (settings) =>
    set((state) => ({
      automation: {
        ...state.automation,
        settings: { ...state.automation.settings, ...settings }
      }
    })),

  updateInteractionConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        interaction: { ...state.config.interaction, ...config }
      }
    })),

  updateAutomationConfig: (config) =>
    set((state) => ({
      config: {
        ...state.config,
        automation: { ...state.config.automation, ...config }
      }
    })),

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

  resetInteractions: () =>
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
    })),

  updateMouse: (updates) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        mouse: { ...state.interaction.mouse, ...updates }
      }
    })),

  updateKeyboard: (updates) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        keyboard: { ...state.interaction.keyboard, ...updates }
      }
    })),

  updateGamepad: (updates) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        gamepad: { ...state.interaction.gamepad, ...updates }
      }
    })),

  updateTouch: (updates) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        touch: { ...state.interaction.touch, ...updates }
      }
    })),

  setInteractionActive: (active) =>
    set((state) => ({
      interaction: {
        ...state.interaction,
        isActive: active
      }
    }))
});
