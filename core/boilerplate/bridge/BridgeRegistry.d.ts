import 'reflect-metadata';
import { ServiceTarget } from '../types';
export declare class BridgeRegistry {
    private static registry;
    static register(domain: string, constructor: ServiceTarget): void;
    static get(domain: string): ServiceTarget | undefined;
    static list(): string[];
}
