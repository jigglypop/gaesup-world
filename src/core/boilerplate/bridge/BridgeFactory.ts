import { BridgeConstructor, BridgeInstance } from '../types'
import { BridgeRegistry } from './BridgeRegistry'
import { DIContainer } from '../di'
import { logger } from '../../utils/logger'

const isProduction = process.env['NODE_ENV'] === 'production'
const enableLogs = !isProduction && process.env['VITE_ENABLE_BRIDGE_LOGS'] !== 'false'

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
            logger.error(`[BridgeFactory] Failed to create bridge for domain: ${domain}`, error)
            return null
        }
    }
    static get<T extends BridgeInstance>(domain: string): T | null {
        const instance = BridgeFactory.instances.get(domain)
        return instance ? (instance as T) : null
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
        }
    }
    
    static disposeAll(): void {
        logger.info(`[BridgeFactory] Disposing all bridge instances (${BridgeFactory.instances.size} total)`)
        BridgeFactory.instances.forEach((instance, domain) => {
            logger.info(`[BridgeFactory] Disposing: ${domain}`)
            instance.dispose()
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