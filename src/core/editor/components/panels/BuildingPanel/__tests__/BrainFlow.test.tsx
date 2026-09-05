import { act, render } from '@testing-library/react';
import type { ReactFlowProps } from '@xyflow/react';

import type { NPCBrainBlueprint } from '../../../../../npc/types';
import { BrainFlow } from '../flow';

let mockFlowProps: ReactFlowProps;
jest.mock('@xyflow/react', () => ({
  ...jest.requireActual('@xyflow/react'),
  ReactFlow: (props: ReactFlowProps) => { mockFlowProps = props; return null; },
}));

test('preserves dragged positions across selection and reordered blueprint edits', () => {
  const blueprint: NPCBrainBlueprint = {
    id: 'brain', name: '행동',
    nodes: [{ id: 'start', type: 'start' }, { id: 'idle', type: 'action', action: { type: 'idle' } }],
    edges: [],
  };
  const props = { blueprint, selectedNodeId: null, selectedEdgeId: null, onSelectNode: jest.fn(), onSelectEdge: jest.fn(), onDelete: jest.fn() };
  const view = render(<BrainFlow {...props} />);
  expect(mockFlowProps.nodes?.find((node) => node.id === 'start')?.deletable).toBe(false);
  expect(mockFlowProps.deleteKeyCode).toEqual(['Backspace', 'Delete']);
  act(() => {
    mockFlowProps.onDelete?.({
      nodes: [{ id: 'idle', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'edge', source: 'start', target: 'idle' }],
    });
  });
  expect(props.onDelete).toHaveBeenCalledWith(['idle'], ['edge']);
  act(() => {
    mockFlowProps.onNodesChange?.([{ id: 'idle', type: 'position', position: { x: 91, y: 37 } }]);
  });
  view.rerender(<BrainFlow {...props} selectedNodeId="idle" />);
  expect(mockFlowProps.nodes?.find((node) => node.id === 'idle')?.position).toEqual({ x: 91, y: 37 });
  view.rerender(<BrainFlow {...props} blueprint={{
    ...blueprint,
    nodes: [
      { id: 'idle', type: 'action', action: { type: 'idle' }, label: '대기 변경' },
      { id: 'new', type: 'start' },
    ],
  }} />);
  expect(mockFlowProps.nodes?.map((node) => node.id)).toEqual(['idle', 'new']);
  expect(mockFlowProps.nodes?.[0]).toMatchObject({ position: { x: 91, y: 37 }, data: { label: '대기 변경' } });
  expect(mockFlowProps.nodes?.[1]?.position).toEqual({ x: 240, y: 0 });
  expect(blueprint.nodes.map((node) => node.id)).toEqual(['start', 'idle']);
  view.unmount();
});
