import 'reflect-metadata'
import { logger } from '../../utils/logger'
import { Constructor, Factory, ServiceTarget, Token } from '../types'

function getTokenName(token: Token<unknown>): string {
  if (typeof token === 'function') {
    return token.name
  }
  if (typeof token === 'symbol') {
    return token.toString()
  }
  return String(token)
}

export class DIContainer {
  private static instance: DIContainer
  private factories = new Map<Token<unknown>, Factory<unknown>>()
  private singletons = new Map<Token<unknown>, unknown>()
  private resolving = new Set<Token<unknown>>()

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  register<T>(token: Token<T>, factory: Factory<T>, singleton = true): void {
    this.factories.set(token, factory as Factory<unknown>)
    if (!singleton) {
      this.singletons.delete(token)
    }
  }

  registerService<T>(ServiceConstructor: ServiceTarget<T>): void {
    const token = Reflect.getMetadata('di:token', ServiceConstructor) || ServiceConstructor
    
    if (this.factories.has(token)) {
      return
    }

    const isSingleton = Reflect.getMetadata('di:singleton', ServiceConstructor) ?? true
    const factory = () => this.createInstance(ServiceConstructor as Constructor<T>)
    this.register(token, factory, isSingleton)
  }

  resolve<T>(token: Token<T>): T {
    if (this.resolving.has(token)) {
      const path = Array.from(this.resolving).map(getTokenName).join(' -> ')
      throw new Error(`DIContainer: Circular dependency detected: ${path} -> ${getTokenName(token)}`)
    }

    const isSingleton = !this.singletons.has(token)
    if (isSingleton) {
        const factory = this.factories.get(token)
        if (factory) {
            this.resolving.add(token)
            try {
                const instance = factory() as T
                this.singletons.set(token, instance)
                return instance
            } finally {
                this.resolving.delete(token)
            }
        }
    }
    
    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T
    }

    const factory = this.factories.get(token)
    if (!factory) {
      if (typeof token === 'function' && 'prototype' in token) {
        this.registerService(token as ServiceTarget<T>)
        return this.resolve(token)
      }
      throw new Error(`DIContainer: No factory registered for token: ${getTokenName(token)}`)
    }

    this.resolving.add(token)
    try {
      return factory() as T
    } finally {
      this.resolving.delete(token)
    }
  }

  private createInstance<T>(ClassConstructor: Constructor<T>): T {
    const paramTokens: Token<unknown>[] = Reflect.getMetadata('di:paramtypes', ClassConstructor) || []
    const paramTypes: Constructor[] = Reflect.getMetadata('design:paramtypes', ClassConstructor) || []

    const params = paramTypes.map((paramType, index) => {
      const token = paramTokens[index] || paramType
      if (!token) {
        throw new Error(`DIContainer: Cannot resolve dependency for parameter ${index} of ${ClassConstructor.name}. Type is not inferable and no @Inject decorator found.`);
      }
      try {
        return this.resolve(token)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        logger.error(`DIContainer: Failed to resolve parameter ${index} (${getTokenName(token)}) for ${ClassConstructor.name}.`, errorMessage)
        throw new Error(`Could not construct ${ClassConstructor.name}.`)
      }
    })

    const instance = new ClassConstructor(...params)
    this.autowireProperties(instance as object)
    return instance
  }

  public injectProperties(instance: object): void {
    this.autowireProperties(instance)
  }

  private autowireProperties(instance: object): void {
    const constructor = instance.constructor as Constructor
    const autowiredProps = Reflect.getMetadata('autowired', constructor.prototype) || []

    for (const prop of autowiredProps) {
        const propertyType = Reflect.getMetadata('design:type', instance, prop)
        if (propertyType) {
            try {
                (instance as Record<string, unknown>)[prop] = this.resolve(propertyType)
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                logger.warn(`DIContainer: Failed to autowire property '${prop}' on '${constructor.name}'.`, errorMessage)
            }
        }
    }

    const injectedProps = Reflect.getMetadata('di:properties', constructor) || {}
    for (const prop in injectedProps) {
        const token = injectedProps[prop]
        try {
            (instance as Record<string, unknown>)[prop] = this.resolve(token)
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            logger.warn(`DIContainer: Failed to inject property '${prop}' with token '${String(token)}' on '${constructor.name}'.`, errorMessage)
        }
    }
  }

  clear(): void {
    this.factories.clear()
    this.singletons.clear()
    this.resolving.clear()
  }
} 