/**
 * 입력 단일 소스 보장 회귀 테스트.
 * zustand 의 interaction.keyboard/mouse 와 InteractionSystem 의 keyboard/mouse 가
 * 어느 경로로 갱신되든 동기화되어야 한다.
 */
import {
  getDefaultInteractionInputBackend,
  resolveDefaultInteractionSystem,
} from '@core/interactions/core';
import { useGaesupStore } from '@stores/gaesupStore';

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

  test('system reset이 retained raw identity를 한 번 projection해 primitive와 wrapper 구독을 갱신한다', () => {
    const system = resolveDefaultInteractionSystem();
    system.updateKeyboard({ forward: true });
    system.updateMouse({ isActive: true });
    const keyboard = system.getKeyboardRef();
    const mouse = system.getMouseRef();
    const previousInteraction = useGaesupStore.getState().interaction;
    const primitiveListener = jest.fn();
    const wrapperListener = jest.fn();
    const unsubscribePrimitive = useGaesupStore.subscribe(
      (state) => state.interaction.keyboard.forward,
      primitiveListener,
    );
    const unsubscribeWrapper = useGaesupStore.subscribe(
      (state) => state.interaction,
      wrapperListener,
    );

    try {
      system.reset();

      const interaction = useGaesupStore.getState().interaction;
      expect(system.getKeyboardRef()).toBe(keyboard);
      expect(system.getMouseRef()).toBe(mouse);
      expect(interaction.keyboard).toBe(keyboard);
      expect(interaction.mouse).toBe(mouse);
      expect(interaction.keyboard.forward).toBe(false);
      expect(interaction.mouse.isActive).toBe(false);
      expect(primitiveListener).toHaveBeenCalledTimes(1);
      expect(primitiveListener).toHaveBeenCalledWith(false, true);
      expect(wrapperListener).toHaveBeenCalledTimes(1);
      expect(wrapperListener.mock.calls[0]?.[0]).not.toBe(previousInteraction);
      expect(wrapperListener.mock.calls[0]?.[1]).toBe(previousInteraction);
    } finally {
      unsubscribePrimitive();
      unsubscribeWrapper();
    }
  });
});
