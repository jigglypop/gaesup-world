import { reportError } from '../../utils/reportError';
import { createGaesupRuntime } from '../createGaesupRuntime';

test('runtime onError receives boundary errors only while the runtime is active', async () => {
  const onError = jest.fn();
  const runtime = createGaesupRuntime({ onError });

  reportError(new Error('before setup'), { source: 'test' });
  expect(onError).not.toHaveBeenCalled();

  await runtime.setup();
  reportError(new Error('while active'), { source: 'frame', label: 'camera' });
  expect(onError).toHaveBeenCalledWith(new Error('while active'), { source: 'frame', label: 'camera' });

  await runtime.dispose();
  reportError(new Error('after dispose'), { source: 'test' });
  expect(onError).toHaveBeenCalledTimes(1);
});
