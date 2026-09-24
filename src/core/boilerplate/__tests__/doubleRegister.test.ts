import { AbstractBridge } from '../bridge/AbstractBridge';
import { IDisposable } from '../types';

type Engine = { value: number } & IDisposable;
type Snapshot = { value: number };
type Command = { type: 'noop' };

class IdentityBridge extends AbstractBridge<Engine, Snapshot, Command> {
  protected buildEngine(_id: string, ...args: unknown[]): Engine | null {
    void _id;
    return (args[0] as Engine) ?? null;
  }
  protected executeCommand(): void {}
  protected createSnapshot(engine: Engine): Snapshot {
    return { value: engine.value };
  }
}

describe('이중 register 회귀 방지', () => {
  test('AbstractBridge.register는 동일 id에 동일 엔진 인스턴스가 다시 들어와도 dispose하지 않는다', () => {
    const bridge = new IdentityBridge();
    const engine: Engine = { value: 1, dispose: jest.fn() };

    bridge.register('e', engine);
    bridge.register('e', engine);

    expect(engine.dispose).not.toHaveBeenCalled();
    expect(bridge.getEngine('e')).toBe(engine);

    bridge.dispose();
  });

  test('AbstractBridge.register는 다른 엔진 인스턴스로 교체할 때만 기존 엔진을 dispose한다', () => {
    const bridge = new IdentityBridge();
    const first: Engine = { value: 1, dispose: jest.fn() };
    const second: Engine = { value: 2, dispose: jest.fn() };

    bridge.register('e', first);
    bridge.register('e', second);

    expect(first.dispose).toHaveBeenCalledTimes(1);
    expect(second.dispose).not.toHaveBeenCalled();
    expect(bridge.getEngine('e')).toBe(second);

    bridge.dispose();
  });
});
