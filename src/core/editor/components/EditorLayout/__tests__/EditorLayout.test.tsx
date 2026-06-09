import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../../runtime';
import { createSceneDocument } from '../../../../scene-object';
import { EDITOR_PANEL_COMPONENT_KIND, EditorLayout } from '../index';

describe('EditorLayout runtime component injection', () => {
  test('renders panels registered through ctx.components', async () => {
    const runtime = createGaesupRuntime({
      plugins: [
        {
          id: 'game-ui',
          name: 'Game UI',
          version: '1.0.0',
          setup(ctx) {
            ctx.components.register(
              'game.inventory-panel',
              {
                kind: EDITOR_PANEL_COMPONENT_KIND,
                panel: {
                  id: 'inventory',
                  title: 'Inventory',
                  component: <div data-testid="inventory-panel">Inventory tools</div>,
                },
              },
              'game-ui',
            );
          },
        },
      ],
    });

    await runtime.setup();

    render(
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        <EditorLayout defaultActivePanels={['inventory']} defaultPanelOpen>
          <div data-testid="editor-canvas" />
        </EditorLayout>
      </GaesupRuntimeProvider>,
    );

    expect(screen.getByTestId('inventory-panel')).toBeTruthy();
    expect(screen.getByTestId('editor-canvas')).toBeTruthy();

    await runtime.dispose();
  });

  test('renders built-in hierarchy panel from scene document', () => {
    const sceneDocument = createSceneDocument({
      id: 'scene',
      objects: [{ id: 'root', name: 'Root' }],
    });

    render(
      <EditorLayout
        sceneDocument={sceneDocument}
        defaultActivePanels={['hierarchy']}
        defaultPanelOpen
      >
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    expect(screen.getAllByText('계층').length).toBeGreaterThan(0);
    expect(screen.getByText('Root')).toBeTruthy();
  });

  test('renders built-in inspector panel from selected scene object', () => {
    const sceneDocument = createSceneDocument({
      id: 'scene',
      objects: [{ id: 'root', name: 'Root', layer: 'environment' }],
    });

    render(
      <EditorLayout
        sceneDocument={sceneDocument}
        selectedObjectId="root"
        defaultActivePanels={['inspector']}
        defaultPanelOpen
      >
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    expect(screen.getAllByText('속성').length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue('environment')).toBeTruthy();
  });

  test('renders built-in project assets panel', () => {
    render(
      <EditorLayout
        projectScenes={[createSceneDocument({ id: 'scene-a', name: 'Scene A' })]}
        defaultActivePanels={['project-assets']}
        defaultPanelOpen
      >
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    expect(screen.getAllByText('프로젝트').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText('scenes'));
    expect(screen.getByText('Scene A')).toBeTruthy();
  });

  test('renders play mode controls', () => {
    const onEnterPlayMode = jest.fn();
    const onExitPlayMode = jest.fn();

    const { rerender } = render(
      <EditorLayout defaultPanelOpen onEnterPlayMode={onEnterPlayMode}>
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    fireEvent.click(screen.getByText('실행'));
    expect(onEnterPlayMode).toHaveBeenCalled();

    rerender(
      <EditorLayout defaultPanelOpen playMode="play" onExitPlayMode={onExitPlayMode}>
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    fireEvent.click(screen.getByText('정지'));
    expect(onExitPlayMode).toHaveBeenCalled();
  });

  test('사이드바 프리셋 클래스를 적용한다', () => {
    render(
      <EditorLayout sidebarPreset="compact">
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    expect(screen.getByLabelText('Editor sidebar').className).toContain(
      'editor-sidebar--preset-compact',
    );
  });

  test('사이드바 커스텀 프리셋을 적용한다', () => {
    render(
      <EditorLayout sidebarPreset={{ className: 'custom-sidebar', style: { width: 420 } }}>
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    const sidebar = screen.getByLabelText('Editor sidebar');
    expect(sidebar.className).toContain('custom-sidebar');
    expect(sidebar).toHaveStyle({ width: '420px' });
  });

  test('executes editor shortcuts from layout', () => {
    const run = jest.fn();
    render(
      <EditorLayout shortcuts={[{ id: 'frame', label: 'Frame', key: 'f', run }]} defaultPanelOpen>
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    fireEvent.keyDown(window, { key: 'f' });
    expect(run).toHaveBeenCalledTimes(1);
  });

  test('opens command palette with shortcut and runs panel command', () => {
    render(
      <EditorLayout defaultPanelOpen>
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    expect(screen.getByLabelText('Command palette')).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Search commands'), { target: { value: 'project' } });
    fireEvent.keyDown(screen.getByLabelText('Search commands'), { key: 'Enter' });

    expect(screen.queryByLabelText('Command palette')).toBeNull();
    expect(screen.getAllByText('프로젝트').length).toBeGreaterThan(0);
  });

  test('renders save status and triggers manual save', () => {
    const onSave = jest.fn();
    const onToggleAutosave = jest.fn();

    render(
      <EditorLayout
        defaultPanelOpen
        saveStatus={{
          state: 'dirty',
          dirty: true,
          autosaveEnabled: true,
          nextAutosaveAt: Date.now() + 30000,
        }}
        onSave={onSave}
        onToggleAutosave={onToggleAutosave}
      >
        <div data-testid="editor-canvas" />
      </EditorLayout>,
    );

    expect(screen.getByLabelText('Editor save status')).toBeTruthy();
    fireEvent.click(screen.getByText('Auto'));
    expect(onToggleAutosave).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
