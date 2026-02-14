import { BaseSystem } from './BaseSystem';

class Registry {
  private systems: Map<string, BaseSystem> = new Map();

  private safeDispose(system: unknown): void {
    if (typeof system !== 'object' || system === null) return;
    const dispose = (system as { dispose?: unknown }).dispose;
    if (typeof dispose !== 'function') return;

    try {
      dispose.call(system);
    } catch {
      // registry cleanups must be best-effort
    }
  }

  register(type: string, system: BaseSystem): void {
    if (this.systems.has(type)) {
      console.warn(`System with type "${type}" is already registered. Overwriting.`);
    }
    this.systems.set(type, system);
  }

  get(type: string): BaseSystem | undefined {
    return this.systems.get(type);
  }

  getAll(): Map<string, BaseSystem> {
    return this.systems;
  }

  unregister(type: string): void {
    if (!this.systems.has(type)) return;
    const system = this.systems.get(type);
    this.safeDispose(system);
    this.systems.delete(type);
  }

  clear(): void {
    this.systems.forEach((system) => this.safeDispose(system));
    this.systems.clear();
  }
}

export const SystemRegistry = new Registry(); 