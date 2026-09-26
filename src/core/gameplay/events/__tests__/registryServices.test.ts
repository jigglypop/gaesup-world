import { createDefaultGameplayEventRegistry } from '../registry';
import type { GameplayEventContext, GameplayEventServices } from '../types';

function createServices() {
  return {
    showDialog: jest.fn(),
    notify: jest.fn(),
    emit: jest.fn(),
  } satisfies GameplayEventServices;
}

const context = { state: { flags: {} } } as unknown as GameplayEventContext;

describe('기본 gameplay 이벤트 레지스트리', () => {
  test('서비스가 없으면 스토어 의존 핸들러를 등록하지 않는다', () => {
    const registry = createDefaultGameplayEventRegistry(null);
    expect(registry.getCondition('always')).toBeDefined();
    expect(registry.getAction('setFlag')).toBeDefined();
    expect(registry.getAction('showDialog')).toBeUndefined();
    expect(registry.getAction('toast')).toBeUndefined();
  });

  test('서비스 포트로 행동을 위임한다', async () => {
    const services = createServices();
    const registry = createDefaultGameplayEventRegistry(services);
    await registry.getAction('toast')?.({ type: 'toast', text: '안녕' } as never, context);
    expect(services.notify).toHaveBeenCalledWith('info', '안녕');
    await registry.getAction('showDialog')?.({ type: 'showDialog', dialogTreeId: 'intro', npcId: 'mira' } as never, context);
    expect(services.showDialog).toHaveBeenCalledWith('intro', 'mira');
    await registry.getAction('emit')?.({ type: 'emit', eventName: 'gate.opened', payload: { gateId: 'north' } } as never, context);
    expect(services.emit).toHaveBeenCalledWith('gate.opened', { gateId: 'north' });
  });
});
