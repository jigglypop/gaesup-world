import type {
  AgentBehaviorBlueprint,
  NPCAction,
  NPCBehaviorBlueprint,
  NPCBrainConfig,
  NPCBrainBlueprint,
  NPCBrainBlueprintCondition,
  NPCBrainBlueprintEdge,
  NPCBrainBlueprintNode,
  NPCBrainBlueprintTarget,
  NPCEvent,
  NPCInstance,
  NPCObservation,
  NPCPerceptionConfig,
} from '../types';
import { useQuestStore } from '../../quests/stores/questStore';
import { useFriendshipStore } from '../../relations/stores/friendshipStore';

const MAX_BLUEPRINT_STEPS = 32;
const blueprints = new Map<string, NPCBrainBlueprint>();

export function registerNPCBrainBlueprint(blueprint: NPCBrainBlueprint): () => void {
  blueprints.set(blueprint.id, blueprint);
  return () => {
    blueprints.delete(blueprint.id);
  };
}

export function getNPCBrainBlueprint(id: string): NPCBrainBlueprint | undefined {
  return blueprints.get(id);
}

export function unregisterNPCBrainBlueprint(id: string): void {
  blueprints.delete(id);
}

const cloneBehaviorConfig = (behavior: NPCBehaviorBlueprint['behavior']) => ({
  ...behavior,
  ...(behavior.waypoints ? { waypoints: behavior.waypoints.map((point) => [...point] as [number, number, number]) } : {}),
});

const cloneBrainConfig = (brain: NPCBrainConfig): NPCBrainConfig => ({
  ...brain,
  ...(brain.memory ? { memory: { ...brain.memory } } : {}),
});

const clonePerceptionConfig = (perception: NPCPerceptionConfig): NPCPerceptionConfig => ({ ...perception });

const cloneNPCEvents = (events: NPCEvent[]): NPCEvent[] =>
  events.map((event) => ({ ...event, ...(event.payload ? { payload: { ...event.payload } } : {}) }));

export function createNPCBehaviorBlueprintFromInstance(
  instance: NPCInstance,
  options: {
    id?: string;
    name?: string;
    description?: string;
    role?: string;
    tags?: string[];
  } = {},
): NPCBehaviorBlueprint {
  const behavior = {
    mode: instance.behavior?.mode ?? 'idle',
    speed: instance.behavior?.speed ?? 2.2,
    ...(instance.behavior?.loop !== undefined ? { loop: instance.behavior.loop } : {}),
    ...(instance.behavior?.waypoints ? { waypoints: instance.behavior.waypoints.map((point) => [...point] as [number, number, number]) } : {}),
    ...(instance.behavior?.wanderRadius !== undefined ? { wanderRadius: instance.behavior.wanderRadius } : {}),
    ...(instance.behavior?.waitSeconds !== undefined ? { waitSeconds: instance.behavior.waitSeconds } : {}),
    ...(instance.behavior?.idleAnimation ? { idleAnimation: instance.behavior.idleAnimation } : {}),
    ...(instance.behavior?.moveAnimation ? { moveAnimation: instance.behavior.moveAnimation } : {}),
    ...(instance.behavior?.arriveAnimation ? { arriveAnimation: instance.behavior.arriveAnimation } : {}),
  };

  return {
    id: options.id ?? `npc-behavior-${instance.id}`,
    name: options.name ?? `${instance.name} Behavior`,
    ...(options.description ? { description: options.description } : {}),
    ...(options.role ? { role: options.role } : {}),
    behavior,
    ...(instance.brain ? { brain: cloneBrainConfig(instance.brain) } : {}),
    ...(instance.perception ? { perception: clonePerceptionConfig(instance.perception) } : {}),
    ...(instance.events ? { events: cloneNPCEvents(instance.events) } : {}),
    ...(options.tags ? { tags: [...options.tags] } : {}),
  };
}

export function applyNPCBehaviorBlueprint(
  instance: NPCInstance,
  blueprint: NPCBehaviorBlueprint,
): NPCInstance {
  return {
    ...instance,
    behavior: cloneBehaviorConfig(blueprint.behavior),
    ...(blueprint.brain ? { brain: cloneBrainConfig(blueprint.brain) } : {}),
    ...(blueprint.perception ? { perception: clonePerceptionConfig(blueprint.perception) } : {}),
    ...(blueprint.events ? { events: cloneNPCEvents(blueprint.events) } : {}),
  };
}

