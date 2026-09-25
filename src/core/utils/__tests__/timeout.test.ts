import { withTimeout } from '../timeout';

afterEach(() => jest.useRealTimers());

test('passes through work that settles in time and clears its timer', async () => {
  jest.useFakeTimers();
  await expect(withTimeout(Promise.resolve('done'), 1000, 'save')).resolves.toBe('done');
  expect(jest.getTimerCount()).toBe(0);
  await expect(withTimeout(Promise.reject(new Error('disk full')), 1000, 'save')).rejects.toThrow('disk full');
  expect(jest.getTimerCount()).toBe(0);
});

test('rejects with the label once the work outlives the limit', async () => {
  jest.useFakeTimers();
  const pending = withTimeout(new Promise<never>(() => {}), 1000, 'load');
  const assertion = expect(pending).rejects.toThrow('load timed out after 1000ms');
  jest.advanceTimersByTime(1000);
  await assertion;
});
