import { AnyBlueprint } from './types';
declare class BlueprintRegistry {
    private static instance;
    private blueprints;
    private constructor();
    static getInstance(): BlueprintRegistry;
    private registerDefaults;
    register(blueprint: AnyBlueprint): void;
    get(id: string): AnyBlueprint | undefined;
    getByType<T extends AnyBlueprint>(type: T['type']): T[];
    getAll(): AnyBlueprint[];
    has(id: string): boolean;
    remove(id: string): boolean;
    clear(): void;
}
export declare const blueprintRegistry: BlueprintRegistry;
export {};
