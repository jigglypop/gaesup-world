import 'reflect-metadata'
import { BridgeClass } from '../types'
export class BridgeRegistry {
    private static registry: Map<string, BridgeClass> = new Map()
    static register(domain: string, clazz: BridgeClass): void {
        BridgeRegistry.registry.set(domain, clazz)
    }
    static get(domain: string): BridgeClass | undefined {
        return BridgeRegistry.registry.get(domain)
    }
    static list(): string[] {
        return [...BridgeRegistry.registry.keys()]
    }
} 