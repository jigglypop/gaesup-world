import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

import { createMemoryInputBackend } from '../../core';
import { useInteractablesStore } from '../../stores/interactablesStore';
import { useInteractionKey } from '../useInteractionTarget';
import { createMotionsPlugin } from '../../../motions/plugin';
import { createGaesupRuntime, GaesupRuntimeProvider } from '../../../runtime';

describe('useInteractionKey', () => {
  beforeEach(() => {
    useInteractablesStore.setState({
      entries: new Map(),
      current: null,
    });
  });

  it('activates the current target from the runtime input backend', async () => {
    const inputBackend = createMemoryInputBackend();
    const onActivate = jest.fn();
    const runtime = createGaesupRuntime({
      plugins: [
        createMotionsPlugin({
          createInputAdapter: () => inputBackend,
        }),
      ],
    });
    await runtime.setup();

    useInteractablesStore.getState().register({
      id: 'target-1',
      kind: 'misc',
      label: 'Target',
      position: new THREE.Vector3(),
      range: 2,
      key: 'e',
      onActivate,
    });
    useInteractablesStore.getState().setCurrent({
      id: 'target-1',
      label: 'Target',
      key: 'e',
      distance: 1,
    });

    const wrapper = ({ children }: { children: ReactNode }) => (
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        {children}
      </GaesupRuntimeProvider>
    );
    const { unmount } = renderHook(() => useInteractionKey(), { wrapper });

    act(() => {
      inputBackend.updateKeyboard({ keyE: true });
    });
    act(() => {
      inputBackend.updateKeyboard({ keyE: true });
    });
    expect(onActivate).toHaveBeenCalledTimes(1);

    act(() => {
      inputBackend.updateKeyboard({ keyE: false });
      inputBackend.updateKeyboard({ keyE: true });
    });
    expect(onActivate).toHaveBeenCalledTimes(2);

    unmount();
    await runtime.dispose();
  });
});
