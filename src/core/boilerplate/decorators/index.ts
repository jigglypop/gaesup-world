import 'reflect-metadata'
import { BridgeRegistry } from '../bridge/BridgeRegistry'
import { DIContainer } from '../di'
import { Constructor } from '../types'
import { EnableEventLog, DebugLog, PerformanceLog } from './advanced'

export function DomainBridge(domain: string) {
    return function <T extends Constructor>(target: T) {
        Reflect.defineMetadata('domain', domain, target)
        BridgeRegistry.register(domain, target)
        DIContainer.getInstance().registerService(target)
    }
}

export function Command(name: string) {
    return function (target: object, propertyKey: string) {
        const commands = Reflect.getMetadata('commands', target) || []
        commands.push({ name, method: propertyKey })
        Reflect.defineMetadata('commands', commands, target)
    }
}

export { EnableEventLog, DebugLog, PerformanceLog };
export * from './advanced';
export * from './bridge';
export * from './system';
export * from './monitoring';
export * from './blueprint';
export * from './types';
