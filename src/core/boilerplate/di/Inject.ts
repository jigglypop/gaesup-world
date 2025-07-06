import 'reflect-metadata'

export function Inject(token?: string | symbol) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex?: number) {
    if (parameterIndex !== undefined) {
      // Constructor parameter injection
      const existingTokens = Reflect.getMetadata('inject:tokens', target) || []
      existingTokens[parameterIndex] = token
      Reflect.defineMetadata('inject:tokens', existingTokens, target)
    } else if (propertyKey) {
      // Property injection
      const injectedProps = Reflect.getMetadata('inject:properties', target) || []
      injectedProps.push({ propertyKey, token })
      Reflect.defineMetadata('inject:properties', injectedProps, target)
    }
  }
} 