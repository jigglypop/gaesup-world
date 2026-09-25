import { MotionBridge } from '../../motions/bridge/MotionBridge';
import { BridgeFactory } from '../bridge/BridgeFactory';

afterEach(() => BridgeFactory.disposeAll());

test('shares one instance per bridge class without any registration', () => {
  expect(BridgeFactory.get(MotionBridge)).toBeNull();
  const bridge = BridgeFactory.getOrCreateFor(MotionBridge);
  expect(bridge).toBeInstanceOf(MotionBridge);
  expect(BridgeFactory.getOrCreateFor(MotionBridge)).toBe(bridge);
  expect(BridgeFactory.get(MotionBridge)).toBe(bridge);
});

test('a disposed bridge is never handed out again', () => {
  const first = BridgeFactory.getOrCreateFor(MotionBridge);
  const dispose = jest.spyOn(first, 'dispose');
  BridgeFactory.dispose(MotionBridge);

  expect(dispose).toHaveBeenCalledTimes(1);
  expect(BridgeFactory.get(MotionBridge)).toBeNull();
  expect(BridgeFactory.getOrCreateFor(MotionBridge)).not.toBe(first);
});

test('disposeAll disposes every cached bridge', () => {
  const first = BridgeFactory.getOrCreateFor(MotionBridge);
  const dispose = jest.spyOn(first, 'dispose');
  BridgeFactory.disposeAll();

  expect(dispose).toHaveBeenCalledTimes(1);
  expect(BridgeFactory.getOrCreateFor(MotionBridge)).not.toBe(first);
});
