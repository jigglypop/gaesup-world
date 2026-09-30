import React from 'react';

import type { NPCBrainBlueprintEdge, NPCBrainBlueprintNode } from '../../../../../npc/types';
import { createUniqueId } from '../../../../../utils/id';
import { getNPCBrainLabel } from '../helpers';
import { brainPreviewState } from './preview';
import type { NPCBrainSectionProps } from './types';

/** The brain editor's selection, graph health and edits, shared by the section's parts. */
export function useNPCBrainEditor({
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
    onPreviewStateChange?.(brainPreviewState(selectedNode, instance.behavior));
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
      if (!branches.includes('true')) nextIssues.push('참 분기 누락');
      if (!branches.includes('false')) nextIssues.push('거짓 분기 누락');
      if (branches.includes('next')) nextIssues.push('조건에는 다음 대신 참·거짓 분기를 권장합니다');
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
    setEdgeIntegrityMessage(`유효하지 않은 연결 ${danglingEdges.length}개를 자동 정리했습니다.`);
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
      return '같은 시작 노드와 대상 노드 사이에 이미 연결이 있습니다.';
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
      id: createUniqueId(`${primaryStartNode.id}-${targetNodeId}`),
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
    setEdgeIntegrityMessage(`도달 불가 노드 ${targetNodeId}를 시작점에 연결했습니다.`);
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
        id: createUniqueId(`${primaryStartNode.id}-${orphanNodeId}`),
        source: primaryStartNode.id,
        target: orphanNodeId,
        branch: 'next',
      });
      recoveredCount += 1;
    }
    if (recoveredCount === 0) {
      setEdgeIntegrityMessage('복구 가능한 도달 불가 노드가 없습니다.');
      return;
    }
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: nextEdges,
    });
    setEdgeIntegrityMessage(`도달 불가 노드 ${recoveredCount}개를 시작점에 연결했습니다.`);
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
      id: createUniqueId(`${selectedNodeId}-${fallbackTarget.id}`),
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
      setEdgeIntegrityMessage(`${getNPCBrainLabel(branch)} 분기를 추가할 대상 노드를 찾을 수 없습니다.`);
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
      id: createUniqueId(`${conditionNodeId}-${branch}-${targetCandidate.id}`),
      source: conditionNodeId,
      target: targetCandidate.id,
      branch,
    };
    updateBrainBlueprint(selectedBlueprint.id, {
      ...selectedBlueprint,
      edges: [...nextEdges, newEdge],
    });
    setSelectedEdgeId(newEdge.id);
    setEdgeIntegrityMessage(`조건 ${conditionNodeId}에 ${getNPCBrainLabel(branch)} 분기를 추가했습니다.`);
  };
  const fixConditionBranches = (conditionNodeId: string) => {
    if (!selectedBlueprint) return;
    const branches = selectedBlueprint.edges
      .filter((edge) => edge.source === conditionNodeId)
      .map((edge) => edge.branch ?? 'next');
    const needsTrue = !branches.includes('true');
    const needsFalse = !branches.includes('false');
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
        id: createUniqueId(`${conditionNodeId}-${branch}-${targetCandidate.id}`),
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

  return {
    instance,
    blueprints,
    selectedBlueprint,
    updateBrain,
    addBrainBlueprint,
    updateBrainBlueprint,
    brainEditorRef,
    selectedNodeId,
    setSelectedNodeId,
    selectedEdgeId,
    setSelectedEdgeId,
    edgeIntegrityMessage,
    setEdgeIntegrityMessage,
    showReactFlowView,
    setShowReactFlowView,
    activeNpcTab,
    setActiveNpcTab,
    isInEditorModal,
    setIsInEditorModal,
    updateSelectedNode,
    selectedNode,
    primaryStartNode,
    blueprintNodeIds,
    danglingEdges,
    reachableNodeIds,
    orphanNodeIds,
    conditionBranchIssues,
    availableEdgeNodes,
    selectedNodeOutgoingEdges,
    selectedEdge,
    selectedEdgeTarget,
    getEdgeIntegrityError,
    updateSelectedEdge,
    recoverOrphanNode,
    recoverAllOrphans,
    addOutgoingEdge,
    removeSelectedEdge,
    addConditionBranchEdge,
    fixConditionBranches,
    parseNumeric,
    updateVectorAxis,
  };
}

export type NPCBrainEditor = ReturnType<typeof useNPCBrainEditor>;
