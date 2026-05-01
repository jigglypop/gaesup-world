import type {
  NPCAction,
  NPCBrainBlueprint,
  NPCBrainBlueprintCondition,
  NPCBrainBlueprintEdge,
  NPCBrainBlueprintNode,
  NPCBrainBlueprintTarget,
  NPCObservation,
} from '../types';

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

function resolveCondition(condition: NPCBrainBlueprintCondition, observation: NPCObservation): boolean {
  switch (condition.type) {
    case 'always':
      return true;
    case 'navigationIdle':
      return observation.navigationState !== 'moving';
    case 'perceivedAny':
      return observation.perceived.length > 0;
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