export function createAgentBehaviorBlueprintFromNPCBehaviorBlueprint(
  blueprint: NPCBehaviorBlueprint,
  options: {
    id?: string;
    name?: string;
    ownerType?: AgentBehaviorBlueprint['ownerType'];
    description?: string;
    role?: string;
    tags?: string[];
  } = {},
): AgentBehaviorBlueprint {
  return {
    id: options.id ?? blueprint.id,
    name: options.name ?? blueprint.name,
    ownerType: options.ownerType ?? 'npc',
    ...(options.description ?? blueprint.description ? { description: options.description ?? blueprint.description } : {}),
    ...(options.role ?? blueprint.role ? { role: options.role ?? blueprint.role } : {}),
    behavior: cloneBehaviorConfig(blueprint.behavior),
    ...(blueprint.brain ? { brain: cloneBrainConfig(blueprint.brain) } : {}),
    ...(blueprint.perception ? { perception: clonePerceptionConfig(blueprint.perception) } : {}),
    ...(blueprint.events ? { events: cloneNPCEvents(blueprint.events) } : {}),
    ...(options.tags ? { tags: [...options.tags] } : blueprint.tags ? { tags: [...blueprint.tags] } : {}),
  };
}

export function createNPCBehaviorBlueprintFromAgentBehaviorBlueprint(
  blueprint: AgentBehaviorBlueprint,
): NPCBehaviorBlueprint {
  return {
    id: blueprint.id,
    name: blueprint.name,
    ...(blueprint.description ? { description: blueprint.description } : {}),
    ...(blueprint.role ? { role: blueprint.role } : {}),
    behavior: cloneBehaviorConfig(blueprint.behavior),
    ...(blueprint.brain ? { brain: cloneBrainConfig(blueprint.brain) } : {}),
    ...(blueprint.perception ? { perception: clonePerceptionConfig(blueprint.perception) } : {}),
    ...(blueprint.events ? { events: cloneNPCEvents(blueprint.events) } : {}),
    ...(blueprint.tags ? { tags: [...blueprint.tags] } : {}),
  };
}

export function applyAgentBehaviorBlueprint(
  instance: NPCInstance,
  blueprint: AgentBehaviorBlueprint,
): NPCInstance {
  return applyNPCBehaviorBlueprint(
    instance,
    createNPCBehaviorBlueprintFromAgentBehaviorBlueprint(blueprint),
  );
}

function resolveCondition(condition: NPCBrainBlueprintCondition, observation: NPCObservation): boolean {
  switch (condition.type) {
    case 'always':
      return true;
    case 'navigationIdle':
      return observation.navigationState !== 'moving';
    case 'perceivedAny':
      return observation.perceived.length > 0;
    case 'questStatus':
      return useQuestStore.getState().statusOf(condition.questId) === condition.status;
    case 'friendshipAtLeast': {
      const npcId = condition.npcId ?? observation.instanceId;
      return useFriendshipStore.getState().scoreOf(npcId) >= condition.score;
    }
    case 'memoryEquals':
      return observation.memory?.[condition.key] === condition.value;
  }
}

function resolveTarget(target: NPCBrainBlueprintTarget, observation: NPCObservation): [number, number, number] | undefined {
  switch (target.type) {
    case 'point':
      return target.value;
    case 'self':
      return observation.position;
    case 'nearestPerceived':
      return observation.perceived[0]?.position;
  }
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

function compileAction(node: Extract<NPCBrainBlueprintNode, { type: 'action' }>, observation: NPCObservation): NPCAction | undefined {
  if (node.action.type === 'wander') {
    const radius = Math.max(0.5, node.action.radius ?? 4);
    return {
      type: 'moveTo',
      target: createWanderTarget(observation, radius),
      ...(node.action.speed !== undefined ? { speed: node.action.speed } : {}),
    };
  }

  if (node.action.type !== 'moveToTarget') return node.action;
  const target = resolveTarget(node.action.target, observation);
  if (!target) return undefined;
  return {
    type: 'moveTo',
    target,
    ...(node.action.speed !== undefined ? { speed: node.action.speed } : {}),
    ...(node.action.animationId ? { animationId: node.action.animationId } : {}),
  };
}

function findNextEdge(
  edges: NPCBrainBlueprintEdge[],
  nodeId: string,
  branch: NPCBrainBlueprintEdge['branch'] = 'next',
): NPCBrainBlueprintEdge | undefined {
  return edges.find((edge) => edge.source === nodeId && edge.branch === branch)
    ?? edges.find((edge) => edge.source === nodeId && edge.branch === undefined);
}

export function compileNPCBrainBlueprint(
  blueprint: NPCBrainBlueprint,
  observation: NPCObservation,
): NPCAction[] {
  const nodes = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const actions: NPCAction[] = [];
  let current = blueprint.nodes.find((node) => node.type === 'start') ?? blueprint.nodes[0];
  let steps = 0;

  while (current && steps < MAX_BLUEPRINT_STEPS) {
    steps += 1;

    if (current.type === 'condition') {
      const branch = resolveCondition(current.condition, observation) ? 'true' : 'false';
      current = nodes.get(findNextEdge(blueprint.edges, current.id, branch)?.target ?? '');
      continue;
    }

    if (current.type === 'action') {
      const action = compileAction(current, observation);
      if (action) actions.push(action);
    }

    current = nodes.get(findNextEdge(blueprint.edges, current.id)?.target ?? '');
  }

  return actions;
}
