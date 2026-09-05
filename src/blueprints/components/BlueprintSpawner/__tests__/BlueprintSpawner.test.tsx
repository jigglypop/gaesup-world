import { StrictMode, type RefObject } from 'react';
import { act, render, type RenderResult } from '@testing-library/react';
import { useFrame } from '@react-three/fiber';
import { RigidBody, type RapierRigidBody } from '@react-three/rapier';

import { BlueprintSpawner } from '..';
import { BlueprintEntity } from '../../../core/BlueprintEntity';
import type { ComponentContext } from '../../../core/types';
import { BlueprintFactory } from '../../../factory/BlueprintFactory';
import { blueprintRegistry } from '../../../registry';
import { WARRIOR_BLUEPRINT } from '../../../characters/warrior';
import { BASIC_KART_BLUEPRINT } from '../../../vehicles/kart';
import type { AirplaneBlueprint } from '../../../types';

jest.mock('@react-three/fiber', () => ({ useFrame: jest.fn() }));
jest.mock('@react-three/rapier', () => ({ RigidBody: jest.fn(() => null) }));

function createEntity(id: string) {
  const entity = new BlueprintEntity({ id, name: id, type: 'character', components: [] }, {
    current: null,
  } as unknown as RefObject<RapierRigidBody>);
  const component = {
    type: 'test',
    enabled: true,
    initialize: jest.fn(),
    update: jest.fn<void, [ComponentContext]>(),
    dispose: jest.fn(),
  };
  entity.addComponent(component);
  return { entity, component };
}

function deferredEntity() {
  let resolve!: (entity: BlueprintEntity) => void;
  const promise = new Promise<BlueprintEntity>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

beforeEach(() => {
  jest.mocked(useFrame).mockClear();
});
afterEach(() => {
  jest.restoreAllMocks();
});

test('ID and direct spawns use blueprint mass and release character rotation locks for vehicles', async () => {
  const kart = { ...BASIC_KART_BLUEPRINT, id: 'physics-kart', physics: { ...BASIC_KART_BLUEPRINT.physics, mass: 275 } };
  const airplane: AirplaneBlueprint = {
    id: 'physics-plane', name: 'Plane', version: '1', type: 'airplane',
    physics: { mass: 720, maxSpeed: 100, acceleration: 10, turning: 1, lift: 2, drag: 0.1 },
    seats: [], animations: { idle: '' },
  };
  blueprintRegistry.register(kart);
  blueprintRegistry.register(airplane);
  let view: RenderResult | undefined;
  const rigidBody = jest.mocked(RigidBody);
  try {
    await act(async () => { view = render(<BlueprintSpawner blueprint={WARRIOR_BLUEPRINT} />); });
    expect(rigidBody.mock.calls.at(-1)?.[0].mass).toBe(WARRIOR_BLUEPRINT.physics.mass);
    expect(rigidBody.mock.calls.at(-1)?.[0].enabledRotations).toEqual([false, false, false]);
    await act(async () => { view?.rerender(<BlueprintSpawner blueprintId={kart.id} />); });
    expect(rigidBody.mock.calls.at(-1)?.[0].mass).toBe(275);
    expect(rigidBody.mock.calls.at(-1)?.[0].friction).toBe(0.8);
    expect(rigidBody.mock.calls.at(-1)?.[0].linearDamping).toBe(0.5);
    expect(rigidBody.mock.calls.at(-1)?.[0].enabledRotations).toEqual([true, true, true]);
    await act(async () => { view?.rerender(<BlueprintSpawner blueprintId={airplane.id} />); });
    expect(rigidBody.mock.calls.at(-1)?.[0].mass).toBe(720);
    expect(rigidBody.mock.calls.at(-1)?.[0].friction).toBe(0.1);
    expect(rigidBody.mock.calls.at(-1)?.[0].linearDamping).toBe(0.2);
    expect(rigidBody.mock.calls.at(-1)?.[0].enabledRotations).toEqual([true, true, true]);
    await act(async () => { view?.rerender(<BlueprintSpawner blueprint={WARRIOR_BLUEPRINT} blueprintId={airplane.id} />); });
    expect(rigidBody.mock.calls.at(-1)?.[0].mass).toBe(80);
    expect(rigidBody.mock.calls.at(-1)?.[0].enabledRotations).toEqual([false, false, false]);
    await act(async () => { view?.rerender(<BlueprintSpawner blueprint={kart} />); });
    expect(rigidBody.mock.calls.at(-1)?.[0].mass).toBe(275);
    expect(rigidBody.mock.calls.at(-1)?.[0].enabledRotations).toEqual([true, true, true]);
  } finally {
    view?.unmount();
    blueprintRegistry.remove(kart.id);
    blueprintRegistry.remove(airplane.id);
  }
});

test('updates the live entity and detaches it before unmount cleanup', async () => {
  const { entity, component } = createEntity('live');
  const spawn = jest
    .spyOn(BlueprintFactory.getInstance(), 'createFromId')
    .mockResolvedValue(entity);
  const onSpawn = jest.fn();
  const onDestroy = jest.fn();
  const movementInput = { forward: true, isGrounded: true };
  let view!: RenderResult;
  await act(async () => {
    view = render(<BlueprintSpawner blueprintId="live" onSpawn={onSpawn} onDestroy={onDestroy} getMovementInput={() => movementInput} />);
  });
  try {
    expect(onSpawn).toHaveBeenCalledWith(entity);
    const frame = jest.mocked(useFrame).mock.calls.at(-1)?.[0];
    expect(frame).toBeDefined();
    const state = {} as Parameters<NonNullable<typeof frame>>[0];
    frame?.(state, 0.25);
    expect(component.update).toHaveBeenCalledTimes(1);
    expect(component.update.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ deltaTime: 0.25, movementInput }),
    );
    const latestOnDestroy = jest.fn();
    await act(async () => {
      view.rerender(
        <BlueprintSpawner blueprintId="live" onSpawn={onSpawn} onDestroy={latestOnDestroy} />,
      );
    });
    expect(spawn).toHaveBeenCalledTimes(1);
    act(() => {
      view.unmount();
    });
    frame?.(state, 0.25);
    expect(component.update).toHaveBeenCalledTimes(1);
    expect(component.dispose).toHaveBeenCalledTimes(1);
    expect(onDestroy).not.toHaveBeenCalled();
    expect(latestOnDestroy).toHaveBeenCalledTimes(1);
  } finally {
    act(() => {
      view.unmount();
    });
  }
});

