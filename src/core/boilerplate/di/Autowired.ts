import 'reflect-metadata'

export function Autowired() {
  return function (target: object, propertyKey: string) {
    const autowired = Reflect.getMetadata('autowired', target) || []
    autowired.push(propertyKey)
    Reflect.defineMetadata('autowired', autowired, target)
  }
} 