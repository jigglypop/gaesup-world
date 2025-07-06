import 'reflect-metadata'
import { Token } from '../types'

export function Inject(token: Token<unknown>) {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      const constructor = target as new (...args: unknown[]) => unknown
      const existingTokens = Reflect.getMetadata('di:paramtypes', constructor) || []
      existingTokens[parameterIndex] = token
      Reflect.defineMetadata('di:paramtypes', existingTokens, constructor)
    } else if (propertyKey) {
      const constructor = target.constructor as new (...args: unknown[]) => unknown
      const injectedProperties = Reflect.getMetadata('di:properties', constructor) || {}
      injectedProperties[propertyKey] = token
      Reflect.defineMetadata('di:properties', injectedProperties, constructor)
    }
  }
} 