test('disposes an entity that finishes spawning after unmount without announcing it', async () => {
  const pending = deferredEntity();
  const { entity, component } = createEntity('late');
  jest.spyOn(BlueprintFactory.getInstance(), 'createFromId').mockReturnValue(pending.promise);
  const onSpawn = jest.fn();
  const onDestroy = jest.fn();
  let view!: RenderResult;
  act(() => {
    view = render(<BlueprintSpawner blueprintId="late" onSpawn={onSpawn} onDestroy={onDestroy} />);
  });
  act(() => {
    view.unmount();
  });
  await act(async () => {
    pending.resolve(entity);
  });
  expect(component.dispose).toHaveBeenCalledTimes(1);
  expect(onSpawn).not.toHaveBeenCalled();
  expect(onDestroy).not.toHaveBeenCalled();
});

test('a superseded spawn cannot replace or dispose the current entity', async () => {
  const pending = deferredEntity();
  const old = createEntity('old');
  const current = createEntity('current');
  jest
    .spyOn(BlueprintFactory.getInstance(), 'createFromId')
    .mockReturnValueOnce(pending.promise)
    .mockResolvedValueOnce(current.entity);
  const onSpawn = jest.fn();
  const onDestroy = jest.fn();
  let view!: RenderResult;
  act(() => {
    view = render(<BlueprintSpawner blueprintId="old" onSpawn={onSpawn} onDestroy={onDestroy} />);
  });
  await act(async () => {
    view.rerender(
      <BlueprintSpawner blueprintId="current" onSpawn={onSpawn} onDestroy={onDestroy} />,
    );
  });
  try {
    await act(async () => {
      pending.resolve(old.entity);
    });
    expect(old.component.dispose).toHaveBeenCalledTimes(1);
    expect(current.component.dispose).not.toHaveBeenCalled();
    expect(onSpawn).toHaveBeenCalledTimes(1);
    expect(onSpawn).toHaveBeenCalledWith(current.entity);
  } finally {
    act(() => {
      view.unmount();
    });
  }
  expect(current.component.dispose).toHaveBeenCalledTimes(1);
  expect(onDestroy).toHaveBeenCalledTimes(1);
});

test('StrictMode discards the first pending generation and retains the second', async () => {
  const old = createEntity('strict-old');
  const current = createEntity('strict-current');
  const spawn = jest
    .spyOn(BlueprintFactory.getInstance(), 'createFromId')
    .mockResolvedValueOnce(old.entity)
    .mockResolvedValueOnce(current.entity);
  const onSpawn = jest.fn();
  const onDestroy = jest.fn();
  let view!: RenderResult;
  await act(async () => {
    view = render(
      <StrictMode>
        <BlueprintSpawner blueprintId="strict" onSpawn={onSpawn} onDestroy={onDestroy} />
      </StrictMode>,
    );
  });
  try {
    expect(spawn).toHaveBeenCalledTimes(2);
    expect(old.component.dispose).toHaveBeenCalledTimes(1);
    expect(current.component.dispose).not.toHaveBeenCalled();
    expect(onSpawn).toHaveBeenCalledTimes(1);
    expect(onSpawn).toHaveBeenCalledWith(current.entity);
  } finally {
    view.unmount();
  }
  expect(current.component.dispose).toHaveBeenCalledTimes(1);
  expect(onDestroy).toHaveBeenCalledTimes(1);
});
