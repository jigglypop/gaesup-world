import React from 'react';

import {
  Background,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Edge,
  type Node,
  type NodeMouseHandler,
  type EdgeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getNPCBlueprintNodeTitle } from './helpers';
import type { NPCBrainBlueprint } from '../../../../npc/types';

type BrainFlowProps = {
  blueprint: NPCBrainBlueprint;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
};

const NODE_GAP_X = 240;
const NODE_GAP_Y = 130;

const nodeBaseStyle: React.CSSProperties = {
  borderRadius: 10,
  border: '1px solid #3b4258',
  padding: '8px 10px',
  color: '#e5e7eb',
  background: '#182033',
  minWidth: 140,
  textAlign: 'center',
  fontSize: 12,
  fontWeight: 600,
};

const nodeTypeStyle: Record<'start' | 'condition' | 'action', React.CSSProperties> = {
  start: { background: '#1b2f2a', borderColor: '#2f6d5b' },
  condition: { background: '#2d2435', borderColor: '#6b4f81' },
  action: { background: '#1f2b44', borderColor: '#4366a9' },
};

const edgeColorByBranch: Record<'next' | 'true' | 'false', string> = {
  next: '#8b9bb4',
  true: '#34d399',
  false: '#f87171',
};

const createFlowNodes = (blueprint: NPCBrainBlueprint, selectedNodeId: string | null): Node[] =>
  blueprint.nodes.map((node, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    return {
      id: node.id,
      position: { x: column * NODE_GAP_X, y: row * NODE_GAP_Y },
      data: { label: getNPCBlueprintNodeTitle(node) },
      draggable: true,
      style: {
        ...nodeBaseStyle,
        ...nodeTypeStyle[node.type],
        ...(selectedNodeId === node.id ? { boxShadow: '0 0 0 2px #60a5fa' } : {}),
      },
    } as Node;
  });

const createFlowEdges = (blueprint: NPCBrainBlueprint, selectedEdgeId: string | null): Edge[] =>
  blueprint.edges.map((edge) => {
    const branch = edge.branch ?? 'next';
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: branch,
      animated: selectedEdgeId === edge.id,
      markerEnd: { type: MarkerType.ArrowClosed, color: edgeColorByBranch[branch] },
      style: {
        stroke: edgeColorByBranch[branch],
        strokeWidth: selectedEdgeId === edge.id ? 2.5 : 1.6,
      },
      labelStyle: { fill: '#d1d5db', fontSize: 11, fontWeight: 700 },
      labelBgStyle: { fill: '#111827', fillOpacity: 0.85 },
      labelBgPadding: [4, 2],
      labelBgBorderRadius: 4,
    } as Edge;
  });

export function BrainFlow({
  blueprint,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
}: BrainFlowProps) {
  const flowNodes = React.useMemo(
    () => createFlowNodes(blueprint, selectedNodeId),
    [blueprint, selectedNodeId],
  );
  const flowEdges = React.useMemo(
    () => createFlowEdges(blueprint, selectedEdgeId),
    [blueprint, selectedEdgeId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges);

  React.useEffect(() => {
    setNodes((prev) => flowNodes.map((nextNode) => {
      const previous = prev.find((item) => item.id === nextNode.id);
      return previous ? { ...nextNode, position: previous.position } : nextNode;
    }));
  }, [flowNodes, setNodes]);

  React.useEffect(() => {
    setEdges(flowEdges);
  }, [flowEdges, setEdges]);

  const handleNodeClick = React.useCallback<NodeMouseHandler>((_, node) => {
    onSelectNode(node.id);
  }, [onSelectNode]);

  const handleEdgeClick = React.useCallback<EdgeMouseHandler>((_, edge) => {
    onSelectEdge(edge.id);
    onSelectNode(edge.source);
  }, [onSelectEdge, onSelectNode]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={handleNodeClick}
      onEdgeClick={handleEdgeClick}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      minZoom={0.2}
      maxZoom={2}
      colorMode="dark"
      proOptions={{ hideAttribution: true }}
    >
      <MiniMap zoomable pannable nodeColor="#64748b" />
      <Controls />
      <Background gap={20} size={1} color="#334155" />
    </ReactFlow>
  );
}
