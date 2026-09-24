export type EditorShortcutHandler = (event: KeyboardEvent) => void | Promise<void>;

export interface EditorShortcutBinding {
  id: string;
  label: string;
  key: string;
  code?: string;
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  preventDefault?: boolean;
  disabled?: boolean;
  run: EditorShortcutHandler;
}

export interface EditorShortcutMatchOptions {
  platform?: 'auto' | 'mac' | 'windows' | 'linux';
}

export interface EditorShortcutRegistry {
  register: (binding: EditorShortcutBinding) => () => void;
  unregister: (id: string) => void;
  list: () => EditorShortcutBinding[];
  handleKeyDown: (event: KeyboardEvent) => boolean;
}

export const DEFAULT_EDITOR_SHORTCUTS = {
  undo: { key: 'z', ctrl: true, meta: true },
  redo: { key: 'z', ctrl: true, meta: true, shift: true },
  delete: { key: 'Delete' },
  duplicate: { key: 'd', ctrl: true, meta: true },
  frameSelection: { key: 'f' },
  play: { key: ' ', code: 'Space' },
} as const;

export function createEditorShortcutRegistry(
  bindings: EditorShortcutBinding[] = [],
  options: EditorShortcutMatchOptions = {},
): EditorShortcutRegistry {
  const entries = new Map<string, EditorShortcutBinding>();
  const owners = new Map<string, symbol>();
  bindings.forEach((binding) => entries.set(binding.id, binding));

  return {
    register(binding) {
      const owner = Symbol(binding.id); owners.set(binding.id, owner);
      entries.set(binding.id, binding);
      return () => {
        if (owners.get(binding.id) !== owner) return;
        owners.delete(binding.id); entries.delete(binding.id);
      };
    },
    unregister(id) {
      owners.delete(id);
      entries.delete(id);
    },
    list() {
      return Array.from(entries.values());
    },
    handleKeyDown(event) {
      if (event.defaultPrevented || event.isComposing) return false;
      if (isEditableShortcutTarget(event.target)) return false;

      const binding = Array.from(entries.values()).find((candidate) => (
        !candidate.disabled && matchesEditorShortcut(event, candidate, options)
      ));
      if (!binding) return false;

      if (binding.preventDefault ?? true) {
        event.preventDefault();
      }
      void binding.run(event);
      return true;
    },
  };
}

export function matchesEditorShortcut(
  event: KeyboardEvent,
  binding: Pick<EditorShortcutBinding, 'key' | 'code' | 'ctrl' | 'meta' | 'shift' | 'alt'>,
  options: EditorShortcutMatchOptions = {},
): boolean {
  const keyMatches = normalizeShortcutKey(event.key) === normalizeShortcutKey(binding.key);
  const codeMatches = Boolean(binding.code && event.code === binding.code);
  if (!keyMatches && !codeMatches) return false;

  const platform = resolveShortcutPlatform(options.platform);
  const wantsCommand = Boolean(binding.ctrl || binding.meta);
  const commandMatches = wantsCommand
    ? platform === 'mac'
      ? event.metaKey || event.ctrlKey
      : event.ctrlKey || event.metaKey
    : !event.ctrlKey && !event.metaKey;

  return (
    commandMatches &&
    event.shiftKey === Boolean(binding.shift) &&
    event.altKey === Boolean(binding.alt)
  );
}

export function formatEditorShortcut(
  binding: Pick<EditorShortcutBinding, 'key' | 'ctrl' | 'meta' | 'shift' | 'alt'>,
  options: EditorShortcutMatchOptions = {},
): string {
  const platform = resolveShortcutPlatform(options.platform);
  const parts: string[] = [];
  if (binding.ctrl || binding.meta) parts.push(platform === 'mac' ? 'Cmd' : 'Ctrl');
  if (binding.shift) parts.push('Shift');
  if (binding.alt) parts.push(platform === 'mac' ? 'Opt' : 'Alt');
  parts.push(binding.key === ' ' ? 'Space' : binding.key.length === 1 ? binding.key.toUpperCase() : binding.key);
  return parts.join('+');
}

export function isEditableShortcutTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  return target.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])') !== null;
}

function normalizeShortcutKey(key: string): string {
  return key === 'Spacebar' ? ' ' : key.toLowerCase();
}

function resolveShortcutPlatform(platform: EditorShortcutMatchOptions['platform']): 'mac' | 'windows' | 'linux' {
  if (platform && platform !== 'auto') return platform;
  if (typeof navigator !== 'undefined' && /mac|iphone|ipad|ipod/i.test(navigator.platform)) return 'mac';
  if (typeof navigator !== 'undefined' && /linux/i.test(navigator.platform)) return 'linux';
  return 'windows';
}
