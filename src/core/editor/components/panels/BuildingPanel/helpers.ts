import type { AssetRecord } from '../../../../assets';
import { createBuildingScopeId } from '../../../../building/id';
import type { MeshConfig } from '../../../../building/types';
import type {
  NPCBrainBlueprint,
  NPCBrainBlueprintNode,
  NPCBehaviorConfig,
} from '../../../../npc/types';

export const isBuildingMaterialAsset = (asset: AssetRecord) =>
  asset.kind === 'material' || asset.kind === 'wall' || asset.kind === 'tile';

export const createPlacementAssetScopeId = createBuildingScopeId;

export function createScopedColorMeshConfig(id: string, color: string, base?: MeshConfig): MeshConfig {
  const { mapTextureUrl: _mapTextureUrl, textureUrl: _textureUrl, materialParams, ...baseWithoutTexture } = base ?? {};
  void _mapTextureUrl;
  void _textureUrl;
  return {
    ...baseWithoutTexture,
    id,
    color,
    material: 'STANDARD',
    materialParams: {
      ...(materialParams ?? {}),
      color,
    },
  };
}

export function createNPCBlueprintNodeId(type: string): string {
  return `${type}-${Date.now()}`;
}

export function createNPCConditionNode(kind: 'navigationIdle' | 'questStatus' | 'friendshipAtLeast'): NPCBrainBlueprintNode {
  if (kind === 'questStatus') {
    return {
      id: createNPCBlueprintNodeId('condition-quest'),
      type: 'condition',
      label: 'Quest Active',
      condition: { type: 'questStatus', questId: 'welcome', status: 'active' },
    };
  }
  if (kind === 'friendshipAtLeast') {
    return {
      id: createNPCBlueprintNodeId('condition-friendship'),
      type: 'condition',
      label: 'Friendship Gate',
      condition: { type: 'friendshipAtLeast', score: 150 },
    };
  }
  return {
    id: createNPCBlueprintNodeId('condition-idle'),
    type: 'condition',
    label: 'Navigation Idle',
    condition: { type: 'navigationIdle' },
  };
}

export function createNPCActionNode(
  kind: 'wander' | 'speak',
  behavior: NPCBehaviorConfig | undefined,
): NPCBrainBlueprintNode {
  if (kind === 'speak') {
    return {
      id: createNPCBlueprintNodeId('speak'),
      type: 'action',
      label: 'Speak',
      action: { type: 'speak', text: '안녕?', duration: 2 },
    };
  }
  return {
    id: createNPCBlueprintNodeId('wander'),
    type: 'action',
    label: 'Wander',
    action: {
      type: 'wander',
      radius: behavior?.wanderRadius ?? 4,
      speed: behavior?.speed ?? 2.2,
    },
  };
}

export function getNPCBlueprintNodeTitle(node: NPCBrainBlueprintNode): string {
  if (node.label) return node.label;
  if (node.type === 'start') return 'Start';
  if (node.type === 'condition') return `Condition: ${node.condition.type}`;
  return `Action: ${node.action.type}`;
}

export function getNPCBlueprintNodeDescription(node: NPCBrainBlueprintNode): string {
  if (node.type === 'start') return '블루프린트 실행 시작점';
  if (node.type === 'condition') {
    if (node.condition.type === 'questStatus') {
      return `quest ${node.condition.questId} is ${node.condition.status}`;
    }
    if (node.condition.type === 'friendshipAtLeast') {
      return `friendship >= ${node.condition.score}`;
    }
    return node.condition.type;
  }
  if (node.action.type === 'moveToTarget') return `moveTo ${node.action.target.type}`;
  if (node.action.type === 'speak') return node.action.text;
  if (node.action.type === 'playAnimation') return node.action.animationId;
  return node.action.type;
}

export function appendNPCBlueprintNode(
  blueprint: NPCBrainBlueprint,
  node: NPCBrainBlueprintNode,
): NPCBrainBlueprint {
  const lastNode = blueprint.nodes[blueprint.nodes.length - 1];
  const edge = lastNode
    ? {
        id: `${lastNode.id}-${node.id}`,
        source: lastNode.id,
        target: node.id,
        branch: 'next' as const,
      }
    : undefined;

  return {
    ...blueprint,
    nodes: [...blueprint.nodes, node],
    edges: edge ? [...blueprint.edges, edge] : blueprint.edges,
  };
}

export function appendNPCConditionNodeWithBranchTemplate(
  blueprint: NPCBrainBlueprint,
  conditionNode: NPCBrainBlueprintNode,
  behavior?: NPCBehaviorConfig,
): NPCBrainBlueprint {
  if (conditionNode.type !== 'condition') return appendNPCBlueprintNode(blueprint, conditionNode);
  const withCondition = appendNPCBlueprintNode(blueprint, conditionNode);
  const trueNode = createNPCActionNode('wander', behavior);
  const falseNode = createNPCActionNode('speak', behavior);
  const trueNodeWithLabel = {
    ...trueNode,
    label: trueNode.label ?? 'True Path',
  };
  const falseNodeWithLabel = {
    ...falseNode,
    label: falseNode.label ?? 'False Path',
  };

  return {
    ...withCondition,
    nodes: [
      ...withCondition.nodes,
      trueNodeWithLabel,
      falseNodeWithLabel,
    ],
    edges: [
      ...withCondition.edges,
      {
        id: `${conditionNode.id}-true-${trueNodeWithLabel.id}`,
        source: conditionNode.id,
        target: trueNodeWithLabel.id,
        branch: 'true',
      },
      {
        id: `${conditionNode.id}-false-${falseNodeWithLabel.id}`,
        source: conditionNode.id,
        target: falseNodeWithLabel.id,
        branch: 'false',
      },
    ],
  };
}

export function removeNPCBlueprintNode(
  blueprint: NPCBrainBlueprint,
  nodeId: string,
): NPCBrainBlueprint {
  const node = blueprint.nodes.find((entry) => entry.id === nodeId);
  if (!node || node.type === 'start') return blueprint;

  return {
    ...blueprint,
    nodes: blueprint.nodes.filter((entry) => entry.id !== nodeId),
    edges: blueprint.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
  };
}

export function resetNPCBlueprint(blueprint: NPCBrainBlueprint): NPCBrainBlueprint {
  return {
    ...blueprint,
    nodes: [{ id: 'start', type: 'start', label: 'Start' }],
    edges: [],
  };
}

export function cloneNPCBlueprintForInstance(
  blueprint: NPCBrainBlueprint,
  instanceId: string,
): NPCBrainBlueprint {
  return {
    ...blueprint,
    id: `npc-custom-${instanceId}-${Date.now()}`,
    name: `${blueprint.name} Custom`,
    description: blueprint.description ? `${blueprint.description} Customized for ${instanceId}.` : `Customized for ${instanceId}.`,
    nodes: blueprint.nodes.map((node) => ({ ...node })),
    edges: blueprint.edges.map((edge) => ({ ...edge })),
  };
}

export function getNPCBlueprintOutgoingLabel(blueprint: NPCBrainBlueprint, nodeId: string): string {
  const nodeById = new Map(blueprint.nodes.map((node) => [node.id, node]));
  const edges = blueprint.edges.filter((edge) => edge.source === nodeId);
  if (edges.length === 0) return '다음 없음';
  return edges
    .map((edge) => {
      const target = nodeById.get(edge.target);
      const branch = edge.branch ?? 'next';
      return `${branch} -> ${target ? getNPCBlueprintNodeTitle(target) : edge.target}`;
    })
    .join(' · ');
}
