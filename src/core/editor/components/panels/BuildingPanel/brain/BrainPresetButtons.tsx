import { appendNPCBlueprintNode, appendNPCConditionNodeWithBranchTemplate, createNPCActionNode, createNPCConditionNode } from '../helpers';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** Buttons that append nodes and presets to the blueprint. */
export function BrainPresetButtons({ editor }: { editor: NPCBrainEditor }) {
  const { instance, selectedBlueprint, updateBrainBlueprint } = editor;
  if (!selectedBlueprint) return null;
  return (
    <>
      <div className="building-panel__segmented">
        <button
          className="building-panel__segment-btn"
          onClick={() =>
            updateBrainBlueprint(
              selectedBlueprint.id,
              appendNPCConditionNodeWithBranchTemplate(
                selectedBlueprint,
                createNPCConditionNode(),
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
      </div>
    </>
  );
}
