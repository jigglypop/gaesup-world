import 'reflect-metadata'

import type { DecoratedValue } from './types'

type Constructor<T = object> = new (...args: DecoratedValue[]) => T

export function EnableEventLog() {
    return function (...args: Array<object | string>) {
        // Class decorator: @EnableEventLog() class X {}
        if (args.length === 1) {
            const target = args[0] as Constructor
            Reflect.defineMetadata('enableEventLog', true, target.prototype)
            return
        }

        // Method decorator: @EnableEventLog() method() {}
        const [target, propertyKey] = args as [object, string]
        Reflect.defineMetadata('enableEventLog', true, target, propertyKey)
    }
}
