import { FieldRow } from '../../../fields';
import { getNPCBrainLabel } from '../helpers';
import { NPC_ACTION_TYPES } from './constants';
import type { NPCBrainEditor } from './useNPCBrainEditor';

/** The action type select, which resets the node to that type's defaults. */
export function BrainActionTypeField({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      <FieldRow label="액션 타입">
        <select
          value={selectedNode.action.type}
          onChange={(event) => {
            const nextType = event.target.value as (typeof NPC_ACTION_TYPES)[number];
            updateSelectedNode((node) => {
              if (node.type !== 'action') return node;
              switch (nextType) {
                case 'idle':
                  return { ...node, action: { type: 'idle', animationId: 'idle' } };
                case 'moveTo':
                  return {
                    ...node,
                    action: {
                      type: 'moveTo',
                      target: [0, 0, 0],
                      speed: 2.2,
                      animationId: 'walk',
                    },
                  };
                case 'patrol':
                  return {
                    ...node,
                    action: {
                      type: 'patrol',
                      waypoints: [
                        [0, 0, 0],
                        [2, 0, 2],
                      ],
                      speed: 2.2,
                      loop: true,
                      animationId: 'walk',
                    },
                  };
                case 'wander':
                  return {
                    ...node,
                    action: {
                      type: 'wander',
                      radius: 4,
                      speed: 2.2,
                      waitSeconds: 1.5,
                    },
                  };
                case 'playAnimation':
                  return {
                    ...node,
                    action: {
                      type: 'playAnimation',
                      animationId: 'wave',
                      loop: false,
                      speed: 1,
                    },
                  };
                case 'lookAt':
                  return { ...node, action: { type: 'lookAt', target: [0, 0, 0] } };
                case 'speak':
                  return {
                    ...node,
                    action: { type: 'speak', text: '안녕?', duration: 2 },
                  };
                case 'interact':
                  return {
                    ...node,
                    action: { type: 'interact', targetId: 'target.entity' },
                  };
                case 'remember':
                  return {
                    ...node,
                    action: { type: 'remember', key: 'memory.key', value: true },
                  };
                case 'moveToTarget':
                  return {
                    ...node,
                    action: {
                      type: 'moveToTarget',
                      target: { type: 'self' },
                      speed: 2.2,
                      animationId: 'walk',
                    },
                  };
                default:
                  return node;
              }
            });
          }}
        >
          {NPC_ACTION_TYPES.map((type) => (
            <option key={type} value={type}>
              {getNPCBrainLabel(type)}
            </option>
          ))}
        </select>
      </FieldRow>
    </>
  );
}
