import { act, fireEvent, render } from '@testing-library/react';

import { useBuildingStore } from '../../stores/buildingStore';
import { BuildingController } from '../BuildingController';

const mockCanvas = document.createElement('canvas');
jest.mock('@react-three/fiber', () => ({ useThree: () => ({ gl: { domElement: mockCanvas } }) }));
jest.mock('../../hooks/useBuildingEditor', () => ({ useBuildingEditor: () => ({}) }));
jest.mock('../../../npc/components/NPCSystem', () => ({ NPCSystem: () => null }));
jest.mock('../BuildingSystem', () => ({ BuildingSystem: () => null }));
jest.mock('../BuildingRenderStateDriver', () => ({ BuildingRenderStateDriver: () => null }));
jest.mock('../BuildingGpuMirrorDriver', () => ({ BuildingGpuMirrorDriver: () => null }));
jest.mock('../BuildingGpuUploadDriver', () => ({ BuildingGpuUploadDriver: () => null }));
jest.mock('../BuildingGpuCullingDriver', () => ({ BuildingGpuCullingDriver: () => null }));
jest.mock('../BuildingIndirectDrawDriver', () => ({ BuildingIndirectDrawDriver: () => null }));
jest.mock('../BuildingIndirectArgsUploadDriver', () => ({ BuildingIndirectArgsUploadDriver: () => null }));
jest.mock('../BuildingVisibilityDriver', () => ({ BuildingVisibilityDriver: () => null }));

describe('building keyboard input', () => {
  const previous = useBuildingStore.getState();
  beforeEach(() => {
    useBuildingStore.setState({ initialized: true, editMode: 'tile', currentTileHeight: 0, currentTileRotation: 0 });
  });
  afterEach(() => {
    act(() => useBuildingStore.setState(previous));
  });

  test.each(['input', 'textarea', 'select', 'editable'])('ignores keys in %s', (kind) => {
    const view = render(<><BuildingController /><div data-testid="field" /></>);
    const field = document.createElement(kind === 'editable' ? 'div' : kind);
    if (kind === 'editable') field.setAttribute('contenteditable', 'true');
    const target = kind === 'editable' ? field.appendChild(document.createElement('span')) : field;
    view.getByTestId('field').appendChild(field);
    fireEvent.keyDown(target, { key: 'e', code: 'KeyE' });
    fireEvent.keyDown(target, { key: 'ArrowRight' });
    expect(useBuildingStore.getState().currentTileHeight).toBe(0);
    expect(useBuildingStore.getState().currentTileRotation).toBe(0);
    view.unmount();
  });

  test.each(['ctrlKey', 'metaKey', 'altKey', 'isComposing'])('ignores %s events', (flag) => {
    const view = render(<BuildingController />);
    fireEvent.keyDown(window, { key: 'e', code: 'KeyE', [flag]: true });
    expect(useBuildingStore.getState().currentTileHeight).toBe(0);
    view.unmount();
  });

  test('honors consumed events and retains ordinary building shortcuts', () => {
    const view = render(<BuildingController />);
    const consumed = new KeyboardEvent('keydown', { key: 'e', cancelable: true });
    consumed.preventDefault();
    fireEvent(window, consumed);
    expect(useBuildingStore.getState().currentTileHeight).toBe(0);
    fireEvent.keyDown(window, { key: 'e', code: 'KeyE' });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(useBuildingStore.getState().currentTileHeight).toBe(1);
    expect(useBuildingStore.getState().currentTileRotation).toBe(Math.PI / 2);
    view.unmount();
    fireEvent.keyDown(window, { key: 'e', code: 'KeyE' });
    expect(useBuildingStore.getState().currentTileHeight).toBe(1);
  });
});
