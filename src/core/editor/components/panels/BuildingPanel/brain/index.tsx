import { NPC_BRAIN_MODES } from './constants';
import { BrainFlow } from '../flow';
import { cloneNPCBlueprintForInstance, getNPCBrainLabel, removeNPCBlueprintNode, resetNPCBlueprint } from '../helpers';
import { BrainNodeInspector } from './BrainNodeInspector';
import { BrainNodeList } from './BrainNodeList';
import { BrainPresetButtons } from './BrainPresetButtons';
import type { NPCBrainSectionProps } from './types';
import { useNPCBrainEditor } from './useNPCBrainEditor';

export type { NPCBrainPreviewState, NPCBrainSectionProps } from './types';

export function NPCBrainSection(props: NPCBrainSectionProps) {
  const editor = useNPCBrainEditor(props);
  const { instance, blueprints, selectedBlueprint, updateBrain, addBrainBlueprint, updateBrainBlueprint, brainEditorRef, selectedNodeId, setSelectedNodeId, selectedEdgeId, setSelectedEdgeId, showReactFlowView, setShowReactFlowView, activeNpcTab, setActiveNpcTab, isInEditorModal } = editor;
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
              {getNPCBrainLabel(mode)}
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
                {selectedBlueprint.nodes.length} 노드 · {selectedBlueprint.edges.length} 연결
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
                  onDelete={(nodeIds, edgeIds) => {
                    const next = nodeIds.reduce(removeNPCBlueprintNode, selectedBlueprint);
                    const removedEdges = new Set(edgeIds);
                    updateBrainBlueprint(selectedBlueprint.id, {
                      ...next,
                      edges: next.edges.filter((edge) => !removedEdges.has(edge.id)),
                    });
                  }}
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
            <BrainNodeList editor={editor} />
            <BrainNodeInspector editor={editor} />
            <BrainPresetButtons editor={editor} />
          </div>
        </>
      )}
    </div>
  );
}
