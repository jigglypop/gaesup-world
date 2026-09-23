import type { InteractionSliceServices } from './slices';
import { InteractionBridge } from '../bridge/InteractionBridge';
import { type InputBackend, type InputBackendSnapshot } from '../core/adapter';
import { AutomationSystem } from '../core/AutomationSystem';
import { InteractionSystem } from '../core/InteractionSystem';

/** Store-owned listeners never attach to a process-wide input or automation engine. */
export function createWorldInteractions(inputBackend: InputBackend) {
  const inputListeners = new Set<(snapshot: InputBackendSnapshot) => void>();
  const automationListeners = new Set<() => void>();
  let unsubscribeInput: (() => void) | undefined;
  let automation: AutomationSystem | undefined;
  let interaction: InteractionSystem | undefined;
  let bridge: InteractionBridge | undefined;
  const activate = () => {
    if (unsubscribeInput) return;
    unsubscribeInput = inputBackend.subscribe?.((snapshot) => {
      for (const listener of inputListeners) listener(snapshot);
    });
  };
  const services: InteractionSliceServices = {
    inputBackend,
    getAutomationSystem: () => {
      if (!automation) {
        automation = new AutomationSystem(true);
        automation.addEventListener('stateChanged', () => {
          for (const listener of automationListeners) listener();
        });
        interaction = new InteractionSystem();
        bridge = new InteractionBridge({
          inputBackend,
          interactionSystem: interaction,
          automationSystem: automation,
        });
      }
      return automation;
    },
    subscribeInput: (listener) => {
      inputListeners.add(listener);
    },
    subscribeAutomation: (listener) => {
      automationListeners.add(listener);
    },
  };
  return {
    services,
    activate,
    dispose: () => {
      unsubscribeInput?.();
      unsubscribeInput = undefined;
      const oldAutomation = automation;
      const oldBridge = bridge;
      const oldInteraction = interaction;
      // Stop while the bridge still owns its movement; it clears this world's target.
      oldAutomation?.stop();
      try {
        oldBridge?.dispose();
      } finally {
        try {
          oldAutomation?.dispose();
        } finally {
          oldInteraction?.dispose();
          automation = undefined;
          bridge = undefined;
          interaction = undefined;
        }
      }
    },
  };
}
