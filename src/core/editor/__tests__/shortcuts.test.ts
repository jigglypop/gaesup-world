import {
  createEditorShortcutRegistry,
  formatEditorShortcut,
  isEditableShortcutTarget,
  matchesEditorShortcut,
} from '../shortcuts';

describe('editor shortcuts', () => {
  test('matches platform command shortcuts and formats labels', () => {
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true });

    expect(matchesEditorShortcut(event, { key: 'z', ctrl: true }, { platform: 'windows' })).toBe(true);
    expect(matchesEditorShortcut(event, { key: 'z', ctrl: true, shift: true }, { platform: 'windows' })).toBe(false);
    expect(formatEditorShortcut({ key: 'z', ctrl: true, shift: true }, { platform: 'windows' })).toBe('Ctrl+Shift+Z');
  });

  test('runs registered shortcuts and prevents default', () => {
    const run = jest.fn();
    const registry = createEditorShortcutRegistry([
      { id: 'undo', label: 'Undo', key: 'z', ctrl: true, run },
    ], { platform: 'windows' });
    const event = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, cancelable: true });

    expect(registry.handleKeyDown(event)).toBe(true);
    expect(event.defaultPrevented).toBe(true);
    expect(run).toHaveBeenCalledTimes(1);
  });

  test('ignores editable shortcut targets', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);
    const run = jest.fn();
    const registry = createEditorShortcutRegistry([
      { id: 'delete', label: 'Delete', key: 'Delete', run },
    ]);
    const event = new KeyboardEvent('keydown', { key: 'Delete', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });

    expect(isEditableShortcutTarget(input)).toBe(true);
    expect(registry.handleKeyDown(event)).toBe(false);
    expect(run).not.toHaveBeenCalled();
    input.remove();
  });
});
