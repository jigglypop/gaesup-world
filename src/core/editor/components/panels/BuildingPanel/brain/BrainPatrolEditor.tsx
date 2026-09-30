import { BrainWaypointRow } from './BrainWaypointRow';
import type { NPCBrainEditor } from './useNPCBrainEditor';
import { FieldRow } from '../../../fields';

/** Patrol route fields. */
export function BrainPatrolEditor({ editor }: { editor: NPCBrainEditor }) {
  const { updateSelectedNode, selectedNode, parseNumeric } = editor;
  if (selectedNode?.type !== 'action') return null;
  return (
    <>
      {selectedNode.action.type === 'patrol' && (
        <>
          <FieldRow label="웨이포인트 수">
            <span>{selectedNode.action.waypoints.length}</span>
          </FieldRow>
          <div
            className="building-panel__info-item"
            style={{ flexDirection: 'column', alignItems: 'stretch', gap: '6px' }}
          >
            <span className="building-panel__info-label">웨이포인트 편집</span>
            {selectedNode.action.waypoints.map((waypoint, index) => (
              <BrainWaypointRow key={`waypoint-${index}`} editor={editor} waypoint={waypoint} index={index} />
            ))}
            <button
              className="building-panel__segment-btn"
              onClick={() =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'patrol')
                    return node;
                  const lastWaypoint = node.action.waypoints[
                    node.action.waypoints.length - 1
                  ] ?? [0, 0, 0];
                  const nextWaypoint: [number, number, number] = [
                    lastWaypoint[0] + 1,
                    lastWaypoint[1],
                    lastWaypoint[2] + 1,
                  ];
                  return {
                    ...node,
                    action: {
                      ...node.action,
                      waypoints: [...node.action.waypoints, nextWaypoint],
                    },
                  };
                })
              }
            >
              웨이포인트 추가
            </button>
          </div>
          <FieldRow label="속도">
            <input
              type="number"
              value={selectedNode.action.speed ?? 2.2}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'patrol')
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
          <FieldRow label="반복">
            <input
              type="checkbox"
              checked={selectedNode.action.loop ?? true}
              onChange={(event) =>
                updateSelectedNode((node) => {
                  if (node.type !== 'action' || node.action.type !== 'patrol')
                    return node;
                  return {
                    ...node,
                    action: { ...node.action, loop: event.target.checked },
                  };
                })
              }
            />
          </FieldRow>
        </>
      )}
    </>
  );
}
