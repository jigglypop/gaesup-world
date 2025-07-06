import 'reflect-metadata'

export function Service(token?: string | symbol) {
  return function <T extends new (...args: any[]) => any>(target: T) {
    const serviceToken = token || target
    Reflect.defineMetadata('service:token', serviceToken, target)
    Reflect.defineMetadata('service:singleton', true, target)
    return target
  }
} 