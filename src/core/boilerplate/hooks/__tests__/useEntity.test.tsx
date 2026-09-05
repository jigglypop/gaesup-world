import { createRef } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { renderHook } from '@testing-library/react';

import { useMotionSetup } from '@core/motions/hooks/setup/useMotionSetup';
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
jest.mock('@hooks/useAnimationPlayer', () => ({
  useAnimationPlayer: jest.fn(),
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
});
