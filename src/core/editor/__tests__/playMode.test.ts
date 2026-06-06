import { createEditorPlayModeController } from '../playMode';

describe('editor play mode controller', () => {
  test('captures snapshot on enter and restores it on exit', async () => {
    let value = { count: 1 };
    const controller = createEditorPlayModeController({
      createSnapshot: () => ({ ...value }),
      restoreSnapshot: (snapshot) => {
        value = snapshot;
      },
    });

    const snapshot = await controller.enter();
    value = { count: 99 };

    expect(controller.getState().mode).toBe('play');
    expect(snapshot.data).toEqual({ count: 1 });

    await controller.exit();
    expect(controller.getState().mode).toBe('edit');
    expect(value).toEqual({ count: 1 });
  });

  test('pauses, resumes, toggles, and notifies listeners', async () => {
    const listener = jest.fn();
    const controller = createEditorPlayModeController({
      createSnapshot: () => 'snapshot',
      restoreSnapshot: jest.fn(),
    });
    const unsubscribe = controller.subscribe(listener);

    await controller.enter();
    controller.pause();
    expect(controller.getState().mode).toBe('paused');

    controller.resume();
    expect(controller.getState().mode).toBe('play');

    await controller.toggle();
    expect(controller.getState().mode).toBe('edit');
    expect(listener).toHaveBeenCalled();

    unsubscribe();
  });
});
