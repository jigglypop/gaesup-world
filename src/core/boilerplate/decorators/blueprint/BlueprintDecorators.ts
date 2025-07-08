import 'reflect-metadata'
import { blueprintRegistry } from '../../../../blueprints/registry'
import { AnyBlueprint } from '../../../../blueprints/types'

type Constructor<T = unknown> = new (...args: unknown[]) => T

export function Blueprint(blueprintData: Partial<AnyBlueprint>) {
  return function <T extends Constructor>(target: T) {
    const blueprint: AnyBlueprint = {
      id: blueprintData.id || target.name.toLowerCase(),
      name: blueprintData.name || target.name,
      type: blueprintData.type || 'character',
      version: blueprintData.version || '1.0.0',
      tags: blueprintData.tags || [],
      ...blueprintData
    } as AnyBlueprint
    
    Reflect.defineMetadata('blueprint', blueprint, target)
    blueprintRegistry.register(blueprint)
    
    return target
  }
}

export function BlueprintProperty(propertyPath: string) {
  return function (target: object, propertyKey: string) {
    const properties = Reflect.getMetadata('blueprintProperties', target) || {}
    properties[propertyKey] = propertyPath
    Reflect.defineMetadata('blueprintProperties', properties, target)
  }
}

export function FromBlueprint(blueprintId: string) {
  return function (target: object, propertyKey: string) {
    const blueprint = blueprintRegistry.get(blueprintId)
    if (blueprint) {
      Reflect.defineMetadata('fromBlueprint', blueprintId, target, propertyKey)
    }
  }
} 