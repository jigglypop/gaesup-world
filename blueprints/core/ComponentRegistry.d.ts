import { ComponentDefinition, IComponent, ComponentFactory, ComponentRegistry as IComponentRegistry } from './types';
export declare class ComponentRegistry implements IComponentRegistry {
    private factories;
    private static instance;
    static getInstance(): ComponentRegistry;
    register(type: string, factory: ComponentFactory): void;
    create(definition: ComponentDefinition): IComponent | null;
    getFactory(type: string): ComponentFactory | undefined;
    getAllTypes(): string[];
    clear(): void;
}
