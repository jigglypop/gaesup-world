import { StrictMode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Vector3 } from 'three';

import { getGlobalStateManager, useStateSystem } from '../useStateSystem';

afterEach(() => getGlobalStateManager().reset());

test.each([false, true])('publishes mutations and resets to all consumers with StrictMode=%s', (strict) => {
  const options = strict ? { wrapper: StrictMode } : {};
  const writer = renderHook(() => useStateSystem(), options);
  const reader = renderHook(() => {
    const state = useStateSystem();
    return { moving: state.gameStates.isMoving, x: state.activeState.position.x };
  }, options);
  try {
    act(() => {
      writer.result.current.updateGameStates({ isMoving: true });
      writer.result.current.updateActiveState({ position: new Vector3(7, 0, 0) });
    });
    expect(reader.result.current).toEqual({ moving: true, x: 7 });
    act(() => {
      writer.result.current.resetGameStates();
      writer.result.current.resetActiveState();
    });
    expect(reader.result.current).toEqual({ moving: false, x: 0 });
    reader.unmount();
    act(() => writer.result.current.updateGameStates({ isMoving: true }));
    expect(writer.result.current.gameStates.isMoving).toBe(true);
  } finally {
    reader.unmount();
    writer.unmount();
  }
});
