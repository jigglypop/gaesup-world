import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** Wander, speak and animation action fields. */
export function BrainTimedActionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode, parseNumeric } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
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
          <FieldRow label="애니메이션 식별자">
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
          <FieldRow label="반복">
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
    </>
  );
}
