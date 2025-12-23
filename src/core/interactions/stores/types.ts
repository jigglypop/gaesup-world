import { InteractionState, AutomationState, InteractionConfig, AutomationConfig, InteractionMetrics, AutomationMetrics, BridgeState } from '../bridge/types';
import { MouseState } from '../core/InteractionSystem';

export interface InteractionSliceState {
  interaction: InteractionState;
  automation: AutomationState;
  bridge: BridgeState;
  config: {
    interaction: InteractionConfig;
    automation: AutomationConfig;
  };
  metrics: {
    interaction: InteractionMetrics;
    automation: AutomationMetrics;
  };
}

export interface InteractionActions {
  updateKeyboard: (updates: Partial<InteractionState['keyboard']>) => void;
  updateMouse: (updates: Partial<InteractionState['mouse']>) => void;
  updateGamepad: (updates: Partial<InteractionState['gamepad']>) => void;
  updateTouch: (updates: Partial<InteractionState['touch']>) => void;
  setInteractionActive: (active: boolean) => void;
  addAutomationAction: (action: Omit<AutomationState['queue']['actions'][0], 'id' | 'timestamp'>) => string;
  removeAutomationAction: (id: string) => void;
  startAutomation: () => void;
  pauseAutomation: () => void;
  resumeAutomation: () => void;
  stopAutomation: () => void;
  clearAutomationQueue: () => void;
  updateAutomationSettings: (settings: Partial<AutomationState['settings']>) => void;
  updateInteractionConfig: (config: Partial<InteractionConfig>) => void;
  updateAutomationConfig: (config: Partial<AutomationConfig>) => void;
  updateInteractionMetrics: (metrics: Partial<InteractionMetrics>) => void;
  updateAutomationMetrics: (metrics: Partial<AutomationMetrics>) => void;
  resetInteractions: () => void;
  setBridgeStatus: (status: BridgeState['syncStatus']) => void;
  addCommandToHistory: (command: BridgeState['commandHistory'][0]) => void;
  dispatchInput: (updates: Partial<MouseState>) => void;
}
