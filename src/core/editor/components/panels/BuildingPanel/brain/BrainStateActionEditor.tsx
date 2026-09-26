import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** Idle, interact and remember action fields. */
export function BrainStateActionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      {selectedNode.action.type === 'idle' && (
        <FieldRow label="애니메이션 식별자">
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
        <FieldRow label="대상 식별자">
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
          <FieldRow label="기억 키">
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
          <FieldRow label="기억 값">
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
    </>
  );
}
