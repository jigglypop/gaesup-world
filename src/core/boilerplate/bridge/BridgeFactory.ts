import type { BridgeInstance } from '../types'

type BridgeClass<T extends BridgeInstance = BridgeInstance> = new () => T

/** Bridges for callers that run without a runtime: one shared instance per class. A runtime creates its own. */
export class BridgeFactory {
  private static instances = new Map<BridgeClass, BridgeInstance>()

  static getOrCreateFor<T extends BridgeInstance>(Bridge: BridgeClass<T>): T {
    const existing = BridgeFactory.instances.get(Bridge) as T | undefined
    if (existing) return existing
    const created = new Bridge()
    BridgeFactory.instances.set(Bridge, created)
    return created
  }

  static get<T extends BridgeInstance>(Bridge: BridgeClass<T>): T | null {
    return (BridgeFactory.instances.get(Bridge) as T | undefined) ?? null
  }

  /** Drops the cached instance before disposing it, so a later lookup builds a new one. */
  static dispose(Bridge: BridgeClass): void {
    const instance = BridgeFactory.instances.get(Bridge)
    if (!instance) return
    BridgeFactory.instances.delete(Bridge)
    instance.dispose()
  }

  static disposeAll(): void {
    const instances = [...BridgeFactory.instances.values()]
    BridgeFactory.instances.clear()
    instances.forEach((instance) => instance.dispose())
  }
}
