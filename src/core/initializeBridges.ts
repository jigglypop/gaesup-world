import { AnimationBridge } from './animation/bridge/AnimationBridge';
import { BridgeRegistry } from './boilerplate/bridge/BridgeRegistry';
import { MotionBridge } from './motions/bridge/MotionBridge';
import { PhysicsBridge } from './motions/bridge/PhysicsBridge';
import { WorldBridge } from './world/bridge/WorldBridge';

export const CORE_BRIDGES = [MotionBridge, PhysicsBridge, WorldBridge, AnimationBridge] as const;

export function initializeBridges(): void {
  for (const bridge of CORE_BRIDGES) {
    const domain: unknown = Reflect.getMetadata('domain', bridge);
    if (typeof domain === 'string' && BridgeRegistry.get(domain) !== bridge) {
      BridgeRegistry.register(domain, bridge);
    }
  }
}
