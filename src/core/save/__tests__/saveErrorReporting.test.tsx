import { renderHook, waitFor } from '@testing-library/react';

import { useEditorAutosave } from '../../editor/hooks/useEditorAutosave';
import { createEditorSaveStatus, markEditorDirty } from '../../editor/saveState';
import { setErrorSink, type ErrorReportContext } from '../../utils/reportError';
import { SaveSystem } from '../core/SaveSystem';
import { useAutoSave } from '../hooks/useAutoSave';
import type { SaveAdapter } from '../types';

// The logger is off in tests as in production, so these reports can only arrive through the error sink.
let reports: [Error, ErrorReportContext][];
let releaseSink: () => void;
beforeEach(() => {
  reports = [];
  releaseSink = setErrorSink((error, context) => { reports.push([error, context]); });
});
afterEach(() => releaseSink());

const adapter = (write: SaveAdapter['write']): SaveAdapter => ({
  read: async () => null, write, list: async () => [], remove: async () => undefined,
});

test('a failed automatic save reaches the error sink', async () => {
  const failure = new Error('disk full');
  const saveSystem = new SaveSystem({ adapter: adapter(async () => { throw failure; }) });
  saveSystem.register({ key: 'counter', serialize: () => 1, hydrate: () => undefined });
  const view = renderHook(() => useAutoSave({ slot: 'main', saveSystem }));
  try {
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));
    await waitFor(() => expect(reports).toContainEqual([failure, { source: 'save:autosave', label: 'main' }]));
  } finally {
    view.unmount();
    Reflect.deleteProperty(document, 'visibilityState');
  }
});

test('a domain that fails to serialize reaches the error sink with its slot and key', async () => {
  const failure = new Error('cyclic value');
  const saveSystem = new SaveSystem({ adapter: adapter(async () => undefined) });
  saveSystem.register({ key: 'broken', serialize: () => { throw failure; }, hydrate: () => undefined });
  await saveSystem.save('main').catch(() => undefined);
  expect(reports).toContainEqual([failure, { source: 'save:serialize', label: 'main/broken' }]);
});

test('a rejected editor autosave reaches the error sink instead of escaping its timer', async () => {
  const failure = new Error('offline');
  const status = markEditorDirty(createEditorSaveStatus({ autosaveIntervalMs: 1000 }), Date.now() - 2000);
  const view = renderHook(() => useEditorAutosave({ status, onAutosave: () => Promise.reject(failure) }));
  try {
    await waitFor(() => expect(reports).toContainEqual([failure, { source: 'save:editor-autosave' }]));
  } finally {
    view.unmount();
  }
});
