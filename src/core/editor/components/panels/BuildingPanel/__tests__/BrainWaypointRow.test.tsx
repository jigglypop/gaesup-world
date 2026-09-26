import { fireEvent, render, screen } from '@testing-library/react';

import type { NPCBrainBlueprintNode } from '../../../../../npc/types';
import { BrainWaypointRow } from '../brain/BrainWaypointRow';
import type { NPCBrainEditor } from '../brain/useNPCBrainEditor';

type Waypoint = [number, number, number];

/** Renders one row of a patrol route and returns a reader for the route the row's edits produce. */
function renderRow(route: Waypoint[], index: number) {
  let node: NPCBrainBlueprintNode = { id: 'patrol', type: 'action', action: { type: 'patrol', waypoints: route } };
  const editor = {
    updateSelectedNode: (updater: (current: NPCBrainBlueprintNode) => NPCBrainBlueprintNode) => { node = updater(node); },
    updateVectorAxis: (vector: Waypoint, axis: 0 | 1 | 2, raw: string): Waypoint => {
      const next = [...vector] as Waypoint;
      next[axis] = Number(raw);
      return next;
    },
  } as unknown as NPCBrainEditor;
  render(<BrainWaypointRow editor={editor} waypoint={route[index]!} index={index} />);
  return () => (node.type === 'action' && node.action.type === 'patrol' ? node.action.waypoints : []);
}

test('a waypoint row edits one axis, moves the point along the route and removes it', () => {
  const route = renderRow([[0, 0, 0], [1, 0, 1], [2, 0, 2]], 1);
  fireEvent.change(screen.getAllByRole('spinbutton')[2]!, { target: { value: '9' } });
  expect(route()).toEqual([[0, 0, 0], [1, 0, 9], [2, 0, 2]]);
  fireEvent.click(screen.getByRole('button', { name: '위' }));
  expect(route()).toEqual([[1, 0, 9], [0, 0, 0], [2, 0, 2]]);
  fireEvent.click(screen.getByRole('button', { name: '아래' }));
  expect(route()).toEqual([[1, 0, 9], [2, 0, 2], [0, 0, 0]]);
  fireEvent.click(screen.getByRole('button', { name: '삭제' }));
  expect(route()).toEqual([[1, 0, 9], [0, 0, 0]]);
});

test.each([
  ['the first point cannot move up', [[0, 0, 0], [1, 1, 1]] as Waypoint[], 0, '위'],
  ['the last point cannot move down', [[0, 0, 0], [1, 1, 1]] as Waypoint[], 1, '아래'],
  ['the only point cannot be removed', [[5, 5, 5]] as Waypoint[], 0, '삭제'],
])('%s', (_label, waypoints, index, button) => {
  const route = renderRow(waypoints, index);
  fireEvent.click(screen.getByRole('button', { name: button }));
  expect(route()).toEqual(waypoints);
});
