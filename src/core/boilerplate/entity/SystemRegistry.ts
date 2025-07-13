import { BaseSystem } from './BaseSystem';

class Registry {
  private systems: Map<string, BaseSystem> = new Map();

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
    const system = this.systems.get(type);
    if(system) {
      system.dispose();
      this.systems.delete(type);
    }
  }

  clear(): void {
    this.systems.forEach(system => system.dispose());
    this.systems.clear();
  }
}

export const SystemRegistry = new Registry(); 