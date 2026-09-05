import { ComponentDefinition, IComponent, ComponentFactory, ComponentRegistry as IComponentRegistry } from './types';

export class ComponentRegistry implements IComponentRegistry {
  private factories = new Map<string, ComponentFactory>();
  private static instance: ComponentRegistry | null = null;

  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  register(type: string, factory: ComponentFactory): void {
    this.factories.set(type, factory);
  }

  create(definition: ComponentDefinition): IComponent | null {
    const factory = this.factories.get(definition.type);
    if (!factory) {
      console.warn(`Component factory not found for type: ${definition.type}`);
      return null;
    }
    
    const component = factory(definition.properties);
    component.enabled = definition.enabled;
    return component;
  }

  getFactory(type: string): ComponentFactory | undefined {
    return this.factories.get(type);
  }

  getAllTypes(): string[] {
    return Array.from(this.factories.keys());
  }

  clear(): void {
    this.factories.clear();
  }
} 