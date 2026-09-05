import 'reflect-metadata'
import { Constructor } from '../types'

export function Autowired() {
  return function (target: object, propertyKey: string) {
    const constructor = target.constructor as Constructor
    const autowired = Reflect.getMetadata('autowired', constructor) || []
    autowired.push(propertyKey)
    Reflect.defineMetadata('autowired', autowired, constructor)
  }
} 