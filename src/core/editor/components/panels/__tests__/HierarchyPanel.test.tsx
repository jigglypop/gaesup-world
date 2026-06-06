import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { createSceneDocument, createMeshRendererComponent } from '../../../../scene-object';
import { HierarchyPanel, buildHierarchyRows } from '../HierarchyPanel';

describe('HierarchyPanel', () => {
  const document = createSceneDocument({
    id: 'scene',
    objects: [
      { id: 'root', name: 'Root', layer: 'environment' },
      { id: 'player', name: 'Player', parentId: 'root', tags: ['player'] },
      {
        id: 'tree',
        name: 'Tree',
        parentId: 'root',
        tags: ['resource'],
        components: [createMeshRendererComponent({ assetId: 'tree.glb' })],
      },
      { id: 'orphan', name: 'Orphan', parentId: 'missing' },
    ],
  });

  test('builds hierarchy rows with collapsed and expanded parents', () => {
    expect(buildHierarchyRows(document.objects).map((row) => row.object.id)).toEqual(['root', 'orphan']);
    expect(buildHierarchyRows(document.objects, new Set(['root'])).map((row) => row.object.id)).toEqual([
      'root',
      'player',
      'tree',
      'orphan',
    ]);
  });

  test('keeps ancestor chain visible while searching', () => {
    const rows = buildHierarchyRows(document.objects, new Set(), 'resource');

    expect(rows.map((row) => row.object.id)).toEqual(['root', 'tree']);
  });

  test('renders searchable tree and emits selection', () => {
    const onSelectObject = jest.fn();
    const onHoverObject = jest.fn();
    render(
      <HierarchyPanel
        sceneDocument={document}
        selectedObjectIds={['tree', 'player']}
        hoveredObjectId="player"
        defaultExpandedIds={['root']}
        onSelectObject={onSelectObject}
        onHoverObject={onHoverObject}
      />,
    );

    expect(screen.getByText('Root')).toBeTruthy();
    expect(screen.getByText('Tree')).toBeTruthy();
    expect(screen.getByText('1c')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Search scene hierarchy'), { target: { value: 'player' } });
    expect(screen.getByText('Player')).toBeTruthy();
    expect(screen.queryByText('Tree')).toBeNull();

    fireEvent.click(screen.getByText('Player'));
    expect(onSelectObject).toHaveBeenCalledWith(expect.objectContaining({ id: 'player' }));

    fireEvent.mouseEnter(screen.getByText('Player'));
    expect(onHoverObject).toHaveBeenCalledWith(expect.objectContaining({ id: 'player' }));
  });
});
