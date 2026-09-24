import {
  createEditorShortcutRegistry,
  formatEditorShortcut,
  isEditableShortcutTarget,
  matchesEditorShortcut,
} from '../shortcuts';

describe('editor shortcuts', () => {
  test('a missing code is not a wildcard and an explicit code still supports alternate keyboard layouts', () => {
    const different = new KeyboardEvent('keydown', { key: 'd', code: 'KeyD', ctrlKey: true });
    expect(matchesEditorShortcut(different, { key: 'z', ctrl: true })).toBe(false);
    expect(matchesEditorShortcut(new KeyboardEvent('keydown', { key: 'w' }), { key: 'Delete' })).toBe(false);
    expect(matchesEditorShortcut(new KeyboardEvent('keydown', { key: 'я', code: 'KeyZ', ctrlKey: true }), { key: 'z', code: 'KeyZ', ctrl: true })).toBe(true);
  });

  test('old cleanup cannot remove a replacement, even when the binding object itself is reused', () => {
    const run = jest.fn(); const registry = createEditorShortcutRegistry();
    const binding = { id: 'same', label: 'Current', key: 'F2', run };
    const first = registry.register(binding); const second = registry.register(binding);
    first(); first(); expect(registry.list()).toEqual([binding]);
    registry.handleKeyDown(new KeyboardEvent('keydown', { key: 'F2' })); expect(run).toHaveBeenCalledTimes(1);
    second(); expect(registry.list()).toEqual([]);
  });

  test('already consumed keys and composition never execute a command', () => {
    const run = jest.fn(); const registry = createEditorShortcutRegistry([{ id: 'delete', label: 'Delete', key: 'Delete', run }]);
    const consumed = new KeyboardEvent('keydown', { key: 'Delete', cancelable: true }); consumed.preventDefault();
    expect(registry.handleKeyDown(consumed)).toBe(false);
    expect(registry.handleKeyDown(new KeyboardEvent('keydown', { key: 'Delete', isComposing: true }))).toBe(false);
    const editable = document.createElement('div'); editable.setAttribute('contenteditable', 'true'); const child = document.createElement('span'); editable.append(child);
    expect(isEditableShortcutTarget(child)).toBe(true); expect(run).not.toHaveBeenCalled();
  });
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
