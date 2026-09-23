import { createRef } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { renderHook } from '@testing-library/react';

import { createDefaultCharacterAnimator } from '@core/animation/core/animator/defaultCharacterAnimator';
import { useMotionSetup } from '@core/motions/hooks/setup/useMotionSetup';
import { useCharacterAnimator } from '@core/motions/hooks/useCharacterAnimator';
import { usePhysicsBridge } from '@core/motions/hooks/usePhysicsBridge';

import { useEntity } from '../useEntity';

jest.mock('@core/motions/hooks/setup/useAnimationSetup', () => ({
  useAnimationSetup: jest.fn(),
}));
jest.mock('@core/motions/hooks/setup/useMotionSetup', () => ({
  useMotionSetup: jest.fn(),
}));
jest.mock('@core/motions/hooks/usePhysicsBridge', () => ({
  usePhysicsBridge: jest.fn(),
}));
jest.mock('@core/motions/hooks/useCharacterAnimator', () => ({
  useCharacterAnimator: jest.fn(),
}));
jest.mock('@stores/gaesupStore', () => ({
  useGaesupStore: jest.fn(() => ({ type: 'character' })),
}));
jest.mock('../useCollisionHandler', () => ({
  useCollisionHandler: jest.fn(() => ({})),
}));
jest.mock('../useEntityLifecycle', () => ({
  useEntityLifecycle: jest.fn(),
}));

const mockUseMotionSetup = jest.mocked(useMotionSetup);
const mockUsePhysicsBridge = jest.mocked(usePhysicsBridge);

function expectOwnershipKey(entityId: string): void {
  expect(mockUseMotionSetup).toHaveBeenLastCalledWith(
    entityId,
    expect.any(Object),
    'character',
    expect.any(Boolean),
  );
  expect(mockUsePhysicsBridge).toHaveBeenLastCalledWith(expect.objectContaining({ entityId }));
}

describe('useEntity ownership key', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseMotionSetup.mockReturnValue({
      executeMotionCommand: jest.fn(),
      getMotionSnapshot: jest.fn(() => null),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('keeps an explicit entity ID shared by motion and physics across rerenders', () => {
    const rigidBodyRef = createRef<RapierRigidBody>();
    const { rerender } = renderHook(({ id }: { id: string }) => useEntity({ id, rigidBodyRef }), {
      initialProps: { id: 'explicit-entity' },
    });

    expectOwnershipKey('explicit-entity');

    rerender({ id: 'replacement-id' });

    expectOwnershipKey('explicit-entity');
  });

  test('keeps an auto-generated entity ID shared by motion and physics across rerenders', () => {
    const rigidBodyRef = createRef<RapierRigidBody>();
    const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.25);
    const { rerender } = renderHook(
      ({ isActive }: { isActive: boolean }) => useEntity({ rigidBodyRef, isActive }),
      { initialProps: { isActive: false } },
    );

    const initialEntityId = 'entity-1700000000000-0.25';
    expectOwnershipKey(initialEntityId);

    nowSpy.mockReturnValue(1_800_000_000_000);
    randomSpy.mockReturnValue(0.75);
    rerender({ isActive: true });

    expectOwnershipKey(initialEntityId);
  });

  test('활성 캐릭터 엔티티만 Animator를 구동하고 지정한 컨트롤러를 전달한다', () => {
    const rigidBodyRef = createRef<RapierRigidBody>();
    const controller = createDefaultCharacterAnimator('entity.custom');
    const mockUseCharacterAnimator = jest.mocked(useCharacterAnimator);
    const { rerender } = renderHook(
      ({ isActive }: { isActive: boolean }) =>
        useEntity({ rigidBodyRef, isActive, animatorController: controller }),
      { initialProps: { isActive: false } },
    );
    expect(mockUseCharacterAnimator).toHaveBeenLastCalledWith({ enabled: false, controller });
    rerender({ isActive: true });
    expect(mockUseCharacterAnimator).toHaveBeenLastCalledWith({ enabled: true, controller });
  });
});
