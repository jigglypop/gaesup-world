/**
 * 입력 단일 소스 보장 회귀 테스트.
 * zustand 의 interaction.keyboard/mouse 와 InteractionSystem 의 keyboard/mouse 가
 * 어느 경로로 갱신되든 동기화되어야 한다.
 */
import { useGaesupStore } from '@stores/gaesupStore';
import {
  getDefaultInteractionInputBackend,
  resolveDefaultInteractionSystem,
} from '@core/interactions/core';

describe('입력 단일 소스 동기화', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetInteractions();
    resolveDefaultInteractionSystem().reset();
  });

  test('zustand updateKeyboard 호출 시 default input backend 도 동일하게 갱신된다', () => {
    const store = useGaesupStore.getState();
    const inputBackend = getDefaultInteractionInputBackend();

    store.updateKeyboard({ forward: true, shift: true });

    const backendKeyboard = inputBackend.getKeyboard();
    const storeKeyboard = useGaesupStore.getState().interaction.keyboard;

    expect(backendKeyboard.forward).toBe(true);
    expect(backendKeyboard.shift).toBe(true);
    expect(storeKeyboard.forward).toBe(true);
    expect(storeKeyboard.shift).toBe(true);
  });

  test('default input backend updateKeyboard 호출 시 zustand 의 keyboard 도 갱신된다', () => {
    const inputBackend = getDefaultInteractionInputBackend();

    inputBackend.updateKeyboard({ space: true });

    const storeKeyboard = useGaesupStore.getState().interaction.keyboard;
    expect(storeKeyboard.space).toBe(true);
  });

  test('zustand updateMouse 호출 시 default input backend 의 mouse 도 동일하게 갱신된다', () => {
    const store = useGaesupStore.getState();
    const inputBackend = getDefaultInteractionInputBackend();

    store.updateMouse({ isActive: true, shouldRun: true });

    expect(inputBackend.getMouse().isActive).toBe(true);
    expect(inputBackend.getMouse().shouldRun).toBe(true);
  });
});
