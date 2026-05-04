import React from 'react';

import {
  EDITOR_PANEL_COMPONENT_KIND,
  isEditorPanelComponentExtension,
  resolveEditorPanelComponentExtensions,
} from '../types';

describe('EditorLayout component extensions', () => {
  test('recognizes editor panel component extensions', () => {
    const extension = {
      kind: EDITOR_PANEL_COMPONENT_KIND,
      panel: {
        id: 'inventory',
        title: 'Inventory',
        component: React.createElement('div'),
      },
    };

    expect(isEditorPanelComponentExtension(extension)).toBe(true);
    expect(isEditorPanelComponentExtension({ kind: 'hud.panel', panel: extension.panel })).toBe(false);
    expect(isEditorPanelComponentExtension({ kind: EDITOR_PANEL_COMPONENT_KIND, panel: { id: 'bad' } })).toBe(false);
  });

  test('resolves plugin-owned panels from component registry entries', () => {
    const component = React.createElement('div', { 'data-testid': 'inventory-panel' });
    const panels = resolveEditorPanelComponentExtensions([
      {
        id: 'game.inventory-panel',
        pluginId: 'game-ui',
        value: {
          kind: EDITOR_PANEL_COMPONENT_KIND,
          panel: {
            id: 'inventory',
            title: 'Inventory',
            component,
          },
        },
      },
      {
        id: 'ignored',
        pluginId: 'other',
        value: { kind: 'other.component' },
      },
    ]);

    expect(panels).toHaveLength(1);
    expect(panels[0]).toEqual({
      id: 'inventory',
      title: 'Inventory',
      component,
      pluginId: 'game-ui',
    });
  });
});
