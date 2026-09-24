import 'reflect-metadata'
import type { ServiceTarget } from '../../types'

export function EnableMetrics() {
  return function <T extends ServiceTarget<object>>(target: T) {
    Reflect.defineMetadata('enableMetrics', true, target.prototype)
  }
}
