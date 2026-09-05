import { useEffect, useMemo, useRef, useState } from 'react';

import type { EditorShortcutBinding } from '../shortcuts';

export interface EditorCommandPaletteItem {
  id: string;
  label: string;
  group?: string;
  detail?: string;
  shortcut?: string;
  disabled?: boolean;
  run: () => void | Promise<void>;
}

export interface CommandPaletteProps {
  open: boolean;
  items: EditorCommandPaletteItem[];
  placeholder?: string;
  onClose: () => void;
}

export function CommandPalette({
  open,
  items,
  placeholder = '명령 검색',
  onClose,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredItems = useMemo(() => filterCommandPaletteItems(items, query), [items, query]);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    const timer = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  const runItem = (item: EditorCommandPaletteItem) => {
    if (item.disabled) return;
    void item.run();
    onClose();
  };

  return (
    <div className="editor-command-palette" role="dialog" aria-label="명령 목록">
      <div className="editor-command-palette__surface">
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape') onClose();
            if (event.key === 'Enter' && filteredItems[0]) runItem(filteredItems[0]);
          }}
          placeholder={placeholder}
          aria-label="명령 검색"
        />
        <div className="editor-command-palette__list">
          {filteredItems.length === 0 ? (
            <div className="editor-command-palette__empty">검색된 명령이 없습니다</div>
          ) : filteredItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="editor-command-palette__item"
              onClick={() => runItem(item)}
              disabled={item.disabled}
            >
              <span>
                <strong>{item.label}</strong>
                {item.detail ? <em>{item.detail}</em> : null}
              </span>
              <span>
                {item.group ? <small>{item.group}</small> : null}
                {item.shortcut ? <kbd>{item.shortcut}</kbd> : null}
              </span>
            </button>
          ))}
        </div>
      </div>
      <button type="button" className="editor-command-palette__backdrop" onClick={onClose} aria-label="명령 검색 닫기" />
    </div>
  );
}

export function filterCommandPaletteItems(
  items: EditorCommandPaletteItem[],
  query: string,
): EditorCommandPaletteItem[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => (
    item.id.toLowerCase().includes(normalized) ||
    item.label.toLowerCase().includes(normalized) ||
    item.group?.toLowerCase().includes(normalized) ||
    item.detail?.toLowerCase().includes(normalized)
  ));
}

export function shortcutsToCommandPaletteItems(
  shortcuts: EditorShortcutBinding[],
): EditorCommandPaletteItem[] {
  return shortcuts.map((shortcut) => ({
    id: shortcut.id,
    label: shortcut.label,
    group: '단축키',
    ...(shortcut.disabled !== undefined ? { disabled: shortcut.disabled } : {}),
    run: () => shortcut.run(new KeyboardEvent('keydown', {
      key: shortcut.key,
      ...(shortcut.code ? { code: shortcut.code } : {}),
    })),
  }));
}
