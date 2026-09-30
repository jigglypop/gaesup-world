import type { NPCBrainEditor } from './useNPCBrainEditor';

type Waypoint = [number, number, number];

const AXES = [0, 1, 2] as const;

/** One patrol waypoint: its x, y and z, and buttons that move it up, down or remove it. */
export function BrainWaypointRow({ editor, waypoint, index }: { editor: NPCBrainEditor; waypoint: Waypoint; index: number }) {
  const { updateSelectedNode, updateVectorAxis } = editor;
  // Each edit rewrites the patrol's waypoint list; null keeps the node unchanged.
  const editWaypoints = (edit: (waypoints: Waypoint[]) => Waypoint[] | null) =>
    updateSelectedNode((node) => {
      if (node.type !== 'action' || node.action.type !== 'patrol') return node;
      const waypoints = edit([...node.action.waypoints] as Waypoint[]);
      return waypoints ? { ...node, action: { ...node.action, waypoints } } : node;
    });
  const swap = (first: number, second: number) =>
    editWaypoints((waypoints) => {
      const a = waypoints[first];
      const b = waypoints[second];
      if (first < 0 || !a || !b) return null;
      waypoints[first] = b;
      waypoints[second] = a;
      return waypoints;
    });

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto auto auto',
        gap: '4px',
        alignItems: 'center',
      }}
    >
      {AXES.map((axis) => (
        <input
          key={axis}
          type="number"
          value={waypoint[axis]}
          onChange={(event) =>
            editWaypoints((waypoints) => {
              waypoints[index] = updateVectorAxis(waypoints[index] ?? waypoint, axis, event.target.value);
              return waypoints;
            })
          }
        />
      ))}
      <button className="building-panel__segment-btn" onClick={() => swap(index - 1, index)}>
        위
      </button>
      <button className="building-panel__segment-btn" onClick={() => swap(index, index + 1)}>
        아래
      </button>
      <button
        className="building-panel__segment-btn"
        onClick={() =>
          editWaypoints((waypoints) =>
            waypoints.length <= 1 ? null : waypoints.filter((_, waypointIndex) => waypointIndex !== index))
        }
      >
        삭제
      </button>
    </div>
  );
}
