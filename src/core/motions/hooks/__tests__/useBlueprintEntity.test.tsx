import { StrictMode, type RefObject } from 'react';
import { renderHook } from '@testing-library/react';
import type { RapierRigidBody } from '@react-three/rapier';

import { useBlueprintEntity } from '../useBlueprintEntity';
import { WARRIOR_BLUEPRINT } from '../../../../blueprints/characters/warrior';
import { CharacterMovementComponent } from '../../../../blueprints/core/components/CharacterMovementComponent';
import { BlueprintEntity } from '../../../../blueprints/core/BlueprintEntity';
import type { BlueprintDefinition } from '../../../../blueprints/core/types';
import { logger } from '../../../utils/logger';

jest.mock('@react-three/fiber', () => ({ useFrame: jest.fn() }));

afterEach(() => jest.restoreAllMocks());

function bodyRef(): RefObject<RapierRigidBody> {
  return { current: { setEnabledRotations: jest.fn() } } as unknown as RefObject<RapierRigidBody>;
}

test('registered IDs create their components and expose the live entity', () => {
  const rigidBodyRef = bodyRef();
  const view = renderHook(() => useBlueprintEntity({ blueprint: WARRIOR_BLUEPRINT.id, rigidBodyRef }));
  try {
    expect(view.result.current.getComponent('CharacterMovement')).toBeInstanceOf(CharacterMovementComponent);
    expect(view.result.current.entity?.getBlueprint().physics?.mass).toBe(WARRIOR_BLUEPRINT.physics.mass);
  } finally {
    view.unmount();
  }
});

test('replacement, disabling and StrictMode release each owned entity once', () => {
  const rigidBodyRef = bodyRef();
  const dispose = jest.spyOn(BlueprintEntity.prototype, 'dispose');
  const definition: BlueprintDefinition = { id: 'direct', name: 'Direct', type: 'object', components: [] };
  const view = renderHook(({ blueprint, enabled }: { blueprint: string | BlueprintDefinition; enabled: boolean }) =>
    useBlueprintEntity({ blueprint, enabled, rigidBodyRef }), {
    initialProps: { blueprint: WARRIOR_BLUEPRINT.id as string | BlueprintDefinition, enabled: true },
    wrapper: StrictMode,
  });
  expect(dispose).toHaveBeenCalledTimes(1);
  const first = view.result.current.entity;
  view.rerender({ blueprint: definition, enabled: true });
  expect(view.result.current.entity?.getBlueprint()).toBe(definition);
  expect(dispose.mock.contexts.filter((entity) => entity === first)).toHaveLength(1);
  view.rerender({ blueprint: definition, enabled: false });
  expect(view.result.current.entity).toBeNull();
  expect(view.result.current.getComponent('CharacterMovement')).toBeUndefined();
  expect(dispose).toHaveBeenCalledTimes(3);
  view.unmount();
  expect(dispose).toHaveBeenCalledTimes(3);
});

test('unknown IDs produce a diagnostic instead of an empty character', () => {
  const error = jest.spyOn(logger, 'error').mockImplementation(() => {});
  const rigidBodyRef = bodyRef();
  const view = renderHook(({ blueprint }) => useBlueprintEntity({ blueprint, rigidBodyRef }), {
    initialProps: { blueprint: WARRIOR_BLUEPRINT.id },
  });
  expect(view.result.current.entity).not.toBeNull();
  view.rerender({ blueprint: 'missing-blueprint' });
  expect(view.result.current.entity).toBeNull();
  expect(view.result.current.getComponent('CharacterMovement')).toBeUndefined();
  expect(error).toHaveBeenCalledWith('Blueprint not found: missing-blueprint');
  view.unmount();
});
