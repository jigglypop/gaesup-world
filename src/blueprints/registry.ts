import { FIRE_MAGE_BLUEPRINT } from './characters/mage';
import { WARRIOR_BLUEPRINT } from './characters/warrior';
import { AnyBlueprint } from './types';
import { BASIC_KART_BLUEPRINT } from './vehicles/kart';

class BlueprintRegistry {
  private static instance: BlueprintRegistry;
  private blueprints: Map<string, AnyBlueprint> = new Map();

  private constructor() {
    this.registerDefaults();
  }

  static getInstance(): BlueprintRegistry {
    if (!BlueprintRegistry.instance) {
      BlueprintRegistry.instance = new BlueprintRegistry();
    }
    return BlueprintRegistry.instance;
  }

  private registerDefaults(): void {
    this.register(WARRIOR_BLUEPRINT);
    this.register(FIRE_MAGE_BLUEPRINT);
    this.register(BASIC_KART_BLUEPRINT);
  }

  register(blueprint: AnyBlueprint): void {
    this.blueprints.set(blueprint.id, blueprint);
  }

  get(id: string): AnyBlueprint | undefined {
    return this.blueprints.get(id);
  }

  getByType<T extends AnyBlueprint>(type: T['type']): T[] {
    const results: T[] = [];
    this.blueprints.forEach((blueprint) => {
      if (blueprint.type === type) {
        results.push(blueprint as T);
      }
    });
    return results;
  }

  getAll(): AnyBlueprint[] {
    return Array.from(this.blueprints.values());
  }

  has(id: string): boolean {
    return this.blueprints.has(id);
  }

  remove(id: string): boolean {
    return this.blueprints.delete(id);
  }

  clear(): void {
    this.blueprints.clear();
  }
}

export const blueprintRegistry = BlueprintRegistry.getInstance(); 