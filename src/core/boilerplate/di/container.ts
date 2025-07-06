import 'reflect-metadata'
import { Constructor, Factory, Token } from '../types'

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

  register<T>(token: Token<T>, factory: Factory<T>, options?: { singleton?: boolean }): void {
    this.factories.set(token, factory as Factory<unknown>)
    if (options?.singleton === false) {
      this.singletons.delete(token)
    }
  }

  registerClass<T>(ClassConstructor: Constructor<T>, options?: { singleton?: boolean }): void {
    const factory = () => this.createInstance(ClassConstructor)
    this.register(ClassConstructor, factory, options)
  }

  resolve<T>(token: Token<T>): T {
    if (this.resolving.has(token)) {
      throw new Error(`Circular dependency detected: ${String(token)}`)
    }

    if (this.singletons.has(token)) {
      return this.singletons.get(token) as T
    }

    const factory = this.factories.get(token)
    if (!factory) {
      throw new Error(`No factory registered for token: ${String(token)}`)
    }

    this.resolving.add(token)
    try {
      const instance = factory() as T
      this.singletons.set(token, instance)
      return instance
    } finally {
      this.resolving.delete(token)
    }
  }

  private createInstance<T>(ClassConstructor: Constructor<T>): T {
    const paramTypes = Reflect.getMetadata('design:paramtypes', ClassConstructor) || []
    const params = paramTypes.map((paramType: Constructor) => {
      try {
        return this.resolve(paramType)
      } catch {
        return undefined
      }
    })
    const instance = new ClassConstructor(...params)
    this.autowireProperties(instance as object)
    return instance
  }

  private autowireProperties(instance: object): void {
    const prototype = Object.getPrototypeOf(instance)
    const autowiredProps = Reflect.getMetadata('autowired', prototype) || []
    autowiredProps.forEach((prop: string) => {
      const propertyType = Reflect.getMetadata('design:type', prototype, prop)
      // propertyType is kept for future resolve logic
    })
  }

  clear(): void {
    this.factories.clear()
    this.singletons.clear()
    this.resolving.clear()
  }
} 