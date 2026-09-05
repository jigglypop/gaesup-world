export function canHandleOverlayShortcut(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.repeat || event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return false;
  const target = event.target instanceof HTMLElement ? event.target : null;
  return !target?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"])');
}
