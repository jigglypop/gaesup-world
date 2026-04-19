/**
 * 입력 단일 소스 보장 회귀 테스트.
 * zustand 의 interaction.keyboard/mouse 와 InteractionSystem 의 keyboard/mouse 가
 * 어느 경로로 갱신되든 동기화되어야 한다.
 */
import { useGaesupStore } from '@stores/gaesupStore';
import { InteractionSystem } from '@core/interactions/core/InteractionSystem';

describe('입력 단일 소스 동기화', () => {
  beforeEach(() => {
    useGaesupStore.getState().resetInteractions();
    InteractionSystem.getInstance().reset();
  });

  test('zustand updateKeyboard 호출 시 InteractionSystem 의 keyboard 도 동일하게 갱신된다', () => {
    const store = useGaesupStore.getState();
    const system = InteractionSystem.getInstance();

    store.updateKeyboard({ forward: true, shift: true });

    const sysKeyboard = system.getState().keyboard;
    const storeKeyboard = useGaesupStore.getState().interaction.keyboard;

    expect(sysKeyboard.forward).toBe(true);
    expect(sysKeyboard.shift).toBe(true);
    expect(storeKeyboard.forward).toBe(true);
    expect(storeKeyboard.shift).toBe(true);
  });

  test('InteractionSystem updateKeyboard 직접 호출 시 zustand 의 keyboard 도 갱신된다', () => {
    const system = InteractionSystem.getInstance();

    system.updateKeyboard({ space: true });

    const storeKeyboard = useGaesupStore.getState().interaction.keyboard;
    expect(storeKeyboard.space).toBe(true);
  });

  test('zustand updateMouse 호출 시 InteractionSystem 의 mouse 도 동일하게 갱신된다', () => {
    const store = useGaesupStore.getState();
    const system = InteractionSystem.getInstance();

    store.updateMouse({ isActive: true, shouldRun: true });

    expect(system.getState().mouse.isActive).toBe(true);
    expect(system.getState().mouse.shouldRun).toBe(true);
  });
});
