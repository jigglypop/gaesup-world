import { BridgeConstructor, BridgeInstance, RuntimeValue } from '../types'
import { BridgeRegistry } from './BridgeRegistry'
import { logger } from '../../utils/logger'
import { DIContainer } from '../di'

/** @DomainBridge classes are DI singletons; drop the cached instance so a disposed bridge is never handed out again. */
function releaseDomainSingleton(domain: string): void {
    const BridgeClass = BridgeRegistry.get(domain)
    if (BridgeClass) DIContainer.getInstance().releaseSingleton(BridgeClass)
}

export class BridgeFactory {
    private static instances = new Map<string, BridgeInstance>()
    static create<T extends BridgeInstance>(domain: string): T | null {
        const existing = BridgeFactory.instances.get(domain)
        if (existing) {
            return existing as T
        }
        const BridgeClass = BridgeRegistry.get(domain) as BridgeConstructor | undefined
        if (!BridgeClass) {
            logger.error(`[BridgeFactory] No bridge registered for domain: ${domain}`)
            return null
        }
        try {
            const instance = DIContainer.getInstance().resolve(BridgeClass) as T
            BridgeFactory.instances.set(domain, instance)
            logger.info(`[BridgeFactory] Created bridge instance for domain: ${domain}`)
            return instance
        } catch (error) {
            logger.error(
              `[BridgeFactory] Failed to create bridge for domain: ${domain}`,
              error instanceof Error ? error : String(error),
            )
            return null
        }
    }
    static get<T extends BridgeInstance>(domain: string): T | null {
        const instance = BridgeFactory.instances.get(domain)
        return instance ? (instance as T) : null
    }

    static getOrCreate<T extends BridgeInstance>(domain: string): T | null {
        return BridgeFactory.get<T>(domain) ?? BridgeFactory.create<T>(domain)
    }

    /** Resolves a @DomainBridge class by value so bundlers keep it; re-registers when its import-time registration was dropped. */
    static getOrCreateFor<T extends BridgeInstance>(bridge: new (...args: RuntimeValue[]) => T): T | null {
        const domain: unknown = Reflect.getMetadata('domain', bridge)
        if (typeof domain !== 'string') return null
        const existing = BridgeFactory.get<T>(domain)
        if (existing) return existing
        if (BridgeRegistry.get(domain) !== bridge) BridgeRegistry.register(domain, bridge)
        return BridgeFactory.create<T>(domain)
    }
    
    static has(domain: string): boolean {
        return BridgeFactory.instances.has(domain)
    }
    
    static dispose(domain: string): void {
        const instance = BridgeFactory.instances.get(domain)
        if (instance) {
            logger.info(`[BridgeFactory] Disposing bridge instance for domain: ${domain}`)
            instance.dispose()
            BridgeFactory.instances.delete(domain)
            releaseDomainSingleton(domain)
        }
    }
    
    static disposeAll(): void {
        logger.info(`[BridgeFactory] Disposing all bridge instances (${BridgeFactory.instances.size} total)`)
        BridgeFactory.instances.forEach((instance, domain) => {
            logger.info(`[BridgeFactory] Disposing: ${domain}`)
            instance.dispose()
            releaseDomainSingleton(domain)
        })
        BridgeFactory.instances.clear()
    }
    
    static listDomains(): string[] {
        return BridgeRegistry.list()
    }
    
    static listActiveInstances(): string[] {
        return Array.from(BridgeFactory.instances.keys())
    }
    
    static getInstanceCount(): number {
        return BridgeFactory.instances.size
    }
} 
