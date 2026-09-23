let suspensionCount = 0;

export function suspendAutoSave(): () => void {
  suspensionCount++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    suspensionCount = Math.max(0, suspensionCount - 1);
  };
}

export function isAutoSaveSuspended(): boolean {
  return suspensionCount > 0;
}
