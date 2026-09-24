import 'reflect-metadata';

import { MotionBridge } from '../../motions/bridge/MotionBridge';
import { BridgeFactory } from '../bridge/BridgeFactory';

afterEach(() => BridgeFactory.disposeAll());

test('recreating a disposed domain yields a fresh bridge instead of the disposed singleton', () => {
  const first = BridgeFactory.getOrCreateFor(MotionBridge);
  BridgeFactory.dispose('motion');

  const second = BridgeFactory.getOrCreateFor(MotionBridge);

  expect(second).toBeInstanceOf(MotionBridge);
  expect(second).not.toBe(first);
});

test('disposeAll releases every cached singleton', () => {
  const first = BridgeFactory.getOrCreateFor(MotionBridge);
  BridgeFactory.disposeAll();

  expect(BridgeFactory.getOrCreateFor(MotionBridge)).not.toBe(first);
});
