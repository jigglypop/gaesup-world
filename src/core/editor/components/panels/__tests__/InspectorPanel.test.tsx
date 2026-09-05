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

    fireEvent.change(screen.getByLabelText('위치 X'), { target: { value: '9' } });
    fireEvent.blur(screen.getByLabelText('위치 X'));
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

    fireEvent.change(screen.getByLabelText('새 구성 요소 유형'), { target: { value: 'game.health' } });
    fireEvent.click(screen.getByText('추가'));
    expect(onAddComponent).toHaveBeenCalledWith('tree', { type: 'game.health', data: {} });

    fireEvent.click(screen.getByText('삭제'));
    expect(onRemoveComponent).toHaveBeenCalledWith('tree', 'component-1');
  });

  test('commits finite numeric drafts and restores empty input without moving the object', () => {
    const onUpdateObject = jest.fn();
    const { rerender } = render(<InspectorPanel sceneDocument={document} selectedObjectId="tree" onUpdateObject={onUpdateObject} />);
    const input = screen.getByLabelText('위치 X');
    fireEvent.change(input, { target: { value: '' } });
    expect(onUpdateObject).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(1);
    expect(onUpdateObject).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: '-2.75' } });
    expect(onUpdateObject).not.toHaveBeenCalled();
    input.focus();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { transform: { position: [-2.75, 2, 3] } });
    onUpdateObject.mockClear();
    const rotation = screen.getByLabelText('회전 (라디안) Y');
    fireEvent.change(rotation, { target: { value: '1.57' } });
    fireEvent.blur(rotation);
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { transform: { rotation: [0, 1.57, 0] } });
    const replacement = createSceneDocument({ id: 'scene', objects: [{ id: 'other', transform: { position: [8, 9, 10] } }] });
    rerender(<InspectorPanel sceneDocument={replacement} selectedObjectId="other" onUpdateObject={onUpdateObject} />);
    expect(screen.getByLabelText('위치 X')).toHaveValue(8);
  });

  test('preserves tag separators while typing and commits on blur or Enter', () => {
    const onUpdateObject = jest.fn();
    const { rerender } = render(<InspectorPanel sceneDocument={document} selectedObjectId="tree" onUpdateObject={onUpdateObject} />);
    const input = screen.getByLabelText('태그');
    fireEvent.change(input, { target: { value: 'resource, ' } });
    expect(input).toHaveValue('resource, ');
    expect(onUpdateObject).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: 'resource, forest, ' } });
    input.focus();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { tags: ['resource', 'forest'] });
    expect(input).toHaveValue('resource, forest');
    const updated = createSceneDocument({ id: 'scene', objects: [{ id: 'tree', tags: ['external'] }] });
    rerender(<InspectorPanel sceneDocument={updated} selectedObjectId="tree" onUpdateObject={onUpdateObject} />);
    expect(screen.getByLabelText('태그')).toHaveValue('external');
    onUpdateObject.mockClear();
    fireEvent.blur(screen.getByLabelText('태그'));
    expect(onUpdateObject).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('태그'), { target: { value: '' } });
    fireEvent.blur(screen.getByLabelText('태그'));
    expect(onUpdateObject).toHaveBeenCalledWith('tree', { tags: [] });
  });

  test('renders empty state without selected object', () => {
    render(<InspectorPanel sceneDocument={document} selectedObjectId="missing" />);

    expect(screen.getByText('장면에서 객체를 선택하세요')).toBeTruthy();
  });
});
