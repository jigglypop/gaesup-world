import 'reflect-metadata'
import { BridgeRegistry } from '../../bridge/BridgeRegistry'

type Constructor<T = unknown> = new (...args: unknown[]) => T

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

export function EnableMetrics() {
  return function <T extends Constructor>(target: T) {
    Reflect.defineMetadata('enableMetrics', true, target.prototype)
  }
} 