import { BaseSystem } from './BaseSystem';

const shouldWarnOnOverwrite = process.env.NODE_ENV !== 'test';

class Registry {
  private systems: Map<string, BaseSystem> = new Map();

  private safeDispose(system: BaseSystem | undefined): void {
    if (!system) return;

    try {
      system.dispose();
    } catch {
      // registry cleanups must be best-effort
    }
  }

  register(type: string, system: BaseSystem): void {
    const existing = this.systems.get(type);
    if (existing === system) return;
    if (existing && shouldWarnOnOverwrite) {
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
