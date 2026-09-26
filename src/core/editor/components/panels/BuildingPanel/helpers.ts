import type { AssetRecord } from '../../../../assets';
import type { MeshConfig } from '../../../../building/types';
import type {
  NPCBrainBlueprint,
  NPCBrainBlueprintNode,
  NPCBehaviorConfig,
} from '../../../../npc/types';
import { createUniqueId } from '../../../../utils/id';

const NPC_BRAIN_LABELS: Readonly<Record<string, string>> = {
  none: '사용 안 함', scripted: '스크립트', llm: '언어 모델', reinforcement: '강화 학습',
  idle: '대기', moveTo: '지점 이동', patrol: '순찰', wander: '배회', playAnimation: '애니메이션 재생',
  moving: '이동 중', arrived: '도착', walk: '걷기', run: '달리기', jump: '점프', greet: '인사',
  lookAt: '바라보기', speak: '말하기', interact: '상호작용', remember: '기억 저장', moveToTarget: '대상 이동',
  always: '항상', navigationIdle: '이동 대기 중', perceivedAny: '대상 감지', perceivedEntered: '새 대상 감지', memoryEquals: '기억 값 일치',
  point: '지점', self: '자신', nearestPerceived: '가장 가까운 감지 대상',
  next: '다음', true: '참', false: '거짓',
};

export function getNPCBrainLabel(value: string): string {
  return NPC_BRAIN_LABELS[value] ?? value;
}

export const isBuildingMaterialAsset = (asset: AssetRecord) =>
  asset.kind === 'material' || asset.kind === 'wall' || asset.kind === 'tile';

/**
 * An id derived from the mesh's content: picking the same look again names the same mesh, so it adds no mesh,
 * material or batch, while a different look never rewrites a mesh that placed tiles already use.
 */
export function lookMeshId(scope: string, look: MeshConfig): string {
  const text = JSON.stringify({ ...look, id: '' });
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) hash = Math.imul(hash ^ text.charCodeAt(index), 0x01000193);
  return `${scope}-${(hash >>> 0).toString(36)}`;
}

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

export function createNPCConditionNode(): NPCBrainBlueprintNode {
  return {
    id: createUniqueId('condition-idle'),
    type: 'condition',
    label: '이동 대기',
    condition: { type: 'navigationIdle' },
  };
}

export function createNPCActionNode(
  kind: 'wander' | 'speak',
  behavior: NPCBehaviorConfig | undefined,
): NPCBrainBlueprintNode {
  if (kind === 'speak') {
    return {
      id: createUniqueId('speak'),
      type: 'action',
      label: '말하기',
      action: { type: 'speak', text: '안녕?', duration: 2 },
    };
  }
  return {
    id: createUniqueId('wander'),
    type: 'action',
    label: '배회',
    action: {
      type: 'wander',
      radius: behavior?.wanderRadius ?? 4,
      speed: behavior?.speed ?? 2.2,
    },
  };
}

export function getNPCBlueprintNodeTitle(node: NPCBrainBlueprintNode): string {
  if (node.label) return node.label;
  if (node.type === 'start') return '시작';
  if (node.type === 'condition') return `조건: ${getNPCBrainLabel(node.condition.type)}`;
  return `행동: ${getNPCBrainLabel(node.action.type)}`;
}

export function getNPCBlueprintNodeDescription(node: NPCBrainBlueprintNode): string {
  if (node.type === 'start') return '블루프린트 실행 시작점';
  if (node.type === 'condition') return getNPCBrainLabel(node.condition.type);
  if (node.action.type === 'moveToTarget') return `${getNPCBrainLabel(node.action.target.type)} 이동`;
  if (node.action.type === 'speak') return node.action.text;
  if (node.action.type === 'playAnimation') return node.action.animationId;
  return getNPCBrainLabel(node.action.type);
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
    label: trueNode.label ?? '참 경로',
  };
  const falseNodeWithLabel = {
    ...falseNode,
    label: falseNode.label ?? '거짓 경로',
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
    nodes: [{ id: 'start', type: 'start', label: '시작' }],
    edges: [],
  };
}

export function cloneNPCBlueprintForInstance(
  blueprint: NPCBrainBlueprint,
  instanceId: string,
): NPCBrainBlueprint {
  return {
    ...blueprint,
    id: createUniqueId(`npc-custom-${instanceId}`),
    name: `${blueprint.name} 사본`,
    description: blueprint.description ? `${blueprint.description} ${instanceId} 전용 사본.` : `${instanceId} 전용 사본.`,
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
      return `${getNPCBrainLabel(branch)} → ${target ? getNPCBlueprintNodeTitle(target) : edge.target}`;
    })
    .join(' · ');
}
