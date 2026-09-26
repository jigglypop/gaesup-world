import { BrainMoveToTargetEditor } from './BrainMoveToTargetEditor';
import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** Target, point and look-at action fields. */
export function BrainMoveActionEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode, parseNumeric, updateVectorAxis } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      <BrainMoveToTargetEditor editor={editor} />
      {selectedNode.action.type === 'moveTo' && (
        <>
          <FieldRow label="대상 X">
            <input
              type="number"
              value={selectedNode.action.target[0]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'moveTo')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        0,
                        event.target.value,
                      ),
                    },
                  };
                })
              }
              style={{ width: '100%' }}
            />
          </FieldRow>
          <FieldRow label="대상 Y">
            <input
              type="number"
              value={selectedNode.action.target[1]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'moveTo')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        1,
                        event.target.value,
                      ),
                    },
                  };
                })
              }
              style={{ width: '100%' }}
            />
          </FieldRow>
          <FieldRow label="대상 Z">
            <input
              type="number"
              value={selectedNode.action.target[2]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'moveTo')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        2,
                        event.target.value,
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
                  if (node.type !== 'action' || node.action.type !== 'moveTo')
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
        </>
      )}
      {selectedNode.action.type === 'lookAt' && (
        <>
          <FieldRow label="대상 X">
            <input
              type="number"
              value={selectedNode.action.target[0]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'lookAt')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        0,
                        event.target.value,
                      ),
                    },
                  };
                })
              }
              style={{ width: '100%' }}
            />
          </FieldRow>
          <FieldRow label="대상 Y">
            <input
              type="number"
              value={selectedNode.action.target[1]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'lookAt')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        1,
                        event.target.value,
                      ),
                    },
                  };
                })
              }
              style={{ width: '100%' }}
            />
          </FieldRow>
          <FieldRow label="대상 Z">
            <input
              type="number"
              value={selectedNode.action.target[2]}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'lookAt')
                    return node;
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      target: updateVectorAxis(
                        node.action.target,
                        2,
                        event.target.value,
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
    </>
  );
}
