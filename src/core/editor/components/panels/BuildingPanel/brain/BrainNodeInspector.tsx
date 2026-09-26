import { BrainActionEditor } from './BrainActionEditor';
import { BrainConditionEditor } from './BrainConditionEditor';
import { BrainEdgeEditor } from './BrainEdgeEditor';
import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** The selected node: label, outgoing edges, graph health and its condition or action. */
export function BrainNodeInspector({ editor }: { editor: NPCBrainEditor }) {
  const { selectedBlueprint, setSelectedEdgeId, edgeIntegrityMessage, activeNpcTab, updateSelectedNode, selectedNode, primaryStartNode, danglingEdges, orphanNodeIds, conditionBranchIssues, availableEdgeNodes, selectedNodeOutgoingEdges, selectedEdge, recoverOrphanNode, recoverAllOrphans, addOutgoingEdge, removeSelectedEdge, addConditionBranchEdge, fixConditionBranches } = editor;
  if (!selectedBlueprint) return null;
  return (
    <>
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
          <FieldRow label="나가는 연결">
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
                끊어진 연결 {danglingEdges.length} · 고립된 노드 {orphanNodeIds.size}
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
                도달 불가 노드 전체 복구
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
          <BrainEdgeEditor editor={editor} />
          {selectedNode.type === 'condition' &&
            conditionBranchIssues.has(selectedNode.id) && (
              <>
                <FieldRow label="분기 검증">
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
                    참 분기 추가
                  </button>
                  <button
                    className="building-panel__segment-btn"
                    onClick={() => addConditionBranchEdge(selectedNode.id, 'false')}
                    disabled={selectedNodeOutgoingEdges.some(
                      (edge) => (edge.branch ?? 'next') === 'false',
                    )}
                  >
                    거짓 분기 추가
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
          <BrainConditionEditor editor={editor} />
          <BrainActionEditor editor={editor} />
        </div>
      )}
    </>
  );
}
