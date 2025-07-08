import 'reflect-metadata'
import { BridgeRegistry } from '../bridge/BridgeRegistry'
import { DIContainer } from '../di'
import { Constructor } from '../types'
import { EnableEventLog, Log, Performance } from './advanced'

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

export { EnableEventLog, Log, Performance }
export * from '../di/Autowired'
export * from '../di/Inject'
export * from '../di/Service'
export * from './blueprint';
export * from './system';
export * from './bridge';
export * from './monitoring';
