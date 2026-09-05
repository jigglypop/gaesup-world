import { fireEvent, render, screen } from '@testing-library/react';

import type { NPCBrainBlueprint, NPCInstance } from '../../../../../npc/types';
import { NPCBrainSection } from '../sections';
import { getNPCBlueprintNodeTitle, getNPCBlueprintNodeDescription } from '../helpers';

type FlowProps = Parameters<typeof import('../flow').BrainFlow>[0];
let mockFlowProps: FlowProps | undefined;
jest.mock('../flow', () => ({ BrainFlow: (props: FlowProps) => { mockFlowProps = props; return null; } }));

const INSTANCE: NPCInstance = {
  id: 'npc', templateId: 'template', name: 'NPC',
  position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1],
};

test('localized inspector repairs missing branches using graph data and keeps command identifiers', () => {
  const blueprint: NPCBrainBlueprint = {
    id: 'brain', name: 'Test brain',
    nodes: [
      { id: 'start', type: 'start' },
      { id: 'condition', type: 'condition', condition: { type: 'navigationIdle' } },
      { id: 'left', type: 'action', action: { type: 'idle' } },
      { id: 'right', type: 'action', action: { type: 'wander' } },
    ],
    edges: [{ id: 'entry', source: 'start', target: 'condition', branch: 'next' }],
  };
  const updateBrain = jest.fn();
  const updateBrainBlueprint = jest.fn();
  render(<NPCBrainSection
    instance={INSTANCE}
    blueprints={[blueprint]}
    selectedBlueprint={blueprint}
    updateBrain={updateBrain}
    addBrainBlueprint={jest.fn()}
    updateBrainBlueprint={updateBrainBlueprint}
  />);

  fireEvent.click(screen.getByRole('button', { name: '스크립트', exact: true }));
  expect(updateBrain).toHaveBeenCalledWith('npc', { mode: 'scripted' });
  fireEvent.click(screen.getByRole('button', { name: '노드 인스펙터', exact: true }));
  expect(screen.getByText('참 분기 누락 · 거짓 분기 누락')).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: '누락 분기 자동 보완' }));
  expect(updateBrainBlueprint).toHaveBeenCalledWith('brain', expect.objectContaining({
    edges: [
      blueprint.edges[0],
      expect.objectContaining({ source: 'condition', target: 'left', branch: 'true' }),
      expect.objectContaining({ source: 'condition', target: 'right', branch: 'false' }),
    ],
  }));
  expect(blueprint.edges).toHaveLength(1);
  if (!mockFlowProps) throw new Error('Missing graph');
  mockFlowProps.onDelete(['start', 'left'], ['entry']);
  expect(updateBrainBlueprint).toHaveBeenLastCalledWith('brain', expect.objectContaining({
    nodes: [blueprint.nodes[0], blueprint.nodes[1], blueprint.nodes[3]],
    edges: [],
  }));
  expect(blueprint.nodes).toHaveLength(4);
  expect(blueprint.edges).toHaveLength(1);
});

test('default node text is localized while caller labels and dialogue remain unchanged', () => {
  expect(getNPCBlueprintNodeTitle({ id: 'start', type: 'start' })).toBe('시작');
  expect(getNPCBlueprintNodeTitle({ id: 'move', type: 'action', action: { type: 'moveTo', target: [0, 0, 0] } })).toBe('행동: 지점 이동');
  expect(getNPCBlueprintNodeTitle({ id: 'custom', type: 'start', label: 'My label' })).toBe('My label');
  expect(getNPCBlueprintNodeDescription({ id: 'say', type: 'action', action: { type: 'speak', text: 'Hello' } })).toBe('Hello');
});
