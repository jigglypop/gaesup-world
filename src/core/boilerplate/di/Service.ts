import 'reflect-metadata'
import { ServiceTarget, Token } from '../types'

export type ServiceOptions = {
  token?: Token<unknown>
  singleton?: boolean
}

export function Service(options: ServiceOptions = {}): (target: ServiceTarget) => void {
  return function (target: ServiceTarget) {
    const { token, singleton = true } = options
    Reflect.defineMetadata('di:token', token || target, target)
    Reflect.defineMetadata('di:singleton', singleton, target)
  }
} 