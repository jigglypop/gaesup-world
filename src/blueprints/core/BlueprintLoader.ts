import { BlueprintDefinition } from './types';

export class BlueprintLoader {
  private static blueprints = new Map<string, BlueprintDefinition>();

  static async load(path: string): Promise<BlueprintDefinition> {
    try {
      const response = await fetch(path);
      const blueprint = await response.json() as BlueprintDefinition;
      this.blueprints.set(blueprint.id, blueprint);
      return blueprint;
    } catch (error) {
      console.error(`Failed to load blueprint from ${path}:`, error);
      throw error;
    }
  }

  static loadFromJSON(json: string | object): BlueprintDefinition {
    const blueprint = typeof json === 'string' ? JSON.parse(json) : json;
    this.blueprints.set(blueprint.id, blueprint);
    return blueprint as BlueprintDefinition;
  }

  static get(id: string): BlueprintDefinition | undefined {
    return this.blueprints.get(id);
  }

  static getAll(): BlueprintDefinition[] {
    return Array.from(this.blueprints.values());
  }

  static clear(): void {
    this.blueprints.clear();
  }
} 