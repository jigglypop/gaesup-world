import { AutomationSystem } from './AutomationSystem';

let system: AutomationSystem | null = null;
const listeners = new Set<() => void>();

export function getDefaultAutomationSystem(): AutomationSystem {
  if (!system || system.isDisposed) {
    system = new AutomationSystem(true);
    system.addEventListener('stateChanged', () => {
      for (const listener of listeners) listener();
    });
  }
  return system;
}

export function subscribeDefaultAutomation(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
