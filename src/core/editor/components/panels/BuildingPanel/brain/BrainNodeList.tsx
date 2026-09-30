import { getNPCBlueprintNodeDescription, getNPCBlueprintNodeTitle, getNPCBlueprintOutgoingLabel, removeNPCBlueprintNode } from '../helpers';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** The blueprint nodes with their outgoing labels. */
export function BrainNodeList({ editor }: { editor: NPCBrainEditor }) {
  const { selectedBlueprint, updateBrainBlueprint, selectedNodeId, setSelectedNodeId, activeNpcTab, setActiveNpcTab, primaryStartNode, orphanNodeIds, conditionBranchIssues, recoverOrphanNode } = editor;
  if (!selectedBlueprint) return null;
  return (
    <>
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
                  <span>도달 불가 노드</span>
                  <button
                    className="building-panel__node-card-action"
                    onClick={(event) => {
                      event.stopPropagation();
                      recoverOrphanNode(node.id);
                    }}
                    disabled={!primaryStartNode}
                  >
                    시작점에 연결
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
    </>
  );
}
