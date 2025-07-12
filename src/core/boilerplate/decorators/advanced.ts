import 'reflect-metadata'

type Constructor<T = unknown> = new (...args: unknown[]) => T

export function Validate() {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = function (this: unknown, ...args: unknown[]) {
            const commandName = Reflect.getMetadata('commandName', target, propertyKey)
            if (commandName && args[1] && typeof args[1] === 'object') {
                const command = args[1] as Record<string, unknown>
                if (!command["type"])  throw new Error(`Command validation failed: missing 'type' field`)
            }
            return originalMethod.apply(this, args)
        }
    }
}

export function DebugLog() {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = function (this: unknown, ...args: unknown[]) {
            console.log(`[${propertyKey}] called with:`, args)
            const result = originalMethod.apply(this, args)
            console.log(`[${propertyKey}] returned:`, result)
            return result
        }
    }
}

export function PerformanceLog() {
    return function (target: object, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value
        descriptor.value = function (this: unknown, ...args: unknown[]) {
            const start = performance.now()
            const result = originalMethod.apply(this, args)
            const duration = performance.now() - start
            console.log(`[${propertyKey}] took ${duration.toFixed(2)}ms`)
            return result
        }
    }
}

export function EnableEventLog() {
    return function <T extends Constructor>(target: T) {
        Reflect.defineMetadata('enableEventLog', true, target.prototype)
    }
}

export function Singleton<T extends Constructor>(target: T) {
    let instance: T | null = null
    return new Proxy(target, {
        construct(t, args) {
            if (!instance) {
                instance = new t(...args) as T
            }
            return instance
        }
    }) as T
} 