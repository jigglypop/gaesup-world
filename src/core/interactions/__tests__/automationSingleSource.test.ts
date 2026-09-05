import { InteractionBridge } from '../bridge/InteractionBridge';
import { getDefaultInteractionInputBackend } from '../core/adapter';
import * as THREE from 'three';
import { useGaesupStore } from '../../stores/gaesupStore';

beforeEach(() => {
  jest.useFakeTimers();
  useGaesupStore.getState().resetInteractions();
});

afterEach(() => {
  useGaesupStore.getState().stopAutomation();
  InteractionBridge.disposeGlobal();
  jest.useRealTimers();
});

test('store and bridge commands share one queue and project asynchronous completion', async () => {
  const id = useGaesupStore.getState().addAutomationAction({ type: 'wait', duration: 100 });
  const bridge = InteractionBridge.getGlobal();
  bridge.executeCommand({ type: 'automation', action: 'addAction', data: { type: 'wait', duration: 200 } });
  expect(bridge.getAutomationSystem().getState().queue.actions[0]?.id).toBe(id);
  expect(useGaesupStore.getState().automation.queue.actions).toHaveLength(2);
  useGaesupStore.getState().startAutomation();
  expect(useGaesupStore.getState().automation.queue.isRunning).toBe(true);
  await jest.advanceTimersByTimeAsync(100);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(1);
  await jest.advanceTimersByTimeAsync(500);
  expect(useGaesupStore.getState().automation.queue.isRunning).toBe(false);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(2);
});

test('store pause and bridge resume operate on the same execution', async () => {
  useGaesupStore.getState().addAutomationAction({ type: 'wait', duration: 100 });
  useGaesupStore.getState().startAutomation();
  useGaesupStore.getState().pauseAutomation();
  await jest.advanceTimersByTimeAsync(500);
  expect(useGaesupStore.getState().automation.queue.isPaused).toBe(true);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(0);
  InteractionBridge.getGlobal().executeCommand({ type: 'automation', action: 'resume' });
  await jest.advanceTimersByTimeAsync(300);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(1);
});

test('projection reconnects after global bridge disposal and supports queue editing', () => {
  useGaesupStore.getState().addAutomationAction({ type: 'wait' });
  InteractionBridge.disposeGlobal();
  const id = useGaesupStore.getState().addAutomationAction({ type: 'wait' });
  expect(useGaesupStore.getState().automation.queue.actions).toHaveLength(1);
  useGaesupStore.getState().removeAutomationAction(id);
  expect(InteractionBridge.getGlobal().getAutomationSystem().getState().queue.actions).toHaveLength(0);
  useGaesupStore.getState().updateAutomationSettings({ throttle: 25 });
  expect(InteractionBridge.getGlobal().getAutomationSystem().getState().settings.throttle).toBe(25);
});

test('move waits for arrival before wait and the next move start', async () => {
  const backend = getDefaultInteractionInputBackend();
  const first = new THREE.Vector3(10, 0, 0);
  const second = new THREE.Vector3(20, 0, 0);
  const store = useGaesupStore.getState();
  store.addAutomationAction({ type: 'move', target: first });
  store.addAutomationAction({ type: 'wait', duration: 200 });
  store.addAutomationAction({ type: 'move', target: second });
  store.startAutomation();
  await jest.advanceTimersByTimeAsync(1000);
  expect(backend.getMouse().target).toEqual(first);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(0);
  backend.updateMouse({ isActive: false, hasArrived: true });
  await jest.advanceTimersByTimeAsync(299);
  expect(backend.getMouse().isActive).toBe(false);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(1);
  await jest.advanceTimersByTimeAsync(101);
  expect(backend.getMouse().target).toEqual(second);
  expect(backend.getMouse().isActive).toBe(true);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(2);
  store.pauseAutomation();
  expect(backend.getMouse().isActive).toBe(false);
  await jest.advanceTimersByTimeAsync(1000);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(2);
  store.resumeAutomation();
  expect(backend.getMouse().isActive).toBe(true);
  backend.updateMouse({ isActive: false, hasArrived: true });
  await jest.advanceTimersByTimeAsync(100);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(3);
});

test('clearing an in-flight movement cancels input and pending execution', async () => {
  const store = useGaesupStore.getState();
  store.addAutomationAction({ type: 'move', target: new THREE.Vector3(10, 0, 0) });
  store.startAutomation();
  store.clearAutomationQueue();
  await jest.advanceTimersByTimeAsync(1000);
  expect(getDefaultInteractionInputBackend().getMouse().isActive).toBe(false);
  expect(useGaesupStore.getState().automation.queue.isRunning).toBe(false);
  expect(useGaesupStore.getState().automation.queue.actions).toHaveLength(0);
});

test('cancelling movement does not complete it or start the next action', async () => {
  const store = useGaesupStore.getState();
  store.addAutomationAction({ type: 'move', target: new THREE.Vector3(100, 0, 0) });
  store.addAutomationAction({ type: 'wait', duration: 100 });
  store.startAutomation();
  getDefaultInteractionInputBackend().updateMouse({ isActive: false });
  await jest.advanceTimersByTimeAsync(10_000);
  const { automation } = useGaesupStore.getState();
  expect(automation.queue.isRunning).toBe(false);
  expect(automation.queue.currentIndex).toBe(0);
  expect(automation.executionStats.totalExecuted).toBe(0);
});

test('a replacement input target stops automation and retains manual movement', async () => {
  const store = useGaesupStore.getState();
  store.addAutomationAction({ type: 'move', target: new THREE.Vector3(100, 0, 0) });
  store.startAutomation();
  const backend = getDefaultInteractionInputBackend();
  const manualTarget = new THREE.Vector3(0, 0, 100);
  backend.updateMouse({ target: manualTarget, isActive: true });
  await jest.advanceTimersByTimeAsync(10_000);
  expect(useGaesupStore.getState().automation.queue.isRunning).toBe(false);
  expect(useGaesupStore.getState().automation.executionStats.totalExecuted).toBe(0);
  expect(backend.getMouse().target).toEqual(manualTarget);
  expect(backend.getMouse().isActive).toBe(true);
  backend.updateMouse({ isActive: false });
});

test('unreachable movement times out, brakes during retries and never reports success', async () => {
  const store = useGaesupStore.getState();
  store.updateAutomationConfig({ timeoutDuration: 100, retryDelay: 200 });
  store.addAutomationAction({ type: 'move', target: new THREE.Vector3(100, 0, 0) });
  store.startAutomation();
  const backend = getDefaultInteractionInputBackend();
  await jest.advanceTimersByTimeAsync(100);
  expect(backend.getMouse().isActive).toBe(false);
  expect(useGaesupStore.getState().automation.executionStats.errors).toHaveLength(1);
  await jest.advanceTimersByTimeAsync(200);
  expect(backend.getMouse().isActive).toBe(true);
  await jest.advanceTimersByTimeAsync(1000);
  expect(backend.getMouse().isActive).toBe(false);
  const { automation } = useGaesupStore.getState();
  expect(automation.queue.isRunning).toBe(false);
  expect(automation.executionStats.errors).toHaveLength(4);
  expect(automation.executionStats.totalExecuted).toBe(0);
});
