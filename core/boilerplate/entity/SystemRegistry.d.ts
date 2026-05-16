import { BaseSystem } from './BaseSystem';
declare class Registry {
    private systems;
    private safeDispose;
    register(type: string, system: BaseSystem): void;
    get(type: string): BaseSystem | undefined;
    getAll(): Map<string, BaseSystem>;
    unregister(type: string): void;
    clear(): void;
}
export declare const SystemRegistry: Registry;
export {};
