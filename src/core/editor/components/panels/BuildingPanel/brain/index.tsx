import React from 'react';

import { BrainFlow } from '../flow';
import {
  appendNPCBlueprintNode,
  appendNPCConditionNodeWithBranchTemplate,
  cloneNPCBlueprintForInstance,
  createNPCActionNode,
  createNPCConditionNode,
  getNPCBlueprintNodeDescription,
  getNPCBlueprintNodeTitle,
  getNPCBlueprintOutgoingLabel,
  removeNPCBlueprintNode,
  resetNPCBlueprint,
} from '../helpers';
import type {
  NPCBrainBlueprint,
  NPCBrainBlueprintEdge,
  NPCBrainBlueprintNode,
  NPCBrainConfig,
  NPCBrainMode,
  NPCInstance as NPCInstanceData,
} from '../../../../../npc/types';
import { FieldRow } from '../../../fields';
const NPC_BRAIN_MODES: NPCBrainMode[] = ['none', 'scripted', 'llm', 'reinforcement'];
const NPC_QUEST_STATUS_OPTIONS = ['locked', 'available', 'active', 'completed', 'failed'] as const;
const NPC_CONDITION_TYPES = [
  'always',
  'navigationIdle',
  'perceivedAny',
  'questStatus',
  'friendshipAtLeast',
  'memoryEquals',
] as const;
const NPC_ACTION_TYPES = [
  'idle',
  'moveTo',
  'patrol',
  'wander',
  'playAnimation',
  'lookAt',
  'speak',
  'interact',
  'remember',
  'moveToTarget',
] as const;

export type NPCBrainSectionProps = {
  instance: NPCInstanceData;
  blueprints: NPCBrainBlueprint[];
  selectedBlueprint: NPCBrainBlueprint | undefined;
  updateBrain: (id: string, updates: Partial<NPCBrainConfig>) => void;
  addBrainBlueprint: (blueprint: NPCBrainBlueprint) => void;
  updateBrainBlueprint: (id: string, updates: NPCBrainBlueprint) => void;
  onPreviewStateChange?: (state: NPCBrainPreviewState) => void;
};

export type NPCBrainPreviewState = {
  mode: 'idle' | 'move' | 'patrol' | 'wander' | 'action';
  label: string;
  target?: [number, number, number];
  waypoints?: [number, number, number][];
  radius?: number;
  animationId?: string;
};

