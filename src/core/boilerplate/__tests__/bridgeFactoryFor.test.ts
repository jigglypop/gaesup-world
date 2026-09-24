import 'reflect-metadata';

import { MotionBridge } from '../../motions/bridge/MotionBridge';
import { BridgeFactory } from '../bridge/BridgeFactory';
import { BridgeRegistry } from '../bridge/BridgeRegistry';

class DetachedBridge {}

afterEach(() => BridgeFactory.dispose('motion'));

test('import 시점 등록이 빠져도 클래스로 조회하면 등록을 복구하고 같은 인스턴스를 재사용한다', () => {
  BridgeFactory.dispose('motion');
  BridgeRegistry.register('motion', DetachedBridge);
  const bridge = BridgeFactory.getOrCreateFor(MotionBridge);
  expect(bridge).toBeInstanceOf(MotionBridge);
  expect(BridgeRegistry.get('motion')).toBe(MotionBridge);
  expect(BridgeFactory.getOrCreateFor(MotionBridge)).toBe(bridge);
});

test('도메인 메타데이터가 없는 클래스는 조회하지 않는다', () => {
  expect(BridgeFactory.getOrCreateFor(DetachedBridge as never)).toBeNull();
});
