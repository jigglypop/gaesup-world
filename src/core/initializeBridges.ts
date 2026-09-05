import './motions/bridge/MotionBridge';
import './motions/bridge/PhysicsBridge';
import './world/bridge/WorldBridge';
import './animation/bridge/AnimationBridge';

// Register bridge domains via decorators (no eager instantiation).
// Bridge instances should be created lazily via BridgeFactory.getOrCreate()/create().