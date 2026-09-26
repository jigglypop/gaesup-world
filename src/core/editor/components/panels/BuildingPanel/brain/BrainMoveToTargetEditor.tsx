import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** Move-to-target action fields: target kind, point, speed and animation. */
export function BrainMoveToTargetEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode, parseNumeric, updateVectorAxis } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      {selectedNode.action.type === 'moveToTarget' && (
        <>
          <FieldRow label="대상">
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
              <option value="self">자기 자신</option>
              <option value="nearestPerceived">가장 가까운 감지 대상</option>
              <option value="point">지정 위치</option>
            </select>
          </FieldRow>
          {selectedNode.action.target.type === 'point' && (
            <>
              <FieldRow label="위치 X">
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
              <FieldRow label="위치 Y">
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
              <FieldRow label="위치 Z">
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
          <FieldRow label="애니메이션 식별자">
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
    </>
  );
}
