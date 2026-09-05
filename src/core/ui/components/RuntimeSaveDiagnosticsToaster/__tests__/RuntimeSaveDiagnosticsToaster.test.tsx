import React from 'react';
import { act, render } from '@testing-library/react';

import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../../runtime';
import { SaveSystem, type SaveAdapter, type SaveBlob } from '../../../../save';
import { RuntimeSaveDiagnosticsToaster } from '../index';
import { useToastStore } from '../../Toast';

class MemoryAdapter implements SaveAdapter {
  private readonly saves = new Map<string, SaveBlob>();

  async read(slot: string): Promise<SaveBlob | null> {
    return this.saves.get(slot) ?? null;
  }

  async write(slot: string, blob: SaveBlob): Promise<void> {
    this.saves.set(slot, blob);
  }

  async list(): Promise<string[]> {
    return Array.from(this.saves.keys());
  }

  async remove(slot: string): Promise<void> {
    this.saves.delete(slot);
  }
}

describe('RuntimeSaveDiagnosticsToaster', () => {
  beforeEach(() => {
    useToastStore.getState().clear();
  });

  it('pushes a toast when the current runtime reports a save diagnostic', () => {
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
    });

    render(
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        <RuntimeSaveDiagnosticsToaster durationMs={1234} />
      </GaesupRuntimeProvider>,
    );

    act(() => {
      runtime.saveDiagnostics.report({
        phase: 'serialize',
        key: 'camera',
        slot: 'main',
        error: new Error('boom'),
      });
    });

    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({
        kind: 'error',
        text: '저장 실패: camera - boom',
        durationMs: 1234,
      }),
    ]);
  });

  it('does not replay existing diagnostics unless includeExisting is enabled', () => {
    const runtime = createGaesupRuntime({
      saveSystem: new SaveSystem({ adapter: new MemoryAdapter() }),
    });
    runtime.saveDiagnostics.report({
      phase: 'hydrate',
      key: 'building',
      slot: 'main',
      error: 'bad data',
    });

    const { unmount } = render(
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        <RuntimeSaveDiagnosticsToaster />
      </GaesupRuntimeProvider>,
    );

    expect(useToastStore.getState().toasts).toEqual([]);
    unmount();

    render(
      <GaesupRuntimeProvider runtime={runtime} revision={2}>
        <RuntimeSaveDiagnosticsToaster includeExisting />
      </GaesupRuntimeProvider>,
    );

    expect(useToastStore.getState().toasts).toEqual([
      expect.objectContaining({
        kind: 'error',
        text: '불러오기 실패: building - bad data',
      }),
    ]);
  });
});
