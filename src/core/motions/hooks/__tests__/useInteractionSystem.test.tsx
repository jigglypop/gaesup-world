import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import * as THREE from 'three';

import {
  createMemoryInputBackend,
  resolveDefaultInteractionSystem,
} from '@core/interactions/core';
import { createMotionsPlugin } from '@core/motions/plugin';
import { createGaesupRuntime, GaesupRuntimeProvider } from '@core/runtime';

import { useInteractionSystem } from '../useInteractionSystem';

describe('useInteractionSystem', () => {
  it('default system reset이 retained raw object의 primitive 변경을 rerender해야 합니다', () => {
    const system = resolveDefaultInteractionSystem();
    const { result, unmount } = renderHook(() => useInteractionSystem());

    act(() => {
      result.current.updateKeyboard({ forward: true });
      result.current.updateMouse({ isActive: true });
    });
    const keyboard = system.getKeyboardRef();
    const mouse = system.getMouseRef();
    const beforeReset = result.current;

    act(() => {
      system.reset();
    });

    expect(system.getKeyboardRef()).toBe(keyboard);
    expect(system.getMouseRef()).toBe(mouse);
    expect(result.current).not.toBe(beforeReset);
    expect(result.current.keyboard).toBe(keyboard);
    expect(result.current.mouse).toBe(mouse);
    expect(result.current.keyboard.forward).toBe(false);
    expect(result.current.mouse.isActive).toBe(false);

    unmount();
    system.dispose();
  });

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
