import 'reflect-metadata'
import { BridgeRegistry } from '../bridge/BridgeRegistry'
import { Constructor } from './types'

export function DomainBridge(domain: string) {
    return function <T extends Constructor>(target: T) {
        Reflect.defineMetadata('domain', domain, target)
        BridgeRegistry.register(domain, target)
    }
}

export function Command(name: string) {
    return function (target: object, propertyKey: string) {
        const commands = Reflect.getMetadata('commands', target) || []
        commands.push({ name, method: propertyKey })
        Reflect.defineMetadata('commands', commands, target)
    }
}

export function Autowired() {
    return function (target: object, propertyKey: string) {
        const autowired = Reflect.getMetadata('autowired', target) || []
        autowired.push(propertyKey)
        Reflect.defineMetadata('autowired', autowired, target)
    }
}

export function EnableMetrics() {
    return function <T extends Constructor>(target: T) {
        Reflect.defineMetadata('enableMetrics', true, target.prototype)
    }
}

export * from './di';
export * from './blueprint';
export * from './types'; 