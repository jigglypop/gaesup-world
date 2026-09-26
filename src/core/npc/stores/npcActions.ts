import { DEFAULT_NPC_BEHAVIOR, DEFAULT_NPC_BRAIN } from './npcDefaults';
import type { NPCStore } from './npcStoreTypes';
import type { NPCAction, NPCBehaviorConfig, NPCInstance } from '../types';

export function getIdleAnimation(instance: NPCInstance): string {
  return instance.behavior?.idleAnimation ?? instance.behavior?.arriveAnimation ?? 'idle';
}

function getMoveAnimation(instance: NPCInstance, speed: number): string {
  return instance.behavior?.moveAnimation ?? (speed >= 3.8 ? 'run' : 'walk');
}

export function withBehavior(instance: NPCInstance, behavior: Partial<NPCBehaviorConfig>): NPCInstance {
  const nextBehavior = { ...(instance.behavior ?? DEFAULT_NPC_BEHAVIOR), ...behavior };
  const next: NPCInstance = { ...instance, behavior: nextBehavior };
  if (nextBehavior.mode === 'idle') {
    next.currentAnimation = nextBehavior.idleAnimation ?? 'idle';
    delete next.navigation;
  } else if (behavior.moveAnimation !== undefined) {
    next.currentAnimation = behavior.moveAnimation;
  }
  return next;
}

export function withNavigation(instance: NPCInstance, waypoints: [number, number, number][], speed: number): NPCInstance {
  return {
    ...instance,
    navigation: { waypoints, currentIndex: 0, speed, state: 'moving' },
    currentAnimation: getMoveAnimation(instance, speed),
  };
}

export function withoutNavigation(instance: NPCInstance): NPCInstance {
  const next: NPCInstance = { ...instance, currentAnimation: getIdleAnimation(instance) };
  delete next.navigation;
  return next;
}

/**
 * Applies one action to the draft. Every action is one instance replacement, so a list of actions, or a whole
 * decision tick, is a single store update instead of one or more per action.
 */
export function applyNPCAction(state: NPCStore, instanceId: string, action: NPCAction, invalidateBrain: (id?: string) => void): void {
  const instance = state.instances.get(instanceId);
  if (!instance) return;
  const speed = action.type === 'moveTo' || action.type === 'patrol' || action.type === 'wander'
    ? action.speed ?? instance.behavior?.speed ?? DEFAULT_NPC_BEHAVIOR.speed
    : 0;
  let next: NPCInstance;
  switch (action.type) {
    case 'idle':
      next = withoutNavigation(withBehavior(instance, {
        mode: 'idle',
        ...(action.animationId ? { idleAnimation: action.animationId, arriveAnimation: action.animationId } : {}),
      }));
      if (action.animationId) next.currentAnimation = action.animationId;
      break;
    case 'moveTo':
      next = withNavigation(
        action.animationId ? withBehavior(instance, { moveAnimation: action.animationId }) : instance,
        [action.target],
        speed,
      );
      break;
    case 'patrol':
      if (action.waypoints.length === 0) return;
      next = withNavigation(withBehavior(instance, {
        mode: 'patrol',
        waypoints: action.waypoints,
        speed,
        loop: action.loop ?? instance.behavior?.loop ?? true,
        ...(action.animationId ? { moveAnimation: action.animationId } : {}),
      }), action.waypoints, speed);
      break;
    case 'wander':
      next = withBehavior(instance, {
        mode: 'wander',
        speed,
        wanderRadius: action.radius ?? instance.behavior?.wanderRadius ?? DEFAULT_NPC_BEHAVIOR.wanderRadius ?? 4,
        waitSeconds: action.waitSeconds ?? instance.behavior?.waitSeconds ?? DEFAULT_NPC_BEHAVIOR.waitSeconds ?? 1.5,
      });
      break;
    case 'playAnimation': {
      // The catalog entry is shared by every NPC and saved, so one NPC's action does not rewrite it.
      next = { ...instance, currentAnimation: action.animationId };
      break;
    }
    case 'lookAt':
      next = {
        ...instance,
        rotation: [
          instance.rotation[0],
          Math.atan2(action.target[0] - instance.position[0], action.target[2] - instance.position[2]),
          instance.rotation[2],
        ],
      };
      break;
    case 'speak':
      // Speech is transient: NPCSimulation.speak shows it, and nothing about it is stored or saved.
      return;
    case 'interact':
      next = { ...instance, metadata: { ...instance.metadata, lastInteractionTargetId: action.targetId } };
      break;
    case 'remember':
      invalidateBrain(instanceId);
      next = {
        ...instance,
        brain: {
          ...(instance.brain ?? DEFAULT_NPC_BRAIN),
          memory: { ...(instance.brain?.memory ?? {}), [action.key]: action.value },
        },
      };
      break;
    default:
      return;
  }
  state.instances.set(instanceId, next);
}
