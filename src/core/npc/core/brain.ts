import type {
  NPCBrainConfig,
  NPCBrainBlueprint,
  NPCBrainDecision,
  NPCBrainMode,
  NPCInstance,
  NPCObservation,
  NPCObservationTarget,
} from '../types';
import { compileNPCBrainBlueprint, getNPCBrainBlueprint, type NPCBrainConditionStores } from './blueprint';

type AdapterKey = `${NPCBrainMode}:${string}`;

function getAdapterKey(mode: NPCBrainMode, id: string): AdapterKey {
  return `${mode}:${id}`;
}

function getDistanceSquared(a: [number, number, number], b: [number, number, number]): number {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  const dz = a[2] - b[2];
  return dx * dx + dy * dy + dz * dz;
}

function createWanderTarget(observation: NPCObservation, radius: number): [number, number, number] {
  const seed = observation.timestamp * 1.7 + observation.instanceId.length * 13.37;
  const angle = (Math.sin(seed) * 0.5 + 0.5) * Math.PI * 2;
  const distance = radius * (0.35 + (Math.cos(seed * 0.73) * 0.5 + 0.5) * 0.65);
  return [
    observation.position[0] + Math.cos(angle) * distance,
    observation.position[1],
    observation.position[2] + Math.sin(angle) * distance,
  ];
}

export type NPCBrainAdapterContext = {
  instance: NPCInstance;
  observation: NPCObservation;
};

export type NPCBrainAdapter = (context: NPCBrainAdapterContext) => NPCBrainDecision | undefined;

export function createNPCBrainAdapterRegistry() {
  const adapters = new Map<AdapterKey, { adapter: NPCBrainAdapter }>();
  let active = true;
  return {
    get isActive() { return active; },
    register(mode: NPCBrainMode, id: string, adapter: NPCBrainAdapter): () => void {
      const key = getAdapterKey(mode, id);
      const lease = { adapter };
      adapters.set(key, lease);
      return () => { if (adapters.get(key) === lease) adapters.delete(key); };
    },
    resolve(brain: NPCBrainConfig | undefined): NPCBrainAdapter | undefined {
      if (!active || !brain) return undefined;
      for (const id of [brain.policyId, brain.providerId, 'default']) {
        const entry = id ? adapters.get(getAdapterKey(brain.mode, id)) : undefined;
        if (entry) return entry.adapter;
      }
      return undefined;
    },
    suspend() { active = false; },
    resume() { active = true; },
    dispose() { active = false; adapters.clear(); },
  };
}
export type NPCBrainAdapterRegistry = ReturnType<typeof createNPCBrainAdapterRegistry>;
const defaultAdapters = createNPCBrainAdapterRegistry();

export function registerNPCBrainAdapter(
  mode: NPCBrainMode,
  id: string,
  adapter: NPCBrainAdapter,
): () => void {
  return defaultAdapters.register(mode, id, adapter);
}

export function createNPCObservation(
  instance: NPCInstance,
  instances: Map<string, NPCInstance>,
  timestamp: number,
  candidates: Iterable<NPCInstance> = instances.values(),
): NPCObservation {
  const perception = instance.perception;
  const sightRadius = perception?.enabled ? perception.sightRadius : 0;
  const sightRadiusSquared = sightRadius * sightRadius;
  const perceived: NPCObservationTarget[] = [];

  if (sightRadius > 0) {
    for (const target of candidates) {
      if (target.id === instance.id) continue;
      const distanceSquared = getDistanceSquared(instance.position, target.position);
      if (distanceSquared > sightRadiusSquared) continue;
      const distance = Math.sqrt(distanceSquared);
      perceived.push({
        instanceId: target.id,
        name: target.name,
        position: target.position,
        distance,
        brainMode: target.brain?.mode ?? 'none',
      });
    }
  }

  perceived.sort((a, b) => a.distance - b.distance);

  return {
    instanceId: instance.id,
    templateId: instance.templateId,
    timestamp,
    position: instance.position,
    rotation: instance.rotation,
    currentAnimation: instance.currentAnimation ?? instance.behavior?.idleAnimation ?? 'idle',
    navigationState: instance.navigation?.state ?? 'none',
    behaviorMode: instance.behavior?.mode ?? 'idle',
    brainMode: instance.brain?.mode ?? 'none',
    perceptionEnabled: perception?.enabled ?? false,
    perceived,
    ...(instance.brain?.memory ? { memory: instance.brain.memory } : {}),
  };
}

function resolveScriptedDecision(instance: NPCInstance, observation: NPCObservation, blueprints?: ReadonlyMap<string, NPCBrainBlueprint>, stores?: NPCBrainConditionStores): NPCBrainDecision | undefined {
  const blueprintId = instance.brain?.blueprintId;
  const blueprint = blueprintId ? (blueprints ? blueprints.get(blueprintId) : getNPCBrainBlueprint(blueprintId)) : undefined;
  if (blueprint) {
    const actions = compileNPCBrainBlueprint(blueprint, observation, stores);
    if (actions.length > 0) {
      return {
        source: 'blueprint',
        reason: blueprint.name,
        actions,
      };
    }
  }

  const behavior = instance.behavior;
  if (!behavior || behavior.mode === 'idle' || observation.navigationState === 'moving') return undefined;

  if (behavior.mode === 'patrol' && behavior.waypoints && behavior.waypoints.length > 0) {
    return {
      source: 'scripted',
      reason: 'patrol behavior',
      actions: [{
        type: 'patrol',
        waypoints: behavior.waypoints,
        speed: behavior.speed,
        ...(behavior.loop !== undefined ? { loop: behavior.loop } : {}),
        ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
      }],
    };
  }

  if (behavior.mode === 'wander') {
    const radius = Math.max(0.5, behavior.wanderRadius ?? 4);
    return {
      source: 'scripted',
      reason: 'wander behavior',
      actions: [{
        type: 'moveTo',
        target: createWanderTarget(observation, radius),
        speed: behavior.speed,
        ...(behavior.moveAnimation ? { animationId: behavior.moveAnimation } : {}),
      }],
    };
  }

  return undefined;
}

export function resolveNPCBrainDecision(
  instance: NPCInstance,
  observation: NPCObservation,
  blueprints?: ReadonlyMap<string, NPCBrainBlueprint>,
  stores?: NPCBrainConditionStores & { npcBrainAdapters?: NPCBrainAdapterRegistry },
  adapters: NPCBrainAdapterRegistry = stores?.npcBrainAdapters ?? defaultAdapters,
): NPCBrainDecision | undefined {
  const brainMode = instance.brain?.mode ?? 'none';
  if (brainMode === 'none' || !adapters.isActive) return undefined;

  const adapter = adapters.resolve(instance.brain);
  if (adapter) {
    return adapter({ instance, observation });
  }

  if (brainMode === 'scripted') {
    return resolveScriptedDecision(instance, observation, blueprints, stores);
  }

  return undefined;
}
