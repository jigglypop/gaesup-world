import { fireEvent, render, screen } from '@testing-library/react';

import { createPrefabDocument, createPrefabInstance } from '../../../../prefab';
import {
  createMeshRendererComponent,
  createSceneComponent,
  createSceneDocument,
  SCENE_COMPONENT_TYPES,
} from '../../../../scene-object';
import { BUILTIN_SCRIPT_IDS, registerBuiltinScripts } from '../../../../scripting/builtins';
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
    expect(onRemoveComponent).toHaveBeenCalledWith('tree', document.objects[0]!.components[0]!.id);
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

  test('스크립트 추가 메뉴는 선택한 스크립트를 script 구성 요소로 추가한다', () => {
    const unregister = registerBuiltinScripts();
    const onAddComponent = jest.fn();
    try {
      render(<InspectorPanel sceneDocument={document} selectedObjectId="tree" onAddComponent={onAddComponent} />);
      fireEvent.change(screen.getByLabelText('추가할 스크립트'), { target: { value: BUILTIN_SCRIPT_IDS.door } });
      fireEvent.click(screen.getByText('스크립트 추가'));
      expect(onAddComponent).toHaveBeenCalledWith('tree', {
        type: SCENE_COMPONENT_TYPES.script,
        data: { scriptId: BUILTIN_SCRIPT_IDS.door, props: {} },
      });
    } finally {
      unregister();
    }
  });

  test('스크립트 prop 편집은 기존 override를 유지한 채 구성 요소 데이터 갱신을 요청한다', () => {
    const unregister = registerBuiltinScripts();
    const onUpdateComponent = jest.fn();
    const scripted = createSceneDocument({
      id: 'scene',
      objects: [{
        id: 'spinner',
        components: [createSceneComponent({
          id: 'rotator',
          type: SCENE_COMPONENT_TYPES.script,
          data: { scriptId: BUILTIN_SCRIPT_IDS.rotator, props: { degreesPerSecond: 90 } },
        })],
      }],
    });
    try {
      render(<InspectorPanel sceneDocument={scripted} selectedObjectId="spinner" onUpdateComponent={onUpdateComponent} />);
      const input = screen.getByLabelText('degreesPerSecond');
      expect(input).toHaveValue(90);
      fireEvent.change(input, { target: { value: '120' } });
      fireEvent.blur(input);
      expect(onUpdateComponent).toHaveBeenCalledWith('spinner', 'rotator', {
        scriptId: BUILTIN_SCRIPT_IDS.rotator,
        props: { degreesPerSecond: 120 },
      });
    } finally {
      unregister();
    }
  });

  test('prefab 인스턴스 루트는 override 목록과 되돌리기·적용을, 일반 객체는 프리팹 만들기를 보여 준다', () => {
    const prefab = createPrefabDocument({ id: 'lamp', name: 'Lamp', objects: [{ id: 'root', name: 'Lamp' }] });
    const instance = createPrefabInstance(prefab, { idPrefix: 'lamp-1' });
    const renamed = instance.objects.map((object) => ({ ...object, name: 'Custom' }));
    const scene = createSceneDocument({ id: 'scene', objects: [...renamed, { id: 'tree', name: 'Tree' }] });
    const actions = {
      prefabs: [prefab],
      onCreate: jest.fn(),
      onRevertOverride: jest.fn(),
      onRevertAll: jest.fn(),
      onApply: jest.fn(),
    };
    const { rerender } = render(<InspectorPanel sceneDocument={scene} selectedObjectId="lamp-1:root" prefab={actions} />);

    expect(screen.getByText('프리팹 · Lamp')).toBeTruthy();
    expect(screen.getByText('Lamp · name')).toBeTruthy();
    fireEvent.click(screen.getByText('되돌리기'));
    expect(actions.onRevertOverride).toHaveBeenCalledWith('lamp-1:root', prefab, {
      kind: 'property',
      objectId: 'root',
      path: 'name',
      value: 'Custom',
    });
    fireEvent.click(screen.getByText('모두 되돌리기'));
    expect(actions.onRevertAll).toHaveBeenCalledWith('lamp-1:root', prefab);
    fireEvent.click(screen.getByText('프리팹에 적용'));
    expect(actions.onApply).toHaveBeenCalledWith('lamp-1:root', prefab);

    rerender(<InspectorPanel sceneDocument={scene} selectedObjectId="lamp-1:root" prefab={{ ...actions, prefabs: [] }} />);
    expect(screen.getByText('원본 프리팹을 찾을 수 없습니다 (lamp)')).toBeTruthy();

    rerender(<InspectorPanel sceneDocument={scene} selectedObjectId="tree" prefab={actions} />);
    fireEvent.click(screen.getByText('프리팹으로 만들기'));
    expect(actions.onCreate).toHaveBeenCalledWith('tree');
  });

  test('renders empty state without selected object', () => {
    render(<InspectorPanel sceneDocument={document} selectedObjectId="missing" />);

    expect(screen.getByText('장면에서 객체를 선택하세요')).toBeTruthy();
  });
});
