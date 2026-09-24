import { Timeout } from '../monitoring';

class TimedWork {
  @Timeout(1000)
  async quick(): Promise<string> {
    return 'done';
  }

  @Timeout(1000)
  async hang(): Promise<string> {
    return new Promise<string>(() => undefined);
  }
}

describe('Timeout decorator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('clears its timer once the method settles', async () => {
    await expect(new TimedWork().quick()).resolves.toBe('done');
    expect(jest.getTimerCount()).toBe(0);
  });

  test('still rejects work that exceeds the limit', async () => {
    const pending = new TimedWork().hang();
    const assertion = expect(pending).rejects.toThrow('hang timed out after 1000ms');
    await jest.advanceTimersByTimeAsync(1000);
    await assertion;
    expect(jest.getTimerCount()).toBe(0);
  });
});
