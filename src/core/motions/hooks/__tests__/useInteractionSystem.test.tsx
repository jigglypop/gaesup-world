import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import * as THREE from 'three';

import { createMemoryInputBackend } from '@core/interactions/core';
import { createMotionsPlugin } from '@core/motions/plugin';
import { createGaesupRuntime, GaesupRuntimeProvider } from '@core/runtime';

import { useInteractionSystem } from '../useInteractionSystem';

describe('useInteractionSystem', () => {
  it('uses the runtime input backend when one is registered', async () => {
    const inputBackend = createMemoryInputBackend();
    const runtime = createGaesupRuntime({
      plugins: [
        createMotionsPlugin({
          createInputAdapter: () => inputBackend,
        }),
      ],
    });
    await runtime.setup();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <GaesupRuntimeProvider runtime={runtime} revision={1}>
        {children}
      </GaesupRuntimeProvider>
    );
    const { result, unmount } = renderHook(() => useInteractionSystem(), { wrapper });

    act(() => {
      inputBackend.updateKeyboard({ forward: true });
    });
    expect(result.current.keyboard.forward).toBe(true);

    act(() => {
      result.current.updateMouse({
        target: new THREE.Vector3(2, 0, 3),
        isActive: true,
      });
    });
    expect(inputBackend.getMouse().isActive).toBe(true);
    expect(inputBackend.getMouse().target).toEqual(new THREE.Vector3(2, 0, 3));

    unmount();
    await runtime.dispose();
  });
});
