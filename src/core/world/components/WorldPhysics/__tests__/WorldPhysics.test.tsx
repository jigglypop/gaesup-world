import type { ReactNode } from 'react';

import { act, render } from '@testing-library/react';

import { WorldPhysics } from '..';
import { GaesupRuntimeProvider } from '../../../../runtime/context';
import { createGaesupRuntime } from '../../../../runtime/createGaesupRuntime';
import { frameScheduler, useEngineFrame } from '../../../../runtime/frame';
import { useWorldPhysicsStep } from '../../../../simulation/physicsContext';

const mockStep = jest.fn();
const mockGet = () => ({});
let mockFrameloop = 'never';
jest.mock('@react-three/fiber', () => ({ useFrame: () => {}, useThree: (selector: (state: object) => unknown) => selector({ get: mockGet, frameloop: mockFrameloop }) }));
jest.mock('@react-three/rapier', () => ({
  Physics: ({ children, paused, timeStep }: { children: ReactNode; paused: boolean; timeStep: number }) => {
    expect(paused).toBe(true); expect(timeStep).toBe(1 / 60); return children;
  },
  useRapier: () => ({ step: mockStep }),
}));
jest.mock('../../../../wasm/loader', () => ({ loadCoreWasm: jest.fn(async () => null) }));
beforeEach(() => { jest.useFakeTimers(); mockStep.mockReset(); });
afterEach(() => jest.useRealTimers());

test.each([30, 60, 144])('controls, physics and publish run in order at %i Hz', async rate => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const order: string[] = [];
  mockStep.mockImplementation(delta => { expect(delta).toBe(1 / 60); order.push('physics'); });
  function Controls() { useWorldPhysicsStep((_, delta) => { expect(delta).toBe(1 / 60); order.push('controls'); }); return null; }
  const off = runtime.clockLoop.clock.addSystem({ id: 'test-publish', phase: 'publish', update: () => order.push('publish') });
  const view = render(<GaesupRuntimeProvider runtime={runtime}><WorldPhysics><Controls /></WorldPhysics></GaesupRuntimeProvider>);
  try {
    expect(runtime.clockLoop.ownerCount).toBe(1);
    for (let i = 0; i < rate; i++) runtime.clockLoop.clock.advance(1 / rate);
    expect(mockStep).toHaveBeenCalledTimes(60);
    expect(order).toEqual(Array.from({ length: 60 }, () => ['controls', 'physics', 'publish']).flat());
    view.unmount(); off(); expect(runtime.clockLoop.clock.systemCount).toBe(1);
    expect(runtime.clockLoop.consumerCount).toBe(0); expect(jest.getTimerCount()).toBe(0);
  } finally { view.unmount(); off(); await runtime.dispose(); }
});

test('pause, runtime disposal and restart gate both controls and Rapier without remounting', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const update = jest.fn();
  function Controls() { useWorldPhysicsStep(update); return null; }
  const tree = (paused: boolean) => <GaesupRuntimeProvider runtime={runtime}><WorldPhysics paused={paused}><Controls /></WorldPhysics></GaesupRuntimeProvider>;
  const view = render(tree(false));
  try {
    runtime.clockLoop.clock.stepTicks(2);
    view.rerender(tree(true)); runtime.clockLoop.clock.stepTicks(3);
    expect(update).toHaveBeenCalledTimes(2); expect(mockStep).toHaveBeenCalledTimes(2);
    expect(runtime.clockLoop.consumerCount).toBe(0);
    view.rerender(tree(false)); runtime.clockLoop.clock.stepTicks(2);
    await act(() => runtime.dispose()); runtime.clockLoop.clock.stepTicks(3);
    expect(update).toHaveBeenCalledTimes(4); expect(mockStep).toHaveBeenCalledTimes(4);
    await act(() => runtime.setup()); runtime.clockLoop.clock.stepTicks(2);
    expect(update).toHaveBeenCalledTimes(6); expect(mockStep).toHaveBeenCalledTimes(6);
    expect(runtime.clockLoop.ownerCount).toBe(1);
  } finally { view.unmount(); await runtime.dispose(); }
});

test('multiple physics scenes share one world driver, and disposing another world is isolated', async () => {
  const a = createGaesupRuntime(); const b = createGaesupRuntime(); await a.setup(); await b.setup();
  const updateA = jest.fn(); const updateB = jest.fn();
  function Controls({ update }: { update: () => void }) { useWorldPhysicsStep(update); return null; }
  const view = render(<>
    <GaesupRuntimeProvider runtime={a}><WorldPhysics><Controls update={updateA} /></WorldPhysics><WorldPhysics>{null}</WorldPhysics></GaesupRuntimeProvider>
    <GaesupRuntimeProvider runtime={b}><WorldPhysics><Controls update={updateB} /></WorldPhysics></GaesupRuntimeProvider>
  </>);
  try {
    expect(a.clockLoop.consumerCount).toBe(2); expect(a.clockLoop.ownerCount).toBe(1);
    expect(b.clockLoop.ownerCount).toBe(1);
    a.clockLoop.clock.stepTicks(60); b.clockLoop.clock.stepTicks(60);
    expect(updateA).toHaveBeenCalledTimes(60); expect(updateB).toHaveBeenCalledTimes(60);
    expect(mockStep).toHaveBeenCalledTimes(180);
    await act(() => a.dispose()); a.clockLoop.clock.stepTicks(60); b.clockLoop.clock.stepTicks(60);
    expect(updateA).toHaveBeenCalledTimes(60); expect(updateB).toHaveBeenCalledTimes(120);
    expect(mockStep).toHaveBeenCalledTimes(240);
  } finally { view.unmount(); await a.dispose(); await b.dispose(); }
});

test('a canvas rendering every frame advances the fixed clock between prePhysics and postPhysics', async () => {
  const runtime = createGaesupRuntime(); await runtime.setup();
  const order: string[] = [];
  mockStep.mockImplementation(() => order.push('physics'));
  function Probe() {
    useEngineFrame('prePhysics', () => order.push('input'));
    useEngineFrame('postPhysics', () => order.push('postPhysics'));
    useEngineFrame('camera', () => order.push('camera'));
    return null;
  }
  mockFrameloop = 'always';
  const view = render(<GaesupRuntimeProvider runtime={runtime}><WorldPhysics><Probe /></WorldPhysics></GaesupRuntimeProvider>);
  try {
    expect(runtime.clockLoop.ownerCount).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
    frameScheduler.tick(1 / 60, 0);
    expect(order).toEqual(['input', 'physics', 'postPhysics', 'camera']);
  } finally { mockFrameloop = 'never'; view.unmount(); await runtime.dispose(); }
});
