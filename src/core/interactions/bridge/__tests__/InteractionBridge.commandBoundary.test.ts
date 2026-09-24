import { setErrorSink } from '../../../utils/reportError';
import { createMemoryInputBackend } from '../../core';
import { InteractionBridge } from '../InteractionBridge';

test('a failing command handler is reported at the command boundary instead of throwing', () => {
  const inputBackend = createMemoryInputBackend();
  const failure = new Error('backend rejected keyboard');
  inputBackend.updateKeyboard = () => { throw failure; };
  const reports = jest.fn();
  const release = setErrorSink(reports);
  const bridge = new InteractionBridge({ inputBackend });
  try {
    expect(() => bridge.executeCommand({ type: 'input', action: 'updateKeyboard', data: { forward: true } })).not.toThrow();
    expect(reports).toHaveBeenCalledWith(failure, { source: 'command:interaction', label: 'input.updateKeyboard' });
  } finally {
    bridge.dispose();
    release();
  }
});
