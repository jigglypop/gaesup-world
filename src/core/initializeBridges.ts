import './motions/bridge/MotionBridge';
import './motions/bridge/PhysicsBridge';
import './world/bridge/WorldBridge';
import './animation/bridge/AnimationBridge';

import { BridgeFactory } from './boilerplate';

const domains = BridgeFactory.listDomains();

domains.forEach((domain) => {
  if (BridgeFactory.has(domain)) return;
  BridgeFactory.create(domain);
});