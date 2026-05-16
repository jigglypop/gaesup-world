import { BridgeInstance } from '../types';
export declare class BridgeFactory {
    private static instances;
    static create<T extends BridgeInstance>(domain: string): T | null;
    static get<T extends BridgeInstance>(domain: string): T | null;
    static getOrCreate<T extends BridgeInstance>(domain: string): T | null;
    static has(domain: string): boolean;
    static dispose(domain: string): void;
    static disposeAll(): void;
    static listDomains(): string[];
    static listActiveInstances(): string[];
    static getInstanceCount(): number;
}
