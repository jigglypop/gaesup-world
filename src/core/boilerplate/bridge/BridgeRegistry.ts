import 'reflect-metadata'
import { ServiceTarget } from '../types'

export class BridgeRegistry {
    private static registry = new Map<string, ServiceTarget>()
    static register(domain: string, constructor: ServiceTarget): void {
        if (BridgeRegistry.registry.has(domain)) {
            console.warn(`[BridgeRegistry] Domain '${domain}' is already registered. Overwriting.`)
        }
        BridgeRegistry.registry.set(domain, constructor)
    }
    static get(domain: string): ServiceTarget | undefined {
        return BridgeRegistry.registry.get(domain)
    }
    static list(): string[] {
        return Array.from(BridgeRegistry.registry.keys())
    }
} 