import { FieldRow } from '../../../fields';
import { getNPCBrainLabel } from '../helpers';
import { NPC_QUEST_STATUS_OPTIONS, NPC_CONDITION_TYPES } from './constants';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** Condition node fields. */
export function BrainConditionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode } = editor;
  if (!selectedNode) return null;
  return (
    <>
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
                  {getNPCBrainLabel(type)}
                </option>
              ))}
            </select>
          </FieldRow>
          {selectedNode.condition.type === 'questStatus' && (
            <>
              <FieldRow label="퀘스트 식별자">
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
              <FieldRow label="상태">
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
                      {getNPCBrainLabel(status)}
                    </option>
                  ))}
                </select>
              </FieldRow>
            </>
          )}
          {selectedNode.condition.type === 'friendshipAtLeast' && (
            <>
              <FieldRow label="NPC 식별자(선택)">
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
              <FieldRow label="점수">
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
    </>
  );
}
