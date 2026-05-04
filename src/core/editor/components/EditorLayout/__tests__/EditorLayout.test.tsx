import React from 'react';
import { render, screen } from '@testing-library/react';

import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../../runtime';
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
            ctx.components.register('game.inventory-panel', {
              kind: EDITOR_PANEL_COMPONENT_KIND,
              panel: {
                id: 'inventory',
                title: 'Inventory',
                component: <div data-testid="inventory-panel">Inventory tools</div>,
              },
            }, 'game-ui');
          },
        },
      ],
    });

    await runtime.setup();

    render(
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        <EditorLayout
          defaultActivePanels={['inventory']}
          defaultPanelOpen
        >
          <div data-testid="editor-canvas" />
        </EditorLayout>
      </GaesupRuntimeProvider>,
    );

    expect(screen.getByTestId('inventory-panel')).toBeTruthy();
    expect(screen.getByTestId('editor-canvas')).toBeTruthy();

    await runtime.dispose();
  });
});
