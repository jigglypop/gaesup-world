import { Vector3 } from 'three';

import { InteractionBridge } from '../InteractionBridge';
import { InteractionSystem } from '../../core/InteractionSystem';
import { AutomationSystem } from '../../core/AutomationSystem';

test('disposing one bridge preserves the input system borrowed by another', () => {
  const system = new InteractionSystem();
  const first = new InteractionBridge({ interactionSystem: system });
  const second = new InteractionBridge({ interactionSystem: system });
  const listener = jest.fn();
  system.addEventListener('keyboard', listener);
  try {
    first.dispose();
    expect(system.isDisposed).toBe(false);
    expect(first.getAutomationSystem().isDisposed).toBe(true);
    second.executeCommand({ type: 'input', action: 'updateKeyboard', data: { forward: true } });
    expect(second.getKeyboardState().forward).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  } finally {
    first.dispose();
    second.dispose();
    system.dispose();
  }
});

test('a supplied automation engine keeps running until its owner disposes it', async () => {
  jest.useFakeTimers();
  const system = new InteractionSystem();
  const automation = new AutomationSystem();
  const bridge = new InteractionBridge({ interactionSystem: system, automationSystem: automation });
  try {
    automation.addAction({ type: 'wait', duration: 100 });
    const completion = automation.start();
    bridge.dispose();
    expect(automation.isDisposed).toBe(false);
    await jest.advanceTimersByTimeAsync(200);
    await completion;
    expect(automation.getState().executionStats.totalExecuted).toBe(1);
  } finally {
    bridge.dispose();
    automation.dispose();
    system.dispose();
    jest.useRealTimers();
  }
});

test('bridges sharing an automation engine transfer projection without cancelling its run', async () => {
  jest.useFakeTimers();
  const input = new InteractionSystem();
  const engine = new AutomationSystem(true);
  const first = new InteractionBridge({ interactionSystem: input, automationSystem: engine });
  const second = new InteractionBridge({ interactionSystem: input, automationSystem: engine });
  try {
    engine.addAction({ type: 'move', target: new Vector3(1, 0, 0) });
    const run = engine.start();
    first.dispose();
    expect(engine.getState().queue.isRunning).toBe(true);
    expect(input.getMouseRef().isActive).toBe(true);
    input.updateMouse({ isActive: false, hasArrived: true });
    await jest.advanceTimersByTimeAsync(100);
    await run;
    expect(engine.getState().executionStats.totalExecuted).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    first.dispose();
    second.dispose();
    engine.dispose();
    input.dispose();
    jest.useRealTimers();
  }
});

test('independent movement loops retain arrival and pause ownership after another bridge is disposed', async () => {
  jest.useFakeTimers();
  const systems = [new InteractionSystem(), new InteractionSystem()];
  const automations = [new AutomationSystem(true), new AutomationSystem(true)];
  const bridges = systems.map(
    (interactionSystem, index) =>
      new InteractionBridge({
        interactionSystem,
        automationSystem: automations[index]!,
      }),
  );
  const first = automations[0]!;
  const second = automations[1]!;
  const firstInput = systems[0]!;
  const secondInput = systems[1]!;
  try {
    for (const [index, automation] of automations.entries()) {
      automation.getState().queue.loop = true;
      automation.addAction({ type: 'move', target: new Vector3(index + 1, 0, 0) });
      void automation.start();
    }
    first.pause();
    expect(firstInput.getMouseRef().isActive).toBe(false);
    expect(secondInput.getMouseRef().isActive).toBe(true);
    secondInput.updateMouse({ isActive: false, hasArrived: true });
    await jest.advanceTimersByTimeAsync(100);
    expect(second.getState().executionStats.totalExecuted).toBe(1);
    expect(secondInput.getMouseRef().isActive).toBe(true);
    expect(first.getState().executionStats.totalExecuted).toBe(0);
    first.resume();
    expect(firstInput.getMouseRef().isActive).toBe(true);
    bridges[0]!.dispose();
    first.dispose();
    expect(firstInput.getMouseRef().isActive).toBe(false);
    expect(secondInput.getMouseRef().isActive).toBe(true);
    secondInput.updateMouse({ isActive: false, hasArrived: true });
    await jest.advanceTimersByTimeAsync(100);
    expect(second.getState().executionStats.totalExecuted).toBe(2);
    expect(secondInput.getMouseRef().isActive).toBe(true);
    second.stop();
    expect(secondInput.getMouseRef().isActive).toBe(false);
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    bridges.forEach((bridge) => bridge.dispose());
    automations.forEach((automation) => automation.dispose());
    systems.forEach((system) => system.dispose());
    jest.useRealTimers();
  }
});

test.each([10, 20])(
  'a newer move to %s owns shared input after the previous bridge is disposed',
  async (targetX) => {
    jest.useFakeTimers();
    const input = new InteractionSystem();
    const first = new AutomationSystem(true);
    const second = new AutomationSystem(true);
    const a = new InteractionBridge({ interactionSystem: input, automationSystem: first });
    const b = new InteractionBridge({ interactionSystem: input, automationSystem: second });
    try {
      first.addAction({ type: 'move', target: new Vector3(10, 0, 0) });
      second.addAction({ type: 'move', target: new Vector3(targetX, 0, 0) });
      const firstRun = first.start();
      const secondRun = second.start();
      expect(first.getState().queue.isRunning).toBe(false);
      expect(second.getState().queue.isRunning).toBe(true);
      a.dispose();
      expect(input.getMouseRef().isActive).toBe(true);
      expect(input.getMouseRef().target.x).toBe(targetX);
      input.updateMouse({ isActive: false, hasArrived: true });
      await jest.advanceTimersByTimeAsync(100);
      await Promise.all([firstRun, secondRun]);
      expect(first.getState().executionStats.totalExecuted).toBe(0);
      expect(second.getState().executionStats.totalExecuted).toBe(1);
      expect(jest.getTimerCount()).toBe(0);
    } finally {
      a.dispose();
      b.dispose();
      first.dispose();
      second.dispose();
      input.dispose();
      jest.useRealTimers();
    }
  },
);

test('a move started by a cancellation listener retains the newest ownership', async () => {
  jest.useFakeTimers();
  const input = new InteractionSystem();
  const engines = [
    new AutomationSystem(true),
    new AutomationSystem(true),
    new AutomationSystem(true),
  ];
  const bridges = engines.map(
    (automationSystem) => new InteractionBridge({ interactionSystem: input, automationSystem }),
  );
  const [first, second, third] = engines as [AutomationSystem, AutomationSystem, AutomationSystem];
  try {
    engines.forEach((engine, index) =>
      engine.addAction({ type: 'move', target: new Vector3(index + 1, 0, 0) }),
    );
    first.addEventListener('automationStopped', () => {
      void third.start();
    });
    void first.start();
    void second.start();
    expect(first.getState().queue.isRunning).toBe(false);
    expect(second.getState().queue.isRunning).toBe(false);
    expect(third.getState().queue.isRunning).toBe(true);
    expect(input.getMouseRef().target.x).toBe(3);
    bridges[0]!.dispose();
    bridges[1]!.dispose();
    expect(input.getMouseRef().isActive).toBe(true);
    input.updateMouse({ isActive: false, hasArrived: true });
    await jest.advanceTimersByTimeAsync(100);
    expect(third.getState().executionStats.totalExecuted).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  } finally {
    bridges.forEach((bridge) => bridge.dispose());
    engines.forEach((engine) => engine.dispose());
    input.dispose();
    jest.useRealTimers();
  }
});
