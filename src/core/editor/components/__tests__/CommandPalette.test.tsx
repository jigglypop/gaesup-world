import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import {
  CommandPalette,
  filterCommandPaletteItems,
  shortcutsToCommandPaletteItems,
} from '../CommandPalette';

describe('CommandPalette helpers', () => {
  test('filters command items by label, group, detail, and id', () => {
    const items = [
      { id: 'panel.hierarchy', label: 'Open Hierarchy', group: 'Panel', run: jest.fn() },
      { id: 'action.save', label: 'Save World', group: 'Action', detail: 'slot', run: jest.fn() },
    ];

    expect(filterCommandPaletteItems(items, 'hier').map((item) => item.id)).toEqual(['panel.hierarchy']);
    expect(filterCommandPaletteItems(items, 'slot').map((item) => item.id)).toEqual(['action.save']);
  });

  test('converts shortcuts into palette commands', () => {
    const run = jest.fn();
    const [item] = shortcutsToCommandPaletteItems([
      { id: 'frame', label: 'Frame Selection', key: 'f', run },
    ]);

    item?.run();
    expect(item?.group).toBe('Shortcut');
    expect(run).toHaveBeenCalled();
  });
});

describe('CommandPalette', () => {
  test('runs the first filtered command on enter and closes', () => {
    const run = jest.fn();
    const onClose = jest.fn();
    render(
      <CommandPalette
        open
        items={[
          { id: 'panel.hierarchy', label: 'Open Hierarchy', group: 'Panel', run },
        ]}
        onClose={onClose}
      />,
    );

    fireEvent.change(screen.getByLabelText('Search commands'), { target: { value: 'hierarchy' } });
    fireEvent.keyDown(screen.getByLabelText('Search commands'), { key: 'Enter' });

    expect(run).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });
});
