import 'reflect-metadata'
import { Token } from '../types'

export function Inject(token: Token<object>) {
  return function (target: object, propertyKey: string | symbol | undefined, parameterIndex?: number) {
    if (typeof parameterIndex === 'number') {
      const constructor = target as new (...args: never[]) => object
      const existingTokens = (Reflect.getMetadata('di:paramtypes', constructor) as Array<Token<object>> | undefined) || []
      existingTokens[parameterIndex] = token
      Reflect.defineMetadata('di:paramtypes', existingTokens, constructor)
    } else if (propertyKey) {
      const constructor = target.constructor as new (...args: never[]) => object
      const injectedProperties =
        (Reflect.getMetadata('di:properties', constructor) as Record<PropertyKey, Token<object>> | undefined) || {}
      injectedProperties[propertyKey] = token
      Reflect.defineMetadata('di:properties', injectedProperties, constructor)
    }
  }
} 