export function NPCBrainSection({
  instance,
  blueprints,
  selectedBlueprint,
  updateBrain,
  addBrainBlueprint,
  updateBrainBlueprint,
  onPreviewStateChange,
}: NPCBrainSectionProps) {
  const brainEditorRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedNodeId, setSelectedNodeId] = React.useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = React.useState<string | null>(null);
  const [edgeIntegrityMessage, setEdgeIntegrityMessage] = React.useState<string>('');
  const [showReactFlowView, setShowReactFlowView] = React.useState(true);
  const [activeNpcTab, setActiveNpcTab] = React.useState<'nodes' | 'inspector'>('nodes');
  const [isInEditorModal, setIsInEditorModal] = React.useState(false);

  React.useEffect(() => {
    const element = brainEditorRef.current;
    if (!element) return;
    setIsInEditorModal(Boolean(element.closest('.editor-panel-modal')));
  }, [selectedBlueprint]);

  React.useEffect(() => {
    if (!isInEditorModal) return;
    if (!showReactFlowView) setShowReactFlowView(true);
  }, [isInEditorModal, showReactFlowView]);

  React.useEffect(() => {
    if (!selectedBlueprint) {
      setSelectedNodeId(null);
      setShowReactFlowView(true);
      setActiveNpcTab('nodes');
      return;
    }
    const exists = selectedNodeId
      ? selectedBlueprint.nodes.some((node) => node.id === selectedNodeId && node.type !== 'start')
      : false;
    if (exists) return;
    const firstEditable = selectedBlueprint.nodes.find((node) => node.type !== 'start');
    setSelectedNodeId(firstEditable?.id ?? null);
  }, [selectedBlueprint, selectedNodeId]);

  const updateSelectedNode = (updater: (node: NPCBrainBlueprintNode) => NPCBrainBlueprintNode) => {
    if (!selectedBlueprint || !selectedNodeId) return;
    const nextNodes = selectedBlueprint.nodes.map((node) => {
      if (node.id !== selectedNodeId || node.type === 'start') return node;
      return updater(node);
    });
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      nodes: nextNodes,
    });
  };

  const selectedNode = selectedBlueprint?.nodes.find(
    (node): node is Exclude<NPCBrainBlueprintNode, { type: 'start' }> =>
      node.id === selectedNodeId && node.type !== 'start',
  );
  React.useEffect(() => {
    const behavior = instance.behavior;
    let state: NPCBrainPreviewState = {
      mode: 'idle',
      label: '대기',
    };

    if (selectedNode?.type === 'action') {
      switch (selectedNode.action.type) {
        case 'moveTo':
          state = {
            mode: 'move',
            label: 'moveTo',
            target: selectedNode.action.target,
            ...(selectedNode.action.animationId
              ? { animationId: selectedNode.action.animationId }
              : {}),
          };
          break;
        case 'patrol':
          state = {
            mode: 'patrol',
            label: 'patrol',
            waypoints: selectedNode.action.waypoints,
            ...(selectedNode.action.animationId
              ? { animationId: selectedNode.action.animationId }
              : {}),
          };
          break;
        case 'wander':
          state = {
            mode: 'wander',
            label: 'wander',
            ...(selectedNode.action.radius ? { radius: selectedNode.action.radius } : {}),
          };
          break;
        case 'moveToTarget':
          state =
            selectedNode.action.target.type === 'point'
              ? {
                  mode: 'move',
                  label: 'moveToTarget(point)',
                  target: selectedNode.action.target.value,
                  ...(selectedNode.action.animationId
                    ? { animationId: selectedNode.action.animationId }
                    : {}),
                }
              : {
                  mode: 'action',
                  label: `moveToTarget(${selectedNode.action.target.type})`,
                  ...(selectedNode.action.animationId
                    ? { animationId: selectedNode.action.animationId }
                    : {}),
                };
          break;
        case 'playAnimation':
          state = {
            mode: 'action',
            label: 'playAnimation',
            animationId: selectedNode.action.animationId,
          };
          break;
        case 'speak':
          state = {
            mode: 'action',
            label: `speak: ${selectedNode.action.text}`,
          };
          break;
        default:
          state = {
            mode: 'action',
            label: selectedNode.action.type,
          };
      }
    } else if (behavior?.mode === 'patrol' && behavior.waypoints && behavior.waypoints.length > 0) {
      state = {
        mode: 'patrol',
        label: 'patrol(behavior)',
        waypoints: behavior.waypoints,
      };
    } else if (behavior?.mode === 'wander') {
      state = {
        mode: 'wander',
        label: 'wander(behavior)',
        radius: behavior.wanderRadius ?? 4,
      };
    }

    onPreviewStateChange?.(state);
  }, [instance.behavior, onPreviewStateChange, selectedNode]);
  const primaryStartNode = selectedBlueprint?.nodes.find((node) => node.type === 'start') ?? null;
  const blueprintNodeIds = React.useMemo(
    () => new Set((selectedBlueprint?.nodes ?? []).map((node) => node.id)),
    [selectedBlueprint],
  );
  const danglingEdges = React.useMemo(
    () =>
      (selectedBlueprint?.edges ?? []).filter(
        (edge) => !blueprintNodeIds.has(edge.source) || !blueprintNodeIds.has(edge.target),
      ),
    [blueprintNodeIds, selectedBlueprint],
  );
  const reachableNodeIds = React.useMemo(() => {
    if (!selectedBlueprint) return new Set<string>();
    const adjacency = new Map<string, string[]>();
    for (const edge of selectedBlueprint.edges) {
      if (!blueprintNodeIds.has(edge.source) || !blueprintNodeIds.has(edge.target)) continue;
      const list = adjacency.get(edge.source) ?? [];
      list.push(edge.target);
      adjacency.set(edge.source, list);
    }
    const visited = new Set<string>();
    const startNodes = selectedBlueprint.nodes.filter((node) => node.type === 'start');
    const queue = startNodes.map((node) => node.id);
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const nextTargets = adjacency.get(current) ?? [];
      for (const nextTarget of nextTargets) {
        if (!visited.has(nextTarget)) {
          queue.push(nextTarget);
        }
      }
    }
    return visited;
  }, [blueprintNodeIds, selectedBlueprint]);
  const orphanNodeIds = React.useMemo(
    () =>
      new Set(
        (selectedBlueprint?.nodes ?? [])
          .filter((node) => node.type !== 'start' && !reachableNodeIds.has(node.id))
          .map((node) => node.id),
      ),
    [reachableNodeIds, selectedBlueprint],
  );
  const conditionBranchIssues = React.useMemo(() => {
    const issues = new Map<string, string[]>();
    if (!selectedBlueprint) return issues;
    for (const node of selectedBlueprint.nodes) {
      if (node.type !== 'condition') continue;
      const outgoing = selectedBlueprint.edges.filter((edge) => edge.source === node.id);
      const branches = outgoing.map((edge) => edge.branch ?? 'next');
      const nextIssues: string[] = [];
      if (!branches.includes('true')) nextIssues.push('true branch 누락');
      if (!branches.includes('false')) nextIssues.push('false branch 누락');
      if (branches.includes('next')) nextIssues.push('condition에는 next 대신 true/false를 권장');
      if (nextIssues.length > 0) {
        issues.set(node.id, nextIssues);
      }
    }
    return issues;
  }, [selectedBlueprint]);
  const availableEdgeNodes = selectedBlueprint?.nodes.filter((node) => node.type !== 'start') ?? [];
  const selectedNodeOutgoingEdges = React.useMemo(
    () => selectedBlueprint?.edges.filter((edge) => edge.source === selectedNodeId) ?? [],
    [selectedBlueprint, selectedNodeId],
  );
  const selectedEdge =
    selectedNodeOutgoingEdges.find((edge) => edge.id === selectedEdgeId) ??
    selectedNodeOutgoingEdges[0] ??
    null;
  const selectedEdgeTarget = selectedBlueprint?.nodes.find(
    (node) => node.id === selectedEdge?.target,
  );

  React.useEffect(() => {
    if (selectedNodeOutgoingEdges.length === 0) {
      setSelectedEdgeId(null);
      return;
    }
    if (!selectedEdgeId || !selectedNodeOutgoingEdges.some((edge) => edge.id === selectedEdgeId)) {
      setSelectedEdgeId(selectedNodeOutgoingEdges[0]?.id ?? null);
    }
  }, [selectedEdgeId, selectedNodeOutgoingEdges]);

  React.useEffect(() => {
    if (!selectedBlueprint || danglingEdges.length === 0) return;
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: selectedBlueprint.edges.filter(
        (edge) => blueprintNodeIds.has(edge.source) && blueprintNodeIds.has(edge.target),
      ),
    });
    setEdgeIntegrityMessage(`유효하지 않은 edge ${danglingEdges.length}개를 자동 정리했습니다.`);
  }, [blueprintNodeIds, danglingEdges, selectedBlueprint, updateBrainBlueprint]);

  const getEdgeIntegrityError = (
    source: string,
    target: string,
    ignoreEdgeId?: string,
    edges: NPCBrainBlueprintEdge[] = selectedBlueprint?.edges ?? [],
  ): string | null => {
    if (source === target) {
      return 'self-loop는 허용하지 않습니다.';
    }
    const hasDuplicate = edges.some(
      (edge) => edge.id !== ignoreEdgeId && edge.source === source && edge.target === target,
    );
    if (hasDuplicate) {
      return '동일 source/target edge가 이미 있습니다.';
    }
    return null;
  };

  const updateSelectedEdge = (updater: (edge: NPCBrainBlueprintEdge) => NPCBrainBlueprintEdge) => {
    if (!selectedBlueprint || !selectedEdge) return;
    const nextEdges: NPCBrainBlueprintEdge[] = [];
    for (const edge of selectedBlueprint.edges) {
      if (edge.id !== selectedEdge.id) {
        nextEdges.push(edge);
        continue;
      }
      const candidate = updater(edge);
      const integrityError = getEdgeIntegrityError(candidate.source, candidate.target, edge.id);
      if (integrityError) {
        setEdgeIntegrityMessage(integrityError);
        nextEdges.push(edge);
      } else {
        setEdgeIntegrityMessage('');
        nextEdges.push(candidate);
      }
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
  };
  const recoverOrphanNode = (targetNodeId: string) => {
    if (!selectedBlueprint || !primaryStartNode) return;
    const nextEdge: NPCBrainBlueprintEdge = {
      id: `${primaryStartNode.id}-${targetNodeId}-${Date.now()}`,
      source: primaryStartNode.id,
      target: targetNodeId,
      branch: 'next',
    };
    const integrityError = getEdgeIntegrityError(nextEdge.source, nextEdge.target);
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...selectedBlueprint.edges, nextEdge],
    });
    setEdgeIntegrityMessage(`orphan 노드 ${targetNodeId}를 start에 연결했습니다.`);
  };
  const recoverAllOrphans = () => {
    if (!selectedBlueprint || !primaryStartNode || orphanNodeIds.size === 0) return;
    let recoveredCount = 0;
    const nextEdges = [...selectedBlueprint.edges];
    for (const orphanNodeId of orphanNodeIds) {
      const integrityError = getEdgeIntegrityError(
        primaryStartNode.id,
        orphanNodeId,
        undefined,
        nextEdges,
      );
      if (integrityError) continue;
      nextEdges.push({
        id: `${primaryStartNode.id}-${orphanNodeId}-${Date.now()}-${recoveredCount}`,
        source: primaryStartNode.id,
        target: orphanNodeId,
        branch: 'next',
      });
      recoveredCount += 1;
    }
    if (recoveredCount === 0) {
      setEdgeIntegrityMessage('복구 가능한 orphan 노드가 없습니다.');
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
    setEdgeIntegrityMessage(`orphan 노드 ${recoveredCount}개를 start에 연결했습니다.`);
  };
  const addOutgoingEdge = () => {
    if (!selectedBlueprint || !selectedNodeId) return;
    const fallbackTarget = availableEdgeNodes.find(
      (node) =>
        node.id !== selectedNodeId &&
        !selectedBlueprint.edges.some(
          (edge) => edge.source === selectedNodeId && edge.target === node.id,
        ),
    );
    if (!fallbackTarget) return;
    const newEdge: NPCBrainBlueprintEdge = {
      id: `${selectedNodeId}-${fallbackTarget.id}-${Date.now()}`,
      source: selectedNodeId,
      target: fallbackTarget.id,
      branch: 'next',
    };
    const integrityError = getEdgeIntegrityError(newEdge.source, newEdge.target);
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...selectedBlueprint.edges, newEdge],
    });
    setEdgeIntegrityMessage('');
    setSelectedEdgeId(newEdge.id);
  };
  const removeSelectedEdge = () => {
    if (!selectedBlueprint || !selectedEdge) return;
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: selectedBlueprint.edges.filter((edge) => edge.id !== selectedEdge.id),
    });
    setEdgeIntegrityMessage('');
    setSelectedEdgeId(null);
  };
  const addConditionBranchEdge = (conditionNodeId: string, branch: 'true' | 'false') => {
    if (!selectedBlueprint) return;
    const conditionNode = selectedBlueprint.nodes.find((node) => node.id === conditionNodeId);
    if (!conditionNode || conditionNode.type !== 'condition') return;
    const hasBranch = selectedBlueprint.edges.some(
      (edge) => edge.source === conditionNodeId && (edge.branch ?? 'next') === branch,
    );
    if (hasBranch) return;
    const nextEdges = [...selectedBlueprint.edges];
    const targetCandidate = availableEdgeNodes.find(
      (node) =>
        node.id !== conditionNodeId &&
        !nextEdges.some((edge) => edge.source === conditionNodeId && edge.target === node.id),
    );
    if (!targetCandidate) {
      setEdgeIntegrityMessage(`branch ${branch}를 추가할 타겟 노드를 찾을 수 없습니다.`);
      return;
    }
    const integrityError = getEdgeIntegrityError(
      conditionNodeId,
      targetCandidate.id,
      undefined,
      nextEdges,
    );
    if (integrityError) {
      setEdgeIntegrityMessage(integrityError);
      return;
    }
    const newEdge: NPCBrainBlueprintEdge = {
      id: `${conditionNodeId}-${branch}-${targetCandidate.id}-${Date.now()}`,
      source: conditionNodeId,
      target: targetCandidate.id,
      branch,
    };
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...nextEdges, newEdge],
    });
    setSelectedEdgeId(newEdge.id);
    setEdgeIntegrityMessage(`condition ${conditionNodeId}에 ${branch} branch를 추가했습니다.`);
  };
  const fixConditionBranches = (conditionNodeId: string) => {
    if (!selectedBlueprint) return;
    const issues = conditionBranchIssues.get(conditionNodeId) ?? [];
    const needsTrue = issues.some((issue) => issue.startsWith('true branch'));
    const needsFalse = issues.some((issue) => issue.startsWith('false branch'));
    if (!needsTrue && !needsFalse) return;
    const nextEdges = [...selectedBlueprint.edges];
    const missingBranches = [
      ...(needsTrue ? (['true'] as const) : []),
      ...(needsFalse ? (['false'] as const) : []),
    ];
    let addedCount = 0;
    for (const branch of missingBranches) {
      const hasBranch = nextEdges.some(
        (edge) => edge.source === conditionNodeId && (edge.branch ?? 'next') === branch,
      );
      if (hasBranch) continue;
      const targetCandidate = availableEdgeNodes.find(
        (node) =>
          node.id !== conditionNodeId &&
          !nextEdges.some((edge) => edge.source === conditionNodeId && edge.target === node.id),
      );
      if (!targetCandidate) continue;
      const integrityError = getEdgeIntegrityError(
        conditionNodeId,
        targetCandidate.id,
        undefined,
        nextEdges,
      );
      if (integrityError) continue;
      nextEdges.push({
        id: `${conditionNodeId}-${branch}-${targetCandidate.id}-${Date.now()}-${addedCount}`,
        source: conditionNodeId,
        target: targetCandidate.id,
        branch,
      });
      addedCount += 1;
    }
    if (addedCount === 0) {
      setEdgeIntegrityMessage('자동 보완할 분기를 찾지 못했습니다.');
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
    setEdgeIntegrityMessage(`누락 분기 ${addedCount}개를 자동 보완했습니다.`);
  };

  const parseNumeric = (value: string, fallback: number): number => {
    const next = Number(value);
    return Number.isFinite(next) ? next : fallback;
  };
  const updateVectorAxis = (
    vector: [number, number, number],
    axis: 0 | 1 | 2,
    rawValue: string,
  ): [number, number, number] => {
    const next = [...vector] as [number, number, number];
    next[axis] = parseNumeric(rawValue, vector[axis]);
    return next;
  };

  return (
    <div className="building-panel__npc-card building-panel__npc-card--brain">
      <div className="building-panel__info-item">
        <span className="building-panel__info-label">AI 두뇌</span>
        <div className="building-panel__segmented">
          {NPC_BRAIN_MODES.map((mode) => (
            <button
              key={mode}
              className={`building-panel__segment-btn ${instance.brain?.mode === mode ? 'building-panel__segment-btn--active' : ''}`}
              onClick={() => updateBrain(instance.id, { mode })}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>
      <div className="building-panel__section-subtitle">행동 블루프린트</div>
      <div className="building-panel__grid">
        <button
          className={`building-panel__grid-btn ${!instance.brain?.blueprintId ? 'building-panel__grid-btn--active' : ''}`}
          onClick={() => updateBrain(instance.id, { blueprintId: '' })}
        >
          없음
        </button>
        {blueprints.map((blueprint) => (
          <button
            key={blueprint.id}
            className={`building-panel__grid-btn ${instance.brain?.blueprintId === blueprint.id ? 'building-panel__grid-btn--active' : ''}`}
            onClick={() =>
              updateBrain(instance.id, {
                mode: 'scripted',
                blueprintId: blueprint.id,
              })
            }
            title={blueprint.description}
          >
            {blueprint.name}
          </button>
        ))}
      </div>
      {selectedBlueprint && (
        <>
          <div ref={brainEditorRef} className="building-panel__node-editor">
            <div className="building-panel__asset-targets building-panel__brain-summary">
              <span>{selectedBlueprint.name}</span>
              <span>
                {selectedBlueprint.nodes.length} nodes · {selectedBlueprint.edges.length} edges
              </span>
            </div>
            <div className="building-panel__segmented building-panel__brain-toolbar">
              <button
                className="building-panel__segment-btn"
                onClick={() => {
                  const cloned = cloneNPCBlueprintForInstance(selectedBlueprint, instance.id);
                  addBrainBlueprint(cloned);
                  updateBrain(instance.id, {
                    mode: 'scripted',
                    blueprintId: cloned.id,
                  });
                }}
              >
                전용 복제본
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(selectedBlueprint.id, resetNPCBlueprint(selectedBlueprint))
                }
              >
                초기화
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() => setShowReactFlowView((prev) => !prev)}
              >
                {showReactFlowView ? '캔버스 숨기기' : '캔버스 보기'}
              </button>
            </div>
            {showReactFlowView && (
              <div
                className="building-panel__brain-canvas"
                style={{
                  height: isInEditorModal ? '64vh' : '320px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  marginBottom: '8px',
                  background: '#0f172a',
                }}
              >
                <BrainFlow
                  blueprint={selectedBlueprint}
                  selectedNodeId={selectedNodeId}
                  selectedEdgeId={selectedEdgeId}
                  onSelectNode={setSelectedNodeId}
                  onSelectEdge={setSelectedEdgeId}
                />
              </div>
            )}
            <div className="building-panel__brain-tabs">
              <button
                type="button"
                className={`building-panel__brain-tab ${activeNpcTab === 'nodes' ? 'building-panel__brain-tab--active' : ''}`}
                onClick={() => setActiveNpcTab('nodes')}
              >
                노드 목록
              </button>
              <button
                type="button"
                className={`building-panel__brain-tab ${activeNpcTab === 'inspector' ? 'building-panel__brain-tab--active' : ''}`}
                onClick={() => setActiveNpcTab('inspector')}
              >
                노드 인스펙터
              </button>
            </div>
            {activeNpcTab === 'nodes' && (
              <div className="building-panel__node-list">
                {selectedBlueprint.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="building-panel__node-card"
                    style={
                      node.id === selectedNodeId
                        ? { borderColor: '#6dd3ff', boxShadow: '0 0 0 1px #6dd3ff' }
                        : orphanNodeIds.has(node.id)
                          ? { borderColor: '#f59e0b', boxShadow: '0 0 0 1px #f59e0b' }
                          : undefined
                    }
                    onClick={() => {
                      if (node.type === 'start') return;
                      setSelectedNodeId(node.id);
                      setActiveNpcTab('inspector');
                    }}
                  >
                    <div className="building-panel__node-card-header">
                      <div className="building-panel__node-card-title">
                        {getNPCBlueprintNodeTitle(node)}
                      </div>
                      {node.type !== 'start' && (
                        <button
                          className="building-panel__node-card-action"
                          onClick={() =>
                            updateBrainBlueprint(
                              selectedBlueprint.id,
                              removeNPCBlueprintNode(selectedBlueprint, node.id),
                            )
                          }
                        >
                          삭제
                        </button>
                      )}
                    </div>
                    <div className="building-panel__node-card-desc">
                      {getNPCBlueprintNodeDescription(node)}
                    </div>
                    <div className="building-panel__node-card-edge">
                      {getNPCBlueprintOutgoingLabel(selectedBlueprint, node.id)}
                    </div>
                    {orphanNodeIds.has(node.id) && (
                      <div
                        className="building-panel__node-card-edge"
                        style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}
                      >
                        <span>도달 불가(orphan) 노드</span>
                        <button
                          className="building-panel__node-card-action"
                          onClick={(event) => {
                            event.stopPropagation();
                            recoverOrphanNode(node.id);
                          }}
                          disabled={!primaryStartNode}
                        >
                          start 연결
                        </button>
                      </div>
                    )}
                    {conditionBranchIssues.has(node.id) && (
                      <div className="building-panel__node-card-edge" style={{ color: '#f59e0b' }}>
                        {conditionBranchIssues.get(node.id)?.join(' · ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {activeNpcTab === 'inspector' && selectedNode && (
              <div
                className="building-panel__info building-panel__brain-inspector"
                style={{ marginTop: '8px' }}
              >
                <div className="building-panel__section-subtitle">노드 인스펙터</div>
                <FieldRow label="라벨">
                  <input
                    value={selectedNode.label ?? ''}
                    onChange={(event) =>
                      updateSelectedNode((node) => ({ ...node, label: event.target.value }))
                    }
                    style={{ width: '100%' }}
                  />
                </FieldRow>
                <FieldRow label="Outgoing Edge">
                  <select
                    value={selectedEdge?.id ?? ''}
                    onChange={(event) => setSelectedEdgeId(event.target.value || null)}
                    style={{ width: '100%' }}
                    disabled={selectedNodeOutgoingEdges.length === 0}
                  >
                    {selectedNodeOutgoingEdges.length === 0 && <option value="">다음 없음</option>}
                    {selectedNodeOutgoingEdges.map((edge) => (
                      <option key={edge.id} value={edge.id}>
                        {edge.branch ?? 'next'}
                        {' -> '}
                        {selectedBlueprint?.nodes.find((node) => node.id === edge.target)?.label ??
                          edge.target}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <div className="building-panel__segmented">
                  <button
                    className="building-panel__segment-btn"
                    onClick={addOutgoingEdge}
                    disabled={
                      !selectedNode ||
                      availableEdgeNodes.length <= 1 ||
                      !availableEdgeNodes.some(
                        (node) =>
                          node.id !== selectedNode.id &&
                          !selectedBlueprint.edges.some(
                            (edge) => edge.source === selectedNode.id && edge.target === node.id,
                          ),
                      )
                    }
                  >
                    엣지 추가
                  </button>
                  <button
                    className="building-panel__segment-btn"
                    onClick={removeSelectedEdge}
                    disabled={!selectedEdge}
                  >
                    엣지 삭제
                  </button>
                </div>
                {(danglingEdges.length > 0 || orphanNodeIds.size > 0) && (
                  <FieldRow label="그래프 상태">
                    <span>
                      dangling edge {danglingEdges.length} · orphan node {orphanNodeIds.size}
                    </span>
                  </FieldRow>
                )}
                {orphanNodeIds.size > 0 && (
                  <div className="building-panel__segmented">
                    <button
                      className="building-panel__segment-btn"
                      onClick={recoverAllOrphans}
                      disabled={!primaryStartNode}
                    >
                      orphan 전체 복구
                    </button>
                    <button
                      className="building-panel__segment-btn"
                      onClick={() => {
                        if (!selectedNode || !orphanNodeIds.has(selectedNode.id)) return;
                        recoverOrphanNode(selectedNode.id);
                      }}
                      disabled={
                        !selectedNode || !orphanNodeIds.has(selectedNode.id) || !primaryStartNode
                      }
                    >
                      선택 노드 복구
                    </button>
                  </div>
                )}
                {edgeIntegrityMessage && (
                  <FieldRow label="그래프 규칙">
                    <span>{edgeIntegrityMessage}</span>
                  </FieldRow>
                )}
                {selectedEdge && (
                  <>
                    <FieldRow label="Source">
                      <select
                        value={selectedEdge.source}
                        onChange={(event) =>
                          updateSelectedEdge((edge) => ({
                            ...edge,
                            source: event.target.value,
                          }))
                        }
                        style={{ width: '100%' }}
                      >
                        {availableEdgeNodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {getNPCBlueprintNodeTitle(node)}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    <FieldRow label="Branch">
                      <select
                        value={selectedEdge.branch ?? 'next'}
                        onChange={(event) =>
                          updateSelectedEdge((edge) => ({
                            ...edge,
                            branch: event.target.value as 'true' | 'false' | 'next',
                          }))
                        }
                        style={{ width: '100%' }}
                      >
                        <option value="next">next</option>
                        <option value="true">true</option>
                        <option value="false">false</option>
                      </select>
                    </FieldRow>
                    <FieldRow label="Target">
                      <select
                        value={selectedEdge.target}
                        onChange={(event) =>
                          updateSelectedEdge((edge) => ({
                            ...edge,
                            target: event.target.value,
                          }))
                        }
                        style={{ width: '100%' }}
                      >
                        {availableEdgeNodes.map((node) => (
                          <option key={node.id} value={node.id}>
                            {getNPCBlueprintNodeTitle(node)}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    {!selectedEdgeTarget && (
                      <FieldRow label="주의">
                        <span>타겟 노드를 찾을 수 없습니다.</span>
                      </FieldRow>
                    )}
                  </>
                )}
                {selectedNode.type === 'condition' &&
                  conditionBranchIssues.has(selectedNode.id) && (
                    <>
                      <FieldRow label="Branch 검증">
                        <span>{conditionBranchIssues.get(selectedNode.id)?.join(' · ')}</span>
                      </FieldRow>
                      <div className="building-panel__segmented">
                        <button
                          className="building-panel__segment-btn"
                          onClick={() => addConditionBranchEdge(selectedNode.id, 'true')}
                          disabled={selectedNodeOutgoingEdges.some(
                            (edge) => (edge.branch ?? 'next') === 'true',
                          )}
                        >
                          true 분기 추가
                        </button>
                        <button
                          className="building-panel__segment-btn"
                          onClick={() => addConditionBranchEdge(selectedNode.id, 'false')}
                          disabled={selectedNodeOutgoingEdges.some(
                            (edge) => (edge.branch ?? 'next') === 'false',
                          )}
                        >
                          false 분기 추가
                        </button>
                        <button
                          className="building-panel__segment-btn"
                          onClick={() => fixConditionBranches(selectedNode.id)}
                        >
                          누락 분기 자동 보완
                        </button>
                      </div>
                    </>
                  )}
                {selectedNode.type === 'condition' && (
                  <>
                    <FieldRow label="조건 타입">
                      <select
                        value={selectedNode.condition.type}
                        onChange={(event) => {
                          const nextType = event.target
                            .value as (typeof NPC_CONDITION_TYPES)[number];
                          updateSelectedNode((node) => {
                            if (node.type !== 'condition') return node;
                            switch (nextType) {
                              case 'always':
                                return { ...node, condition: { type: 'always' } };
                              case 'navigationIdle':
                                return { ...node, condition: { type: 'navigationIdle' } };
                              case 'perceivedAny':
                                return { ...node, condition: { type: 'perceivedAny' } };
                              case 'questStatus':
                                return {
                                  ...node,
                                  condition: {
                                    type: 'questStatus',
                                    questId: 'welcome',
                                    status: 'active',
                                  },
                                };
                              case 'friendshipAtLeast':
                                return {
                                  ...node,
                                  condition: { type: 'friendshipAtLeast', score: 150 },
                                };
                              case 'memoryEquals':
                                return {
                                  ...node,
                                  condition: {
                                    type: 'memoryEquals',
                                    key: 'memory.key',
                                    value: true,
                                  },
                                };
                              default:
                                return node;
                            }
                          });
                        }}
                      >
                        {NPC_CONDITION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    {selectedNode.condition.type === 'questStatus' && (
                      <>
                        <FieldRow label="Quest ID">
                          <input
                            value={selectedNode.condition.questId}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (
                                  node.type !== 'condition' ||
                                  node.condition.type !== 'questStatus'
                                )
                                  return node;
                                return {
                                  ...node,
                                  condition: { ...node.condition, questId: event.target.value },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Status">
                          <select
                            value={selectedNode.condition.status}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (
                                  node.type !== 'condition' ||
                                  node.condition.type !== 'questStatus'
                                )
                                  return node;
                                return {
                                  ...node,
                                  condition: {
                                    ...node.condition,
                                    status: event.target
                                      .value as (typeof NPC_QUEST_STATUS_OPTIONS)[number],
                                  },
                                };
                              })
                            }
                          >
                            {NPC_QUEST_STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.condition.type === 'friendshipAtLeast' && (
                      <>
                        <FieldRow label="NPC ID(optional)">
                          <input
                            value={selectedNode.condition.npcId ?? ''}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (
                                  node.type !== 'condition' ||
                                  node.condition.type !== 'friendshipAtLeast'
                                )
                                  return node;
                                const nextNpcId = event.target.value.trim();
                                return {
                                  ...node,
                                  condition: {
                                    ...node.condition,
                                    ...(nextNpcId ? { npcId: nextNpcId } : {}),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Score">
                          <input
                            type="number"
                            value={selectedNode.condition.score}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (
                                  node.type !== 'condition' ||
                                  node.condition.type !== 'friendshipAtLeast'
                                )
                                  return node;
                                const score = Number(event.target.value);
                                return {
                                  ...node,
                                  condition: {
                                    ...node.condition,
                                    score: Number.isFinite(score) ? score : node.condition.score,
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                  </>
                )}
                {selectedNode.type === 'action' && (
                  <>
                    <FieldRow label="액션 타입">
                      <select
                        value={selectedNode.action.type}
                        onChange={(event) => {
                          const nextType = event.target.value as (typeof NPC_ACTION_TYPES)[number];
                          updateSelectedNode((node) => {
                            if (node.type !== 'action') return node;
                            switch (nextType) {
                              case 'idle':
                                return { ...node, action: { type: 'idle', animationId: 'idle' } };
                              case 'moveTo':
                                return {
                                  ...node,
                                  action: {
                                    type: 'moveTo',
                                    target: [0, 0, 0],
                                    speed: 2.2,
                                    animationId: 'walk',
                                  },
                                };
                              case 'patrol':
                                return {
                                  ...node,
                                  action: {
                                    type: 'patrol',
                                    waypoints: [
                                      [0, 0, 0],
                                      [2, 0, 2],
                                    ],
                                    speed: 2.2,
                                    loop: true,
                                    animationId: 'walk',
                                  },
                                };
                              case 'wander':
                                return {
                                  ...node,
                                  action: {
                                    type: 'wander',
                                    radius: 4,
                                    speed: 2.2,
                                    waitSeconds: 1.5,
                                  },
                                };
                              case 'playAnimation':
                                return {
                                  ...node,
                                  action: {
                                    type: 'playAnimation',
                                    animationId: 'wave',
                                    loop: false,
                                    speed: 1,
                                  },
                                };
                              case 'lookAt':
                                return { ...node, action: { type: 'lookAt', target: [0, 0, 0] } };
                              case 'speak':
                                return {
                                  ...node,
                                  action: { type: 'speak', text: '안녕?', duration: 2 },
                                };
                              case 'interact':
                                return {
                                  ...node,
                                  action: { type: 'interact', targetId: 'target.entity' },
                                };
                              case 'remember':
                                return {
                                  ...node,
                                  action: { type: 'remember', key: 'memory.key', value: true },
                                };
                              case 'moveToTarget':
                                return {
                                  ...node,
                                  action: {
                                    type: 'moveToTarget',
                                    target: { type: 'self' },
                                    speed: 2.2,
                                    animationId: 'walk',
                                  },
                                };
                              default:
                                return node;
                            }
                          });
                        }}
                      >
                        {NPC_ACTION_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </FieldRow>
                    {selectedNode.action.type === 'wander' && (
                      <>
                        <FieldRow label="반경">
                          <input
                            type="number"
                            value={selectedNode.action.radius ?? 4}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'wander')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    radius: parseNumeric(
                                      event.target.value,
                                      node.action.radius ?? 4,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="속도">
                          <input
                            type="number"
                            value={selectedNode.action.speed ?? 2.2}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'wander')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    speed: parseNumeric(
                                      event.target.value,
                                      node.action.speed ?? 2.2,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="대기(초)">
                          <input
                            type="number"
                            value={selectedNode.action.waitSeconds ?? 1.5}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'wander')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waitSeconds: parseNumeric(
                                      event.target.value,
                                      node.action.waitSeconds ?? 1.5,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'speak' && (
                      <>
                        <FieldRow label="대사">
                          <input
                            value={selectedNode.action.text}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'speak')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    text: event.target.value,
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="지속시간(초)">
                          <input
                            type="number"
                            value={selectedNode.action.duration ?? 2}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'speak')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    duration: parseNumeric(
                                      event.target.value,
                                      node.action.duration ?? 2,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'playAnimation' && (
                      <>
                        <FieldRow label="Animation ID">
                          <input
                            value={selectedNode.action.animationId}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'playAnimation')
                                  return node;
                                return {
                                  ...node,
                                  action: { ...node.action, animationId: event.target.value },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Loop">
                          <input
                            type="checkbox"
                            checked={selectedNode.action.loop ?? false}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'playAnimation')
                                  return node;
                                return {
                                  ...node,
                                  action: { ...node.action, loop: event.target.checked },
                                };
                              })
                            }
                          />
                        </FieldRow>
                        <FieldRow label="재생속도">
                          <input
                            type="number"
                            value={selectedNode.action.speed ?? 1}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'playAnimation')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    speed: parseNumeric(event.target.value, node.action.speed ?? 1),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'moveToTarget' && (
                      <>
                        <FieldRow label="Target">
                          <select
                            value={selectedNode.action.target.type}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget')
                                  return node;
                                const targetType = event.target.value as
                                  | 'point'
                                  | 'self'
                                  | 'nearestPerceived';
                                if (targetType === 'point') {
                                  return {
                                    ...node,
                                    action: {
                                      ...node.action,
                                      target: { type: 'point', value: [0, 0, 0] },
                                    },
                                  };
                                }
                                return {
                                  ...node,
                                  action: { ...node.action, target: { type: targetType } },
                                };
                              })
                            }
                          >
                            <option value="self">self</option>
                            <option value="nearestPerceived">nearestPerceived</option>
                            <option value="point">point</option>
                          </select>
                        </FieldRow>
                        {selectedNode.action.target.type === 'point' && (
                          <>
                            <FieldRow label="Point X">
                              <input
                                type="number"
                                value={selectedNode.action.target.value[0]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (
                                      node.type !== 'action' ||
                                      node.action.type !== 'moveToTarget'
                                    )
                                      return node;
                                    if (node.action.target.type !== 'point') return node;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        target: {
                                          type: 'point',
                                          value: updateVectorAxis(
                                            node.action.target.value,
                                            0,
                                            event.target.value,
                                          ),
                                        },
                                      },
                                    };
                                  })
                                }
                                style={{ width: '100%' }}
                              />
                            </FieldRow>
                            <FieldRow label="Point Y">
                              <input
                                type="number"
                                value={selectedNode.action.target.value[1]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (
                                      node.type !== 'action' ||
                                      node.action.type !== 'moveToTarget'
                                    )
                                      return node;
                                    if (node.action.target.type !== 'point') return node;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        target: {
                                          type: 'point',
                                          value: updateVectorAxis(
                                            node.action.target.value,
                                            1,
                                            event.target.value,
                                          ),
                                        },
                                      },
                                    };
                                  })
                                }
                                style={{ width: '100%' }}
                              />
                            </FieldRow>
                            <FieldRow label="Point Z">
                              <input
                                type="number"
                                value={selectedNode.action.target.value[2]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (
                                      node.type !== 'action' ||
                                      node.action.type !== 'moveToTarget'
                                    )
                                      return node;
                                    if (node.action.target.type !== 'point') return node;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        target: {
                                          type: 'point',
                                          value: updateVectorAxis(
                                            node.action.target.value,
                                            2,
                                            event.target.value,
                                          ),
                                        },
                                      },
                                    };
                                  })
                                }
                                style={{ width: '100%' }}
                              />
                            </FieldRow>
                          </>
                        )}
                        <FieldRow label="속도">
                          <input
                            type="number"
                            value={selectedNode.action.speed ?? 2.2}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    speed: parseNumeric(
                                      event.target.value,
                                      node.action.speed ?? 2.2,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Animation ID">
                          <input
                            value={selectedNode.action.animationId ?? ''}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveToTarget')
                                  return node;
                                const nextAnimationId = event.target.value.trim();
                                const restAction = { ...node.action };
                                delete restAction.animationId;
                                return {
                                  ...node,
                                  action: {
                                    ...restAction,
                                    ...(nextAnimationId ? { animationId: nextAnimationId } : {}),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'idle' && (
                      <FieldRow label="Animation ID">
                        <input
                          value={selectedNode.action.animationId ?? ''}
                          onChange={(event) =>
                            updateSelectedNode((node) => {
                              if (node.type !== 'action' || node.action.type !== 'idle')
                                return node;
                              const nextAnimationId = event.target.value.trim();
                              const restAction = { ...node.action };
                              delete restAction.animationId;
                              return {
                                ...node,
                                action: {
                                  ...restAction,
                                  ...(nextAnimationId ? { animationId: nextAnimationId } : {}),
                                },
                              };
                            })
                          }
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    )}
                    {selectedNode.action.type === 'interact' && (
                      <FieldRow label="Target ID">
                        <input
                          value={selectedNode.action.targetId}
                          onChange={(event) =>
                            updateSelectedNode((node) => {
                              if (node.type !== 'action' || node.action.type !== 'interact')
                                return node;
                              return {
                                ...node,
                                action: { ...node.action, targetId: event.target.value },
                              };
                            })
                          }
                          style={{ width: '100%' }}
                        />
                      </FieldRow>
                    )}
                    {selectedNode.action.type === 'remember' && (
                      <>
                        <FieldRow label="Memory Key">
                          <input
                            value={selectedNode.action.key}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'remember')
                                  return node;
                                return {
                                  ...node,
                                  action: { ...node.action, key: event.target.value },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Memory Value">
                          <input
                            value={String(selectedNode.action.value)}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'remember')
                                  return node;
                                return {
                                  ...node,
                                  action: { ...node.action, value: event.target.value },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'moveTo' && (
                      <>
                        <FieldRow label="Target X">
                          <input
                            type="number"
                            value={selectedNode.action.target[0]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveTo')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      0,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Target Y">
                          <input
                            type="number"
                            value={selectedNode.action.target[1]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveTo')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      1,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Target Z">
                          <input
                            type="number"
                            value={selectedNode.action.target[2]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveTo')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      2,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="속도">
                          <input
                            type="number"
                            value={selectedNode.action.speed ?? 2.2}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'moveTo')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    speed: parseNumeric(
                                      event.target.value,
                                      node.action.speed ?? 2.2,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'lookAt' && (
                      <>
                        <FieldRow label="Target X">
                          <input
                            type="number"
                            value={selectedNode.action.target[0]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'lookAt')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      0,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Target Y">
                          <input
                            type="number"
                            value={selectedNode.action.target[1]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'lookAt')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      1,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Target Z">
                          <input
                            type="number"
                            value={selectedNode.action.target[2]}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'lookAt')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    target: updateVectorAxis(
                                      node.action.target,
                                      2,
                                      event.target.value,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                      </>
                    )}
                    {selectedNode.action.type === 'patrol' && (
                      <>
                        <FieldRow label="웨이포인트 수">
                          <span>{selectedNode.action.waypoints.length}</span>
                        </FieldRow>
                        <div
                          className="building-panel__info-item"
                          style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}
                        >
                          <span className="building-panel__info-label">웨이포인트 편집</span>
                          {selectedNode.action.waypoints.map((waypoint, index) => (
                            <div
                              key={`waypoint-${index}`}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto auto auto',
                                gap: '4px',
                                alignItems: 'center',
                              }}
                            >
                              <input
                                type="number"
                                value={waypoint[0]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    const nextWaypoints = [...node.action.waypoints] as [
                                      number,
                                      number,
                                      number,
                                    ][];
                                    const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                    nextWaypoints[index] = updateVectorAxis(
                                      currentWaypoint,
                                      0,
                                      event.target.value,
                                    );
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: nextWaypoints,
                                      },
                                    };
                                  })
                                }
                              />
                              <input
                                type="number"
                                value={waypoint[1]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    const nextWaypoints = [...node.action.waypoints] as [
                                      number,
                                      number,
                                      number,
                                    ][];
                                    const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                    nextWaypoints[index] = updateVectorAxis(
                                      currentWaypoint,
                                      1,
                                      event.target.value,
                                    );
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: nextWaypoints,
                                      },
                                    };
                                  })
                                }
                              />
                              <input
                                type="number"
                                value={waypoint[2]}
                                onChange={(event) =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    const nextWaypoints = [...node.action.waypoints] as [
                                      number,
                                      number,
                                      number,
                                    ][];
                                    const currentWaypoint = nextWaypoints[index] ?? waypoint;
                                    nextWaypoints[index] = updateVectorAxis(
                                      currentWaypoint,
                                      2,
                                      event.target.value,
                                    );
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: nextWaypoints,
                                      },
                                    };
                                  })
                                }
                              />
                              <button
                                className="building-panel__segment-btn"
                                onClick={() =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    if (index <= 0) return node;
                                    const nextWaypoints = [...node.action.waypoints] as [
                                      number,
                                      number,
                                      number,
                                    ][];
                                    const previous = nextWaypoints[index - 1];
                                    const current = nextWaypoints[index];
                                    if (!previous || !current) return node;
                                    nextWaypoints[index - 1] = current;
                                    nextWaypoints[index] = previous;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: nextWaypoints,
                                      },
                                    };
                                  })
                                }
                              >
                                위
                              </button>
                              <button
                                className="building-panel__segment-btn"
                                onClick={() =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    if (index >= node.action.waypoints.length - 1) return node;
                                    const nextWaypoints = [...node.action.waypoints] as [
                                      number,
                                      number,
                                      number,
                                    ][];
                                    const current = nextWaypoints[index];
                                    const next = nextWaypoints[index + 1];
                                    if (!current || !next) return node;
                                    nextWaypoints[index] = next;
                                    nextWaypoints[index + 1] = current;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: nextWaypoints,
                                      },
                                    };
                                  })
                                }
                              >
                                아래
                              </button>
                              <button
                                className="building-panel__segment-btn"
                                onClick={() =>
                                  updateSelectedNode((node) => {
                                    if (node.type !== 'action' || node.action.type !== 'patrol')
                                      return node;
                                    if (node.action.waypoints.length <= 1) return node;
                                    return {
                                      ...node,
                                      action: {
                                        ...node.action,
                                        waypoints: node.action.waypoints.filter(
                                          (_, waypointIndex) => waypointIndex !== index,
                                        ),
                                      },
                                    };
                                  })
                                }
                              >
                                삭제
                              </button>
                            </div>
                          ))}
                          <button
                            className="building-panel__segment-btn"
                            onClick={() =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol')
                                  return node;
                                const lastWaypoint = node.action.waypoints[
                                  node.action.waypoints.length - 1
                                ] ?? [0, 0, 0];
                                const nextWaypoint: [number, number, number] = [
                                  lastWaypoint[0] + 1,
                                  lastWaypoint[1],
                                  lastWaypoint[2] + 1,
                                ];
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    waypoints: [...node.action.waypoints, nextWaypoint],
                                  },
                                };
                              })
                            }
                          >
                            웨이포인트 추가
                          </button>
                        </div>
                        <FieldRow label="속도">
                          <input
                            type="number"
                            value={selectedNode.action.speed ?? 2.2}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol')
                                  return node;
                                return {
                                  ...node,
                                  action: {
                                    ...node.action,
                                    speed: parseNumeric(
                                      event.target.value,
                                      node.action.speed ?? 2.2,
                                    ),
                                  },
                                };
                              })
                            }
                            style={{ width: '100%' }}
                          />
                        </FieldRow>
                        <FieldRow label="Loop">
                          <input
                            type="checkbox"
                            checked={selectedNode.action.loop ?? true}
                            onChange={(event) =>
                              updateSelectedNode((node) => {
                                if (node.type !== 'action' || node.action.type !== 'patrol')
                                  return node;
                                return {
                                  ...node,
                                  action: { ...node.action, loop: event.target.checked },
                                };
                              })
                            }
                          />
                        </FieldRow>
                      </>
                    )}
                  </>
                )}
              </div>
            )}
            <div className="building-panel__segmented">
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(
                    selectedBlueprint.id,
                    appendNPCConditionNodeWithBranchTemplate(
                      selectedBlueprint,
                      createNPCConditionNode('navigationIdle'),
                      instance.behavior,
                    ),
                  )
                }
              >
                조건:이동 대기
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(
                    selectedBlueprint.id,
                    appendNPCConditionNodeWithBranchTemplate(
                      selectedBlueprint,
                      createNPCConditionNode('questStatus'),
                      instance.behavior,
                    ),
                  )
                }
              >
                조건:퀘스트
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(
                    selectedBlueprint.id,
                    appendNPCConditionNodeWithBranchTemplate(
                      selectedBlueprint,
                      createNPCConditionNode('friendshipAtLeast'),
                      instance.behavior,
                    ),
                  )
                }
              >
                조건:친밀도
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(
                    selectedBlueprint.id,
                    appendNPCBlueprintNode(
                      selectedBlueprint,
                      createNPCActionNode('wander', instance.behavior),
                    ),
                  )
                }
              >
                배회 노드 추가
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() =>
                  updateBrainBlueprint(
                    selectedBlueprint.id,
                    appendNPCBlueprintNode(
                      selectedBlueprint,
                      createNPCActionNode('speak', instance.behavior),
                    ),
                  )
                }
              >
                대화 노드 추가
              </button>
              <button
                className="building-panel__segment-btn"
                onClick={() => {
                  const withQuestGate = appendNPCConditionNodeWithBranchTemplate(
                    selectedBlueprint,
                    createNPCConditionNode('questStatus'),
                    instance.behavior,
                  );
                  const withSpeak = appendNPCBlueprintNode(
                    withQuestGate,
                    createNPCActionNode('speak', instance.behavior),
                  );
                  updateBrainBlueprint(selectedBlueprint.id, withSpeak);
                }}
              >
                프리셋:퀘스트 대화
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

