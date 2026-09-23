import { createDefaultGameplayEventRegistry } from '../registry';
import type { GameplayEventContext, GameplayEventServices } from '../types';

function createServices(): GameplayEventServices {
  return {
    hasItem: jest.fn(() => true),
    addItem: jest.fn(),
    removeItem: jest.fn(),
    questStatus: jest.fn(() => 'active'),
    startQuest: jest.fn(),
    completeQuest: jest.fn(),
    notifyQuestFlag: jest.fn(),
    isEventActive: jest.fn(() => false),
    showDialog: jest.fn(),
    notify: jest.fn(),
  };
}

const context = { state: { flags: {} } } as unknown as GameplayEventContext;

describe('기본 gameplay 이벤트 레지스트리', () => {
  test('서비스가 없으면 스토어 의존 핸들러를 등록하지 않는다', () => {
    const registry = createDefaultGameplayEventRegistry(null);
    expect(registry.getCondition('always')).toBeDefined();
    expect(registry.getAction('setFlag')).toBeDefined();
    expect(registry.getCondition('hasItem')).toBeUndefined();
    expect(registry.getAction('giveItem')).toBeUndefined();
  });

  test('서비스 포트로 조건과 행동을 위임한다', async () => {
    const services = createServices();
    const registry = createDefaultGameplayEventRegistry(services);
    await registry.getCondition('hasItem')?.({ type: 'hasItem', itemId: 'apple' } as never, context);
    expect(services.hasItem).toHaveBeenCalledWith('apple', 1);
    await registry.getAction('toast')?.({ type: 'toast', text: '안녕' } as never, context);
    expect(services.notify).toHaveBeenCalledWith('info', '안녕');
    await registry.getAction('showDialog')?.({ type: 'showDialog', dialogTreeId: 'intro', npcId: 'mira' } as never, context);
    expect(services.showDialog).toHaveBeenCalledWith('intro', 'mira');
  });
});
