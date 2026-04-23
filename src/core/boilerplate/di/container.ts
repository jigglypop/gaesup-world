import 'reflect-metadata'
import { logger } from '../../utils/logger'
import { Constructor, Factory, RuntimeValue, ServiceTarget, Token } from '../types'

function getTokenName(token: Token<object>): string {
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
  private factories = new Map<Token<object>, Factory<RuntimeValue>>()
  private singletons = new Map<Token<object>, RuntimeValue>()
  private singletonTokens = new Set<Token<object>>()
  private resolving = new Set<Token<object>>()

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  register<T>(token: Token<T>, factory: Factory<T>, singleton = true): void {
    this.factories.set(token as Token<object>, () => factory() as RuntimeValue)
    if (singleton) {
      this.singletonTokens.add(token as Token<object>)
    } else {
      this.singletonTokens.delete(token as Token<object>)
      this.singletons.delete(token as Token<object>)
    }
  }

  registerService<T extends object>(ServiceConstructor: ServiceTarget<T>): void {
    const token = (Reflect.getMetadata('di:token', ServiceConstructor) as Token<object> | undefined) || ServiceConstructor
    
    if (this.factories.has(token)) {
      return
    }

    const isSingleton = Reflect.getMetadata('di:singleton', ServiceConstructor) ?? true
    const factory = () => this.createInstance(ServiceConstructor as Constructor<T>)
    this.register(token, factory, isSingleton)
  }

  resolve<T>(token: Token<T>): T {
    if (this.resolving.has(token as Token<object>)) {
      const path = Array.from(this.resolving).map(getTokenName).join(' -> ');
      const errorMessage = `DIContainer: Circular dependency detected: ${path} -> ${getTokenName(
        token as Token<object>
      )}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    if (this.singletons.has(token as Token<object>)) {
      return this.singletons.get(token as Token<object>) as T
    }

    const factory = this.factories.get(token as Token<object>)
    if (!factory) {
      if (typeof token === 'function' && 'prototype' in token) {
        this.registerService(token as ServiceTarget<object>)
        return this.resolve(token)
      }
      throw new Error(`DIContainer: No factory registered for token: ${getTokenName(token)}`)
    }

    this.resolving.add(token as Token<object>)
    try {
      const instance = factory() as T
      if (this.singletonTokens.has(token as Token<object>)) {
        this.singletons.set(token as Token<object>, instance as RuntimeValue)
      }
      return instance
    } finally {
      this.resolving.delete(token as Token<object>)
    }
  }

  private createInstance<T>(ClassConstructor: Constructor<T>): T {
    const paramTokens: Token<object>[] = Reflect.getMetadata('di:paramtypes', ClassConstructor) || []
    const paramTypes: Constructor[] = Reflect.getMetadata('design:paramtypes', ClassConstructor) || []

    const params = paramTypes.map((paramType, index) => {
      const token = paramTokens[index] || paramType
      if (!token) {
        throw new Error(`DIContainer: Cannot resolve dependency for parameter ${index} of ${ClassConstructor.name}. Type is not inferable and no @Inject decorator found.`);
      }
      try {
        return this.resolve(token)
      } catch (error) {
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
    const autowiredProps =
      Reflect.getMetadata('autowired', constructor) ||
      Reflect.getMetadata('autowired', constructor.prototype) ||
      []

    for (const prop of autowiredProps) {
        const propertyType =
          Reflect.getMetadata('design:type', constructor.prototype, prop) ||
          Reflect.getMetadata('design:type', instance, prop)
        if (propertyType) {
            try {
                (instance as Record<string, RuntimeValue>)[prop] = this.resolve(propertyType)
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error)
                logger.warn(`DIContainer: Failed to autowire property '${prop}' on '${constructor.name}'.`, errorMessage)
            }
        }
    }

    const injectedProps = Reflect.getMetadata('di:properties', constructor) || {}
    for (const prop in injectedProps) {
        const token = injectedProps[prop] as Token<object>
        try {
            (instance as Record<string, RuntimeValue>)[prop] = this.resolve(token)
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error)
            logger.warn(`DIContainer: Failed to inject property '${prop}' with token '${String(token)}' on '${constructor.name}'.`, errorMessage)
        }
    }
  }

  clear(): void {
    this.factories.clear()
    this.singletons.clear()
    this.singletonTokens.clear()
    this.resolving.clear()
  }
} 
