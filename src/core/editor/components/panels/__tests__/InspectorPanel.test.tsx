import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { createMeshRendererComponent, createSceneDocument } from '../../../../scene-object';
import { InspectorPanel } from '../InspectorPanel';

describe('InspectorPanel', () => {
  const document = createSceneDocument({
    id: 'scene',
    objects: [
      {
        id: 'tree',
        name: 'Tree',
        layer: 'environment',
        tags: ['resource'],
        transform: { position: [1, 2, 3] },
        components: [createMeshRendererComponent({ id: 'mesh', assetId: 'tree.glb' })],
      },
    ],
  });

  test('renders selected scene object properties and components', () => {
    render(<InspectorPanel sceneDocument={document} selectedObjectId="tree" />);

    expect(screen.getByText('Tree')).toBeTruthy();
    expect(screen.getByDisplayValue('environment')).toBeTruthy();
    expect(screen.getByText('gaesup.meshRenderer')).toBeTruthy();
    expect(screen.getByText(/tree.glb/)).toBeTruthy();
  });

  test('emits update patches for object fields and transform values', () => {
    const onUpdateObject = jest.fn();
    render(
      <InspectorPanel
        sceneDocument={document}
        selectedObjectId="tree"
        onUpdateObject={onUpdateObject}
      />,
    );

    fireEvent.change(screen.getByDisplayValue('Tree'), { target: { value: 'Oak' } });
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { name: 'Oak' });

    fireEvent.change(screen.getByLabelText('Position X'), { target: { value: '9' } });
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { transform: { position: [9, 2, 3] } });
  });

  test('emits add and remove component callbacks', () => {
    const onAddComponent = jest.fn();
    const onRemoveComponent = jest.fn();
    render(
      <InspectorPanel
        sceneDocument={document}
        selectedObjectId="tree"
        onAddComponent={onAddComponent}
        onRemoveComponent={onRemoveComponent}
      />,
    );

    fireEvent.change(screen.getByLabelText('New component type'), { target: { value: 'game.health' } });
    fireEvent.click(screen.getByText('Add'));
    expect(onAddComponent).toHaveBeenCalledWith('tree', { type: 'game.health', data: {} });

    fireEvent.click(screen.getByText('Remove'));
    expect(onRemoveComponent).toHaveBeenCalledWith('tree', 'component-1');
  });

  test('renders empty state without selected object', () => {
    render(<InspectorPanel sceneDocument={document} selectedObjectId="missing" />);

    expect(screen.getByText('Select a scene object')).toBeTruthy();
  });
});
