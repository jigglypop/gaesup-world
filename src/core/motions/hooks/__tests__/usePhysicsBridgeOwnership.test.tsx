import { createRef, type RefObject } from 'react';

import type { RootState } from '@react-three/fiber';
import type { RapierRigidBody } from '@react-three/rapier';
import { act, renderHook } from '@testing-library/react';

import { createInteractionInputAdapter } from '@core/interactions/core';
import { InMemoryEventBus } from '@core/plugins';
import { useGaesupStore } from '@stores/gaesupStore';

import { PhysicsBridge } from '../../bridge/PhysicsBridge';
import type { PhysicsConfigType } from '../../core/config';
import type { MotionsRuntime } from '../../plugin';
import type { PhysicsCalcProps, PhysicsState } from '../../types';
import { usePhysicsBridge, type UsePhysicsBridgeOptions } from '../usePhysicsBridge';
import { getGlobalStateManager } from '../useStateSystem';

type FrameCallback = (state: RootState, delta: number) => void;

const mockUseFrame = jest.fn<void, [FrameCallback]>();

function clonePhysicsConfig(config: PhysicsConfigType): PhysicsConfigType {
  return {
    ...config,
    ...(config.angleDelta ? { angleDelta: config.angleDelta.clone() } : {}),
    ...(config.maxAngle ? { maxAngle: config.maxAngle.clone() } : {}),
  };
}

const ORIGINAL_PHYSICS_CONFIG = clonePhysicsConfig(useGaesupStore.getState().physics);

jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: FrameCallback) => mockUseFrame(callback),
}));

function createRuntime(physicsBridge = new PhysicsBridge()): MotionsRuntime {
  return {
    physicsBridge,
    inputAdapter: createInteractionInputAdapter(),
    events: new InMemoryEventBus(),
    extensionIds: {
      physics: 'test.physics.bridge',
      input: 'test.interaction.input',
    },
  };
}

function createRigidBodyRef(): RefObject<RapierRigidBody> {
  const ref = createRef<RapierRigidBody>();
  ref.current = {
    lockRotations: jest.fn(),
    setTranslation: jest.fn(),
    setLinvel: jest.fn(),
    setAngvel: jest.fn(),
  } as unknown as RapierRigidBody;
  return ref;
}

function createOptions(
  motionsRuntime: MotionsRuntime,
  options: Partial<UsePhysicsBridgeOptions> = {},
): UsePhysicsBridgeOptions {
  return {
    rigidBodyRef: createRigidBodyRef(),
    motionsRuntime,
    ...options,
  };
}

describe('usePhysicsBridge entity ownership', () => {
  beforeEach(() => {
    useGaesupStore.setState({ physics: clonePhysicsConfig(ORIGINAL_PHYSICS_CONFIG) });
    jest.clearAllMocks();
  });

  afterEach(() => {
    useGaesupStore.setState({ physics: clonePhysicsConfig(ORIGINAL_PHYSICS_CONFIG) });
  });

  test('keeps two engines in a shared runtime and unmounts them independently', () => {
    const runtime = createRuntime();
    const first = renderHook(() =>
      usePhysicsBridge(createOptions(runtime, { entityId: 'entity-a' })),
    );
    const second = renderHook(() =>
      usePhysicsBridge(createOptions(runtime, { entityId: 'entity-b' })),
    );

    const secondEngine = runtime.physicsBridge.getEngine('entity-b');
    expect(runtime.physicsBridge.getEngine('entity-a')).toBeDefined();
    expect(secondEngine).toBeDefined();

    first.unmount();

    expect(runtime.physicsBridge.getEngine('entity-a')).toBeUndefined();
    expect(runtime.physicsBridge.getEngine('entity-b')).toBe(secondEngine);

    second.unmount();
    expect(runtime.physicsBridge.getEngine('entity-b')).toBeUndefined();
  });

  test('generates a unique stable fallback ID through rerenders and StrictMode replay', () => {
    const runtime = createRuntime();
    const registeredIds: string[] = [];
    runtime.physicsBridge.on('register', ({ id }) => registeredIds.push(id));
    const first = renderHook(
      ({ revision }: { revision: number }) => {
        void revision;
        return usePhysicsBridge(createOptions(runtime));
      },
      { initialProps: { revision: 0 }, reactStrictMode: true },
    );
    const firstId = registeredIds.at(-1);

    expect(firstId).toMatch(/^physics-.+-\d+$/);
    expect(registeredIds.length).toBeGreaterThanOrEqual(2);
    expect(new Set(registeredIds)).toEqual(new Set([firstId]));
    const registrationCount = registeredIds.length;

    first.rerender({ revision: 1 });
    expect(registeredIds).toHaveLength(registrationCount);
    expect(runtime.physicsBridge.getEngine(firstId as string)).toBeDefined();

    const second = renderHook(() => usePhysicsBridge(createOptions(runtime)), {
      reactStrictMode: true,
    });
    const secondId = registeredIds.at(-1);

    expect(secondId).toMatch(/^physics-.+-\d+$/);
    expect(secondId).not.toBe(firstId);
    expect(runtime.physicsBridge.getEngine(firstId as string)).toBeDefined();
    expect(runtime.physicsBridge.getEngine(secondId as string)).toBeDefined();

    first.unmount();
    expect(runtime.physicsBridge.getEngine(firstId as string)).toBeUndefined();
    expect(runtime.physicsBridge.getEngine(secondId as string)).toBeDefined();
    second.unmount();
    expect(runtime.physicsBridge.getEngine(secondId as string)).toBeUndefined();
  });

  test('cleans the captured bridge and ID across runtime and enabled transitions', () => {
    const firstRuntime = createRuntime();
    const secondRuntime = createRuntime();
    const firstExecute = jest
      .spyOn(firstRuntime.physicsBridge, 'execute')
      .mockImplementation(() => undefined);
    const secondExecute = jest
      .spyOn(secondRuntime.physicsBridge, 'execute')
      .mockImplementation(() => undefined);
    const firstUpdate = jest
      .spyOn(firstRuntime.physicsBridge, 'updateEntity')
      .mockImplementation(() => undefined);
    const secondUpdate = jest
      .spyOn(secondRuntime.physicsBridge, 'updateEntity')
      .mockImplementation(() => undefined);
    const options = createOptions(firstRuntime, { entityId: 'moving-entity' });
    const { rerender, unmount } = renderHook(
      ({ enabled, runtime }: { enabled: boolean; runtime: MotionsRuntime }) =>
        usePhysicsBridge({ ...options, enabled, motionsRuntime: runtime }),
      { initialProps: { enabled: true, runtime: firstRuntime } },
    );

    expect(firstRuntime.physicsBridge.getEngine('moving-entity')).toBeDefined();
    expect(firstExecute).toHaveBeenCalledWith('moving-entity', expect.any(Object));
    const firstExecuteCount = firstExecute.mock.calls.length;

    rerender({ enabled: true, runtime: secondRuntime });
    expect(firstRuntime.physicsBridge.getEngine('moving-entity')).toBeUndefined();
    expect(secondRuntime.physicsBridge.getEngine('moving-entity')).toBeDefined();
    expect(firstExecute).toHaveBeenCalledTimes(firstExecuteCount);
    expect(secondExecute).toHaveBeenCalledWith('moving-entity', expect.any(Object));

    const frameCallback = mockUseFrame.mock.calls.at(-1)?.[0];
    act(() => frameCallback?.({} as RootState, 0.016));
    expect(firstUpdate).not.toHaveBeenCalled();
    expect(secondUpdate).toHaveBeenCalledWith(
      'moving-entity',
      expect.objectContaining({ deltaTime: 0.016 }),
    );

    rerender({ enabled: false, runtime: secondRuntime });
    expect(secondRuntime.physicsBridge.getEngine('moving-entity')).toBeUndefined();

    rerender({ enabled: true, runtime: secondRuntime });
    expect(secondRuntime.physicsBridge.getEngine('moving-entity')).toBeDefined();

    unmount();
    expect(firstRuntime.physicsBridge.getEngine('moving-entity')).toBeUndefined();
    expect(secondRuntime.physicsBridge.getEngine('moving-entity')).toBeUndefined();
  });

  test('uses the registered entity ID for config commands and frame updates', () => {
    const runtime = createRuntime();
    const execute = jest
      .spyOn(runtime.physicsBridge, 'execute')
      .mockImplementation(() => undefined);
    const updateEntity = jest
      .spyOn(runtime.physicsBridge, 'updateEntity')
      .mockImplementation(() => undefined);
    const { unmount } = renderHook(() =>
      usePhysicsBridge(createOptions(runtime, { entityId: 'frame-entity' })),
    );

    expect(execute).toHaveBeenCalledWith('frame-entity', {
      type: 'updateConfig',
      data: expect.any(Object),
    });

    const frameCallback = mockUseFrame.mock.calls.at(-1)?.[0];
    expect(frameCallback).toBeDefined();
    act(() => frameCallback?.({} as RootState, 0.016));

    expect(updateEntity).toHaveBeenCalledWith(
      'frame-entity',
      expect.objectContaining({ deltaTime: 0.016 }),
    );

    unmount();
  });

  test('registers runtime transitions with the latest full store config', () => {
    const firstRuntime = createRuntime();
    const secondRuntime = createRuntime();
    const firstRegister = jest.spyOn(firstRuntime.physicsBridge, 'register');
    const firstExecute = jest.spyOn(firstRuntime.physicsBridge, 'execute');
    const secondRegister = jest.spyOn(secondRuntime.physicsBridge, 'register');
    const secondExecute = jest.spyOn(secondRuntime.physicsBridge, 'execute');
    const config0: PhysicsConfigType = {
      ...clonePhysicsConfig(ORIGINAL_PHYSICS_CONFIG),
      walkSpeed: 4,
      runSpeed: 8,
      normalGravityScale: 1,
    };
    useGaesupStore.setState({ physics: config0 });
    const options = createOptions(firstRuntime, { entityId: 'latest-config-entity' });
    const { rerender, unmount } = renderHook(
      ({
        enabled,
        revision,
        runtime,
      }: {
        enabled: boolean;
        revision: number;
        runtime: MotionsRuntime;
      }) => {
        void revision;
        return usePhysicsBridge({
          ...options,
          enabled,
          motionsRuntime: runtime,
        });
      },
      {
        initialProps: {
          enabled: true,
          revision: 0,
          runtime: firstRuntime,
        },
      },
    );

    expect(firstRegister).toHaveBeenLastCalledWith(
      'latest-config-entity',
      config0,
      expect.anything(),
    );
    expect(firstExecute).toHaveBeenLastCalledWith('latest-config-entity', {
      type: 'updateConfig',
      data: config0,
    });
    const initialExecuteCount = firstExecute.mock.calls.length;

    rerender({ enabled: true, revision: 1, runtime: firstRuntime });
    expect(firstExecute).toHaveBeenCalledTimes(initialExecuteCount);

    const config1: PhysicsConfigType = {
      ...clonePhysicsConfig(config0),
      walkSpeed: 11,
      runSpeed: 17,
      normalGravityScale: 2,
    };
    act(() => useGaesupStore.setState({ physics: config1 }));
    expect(firstExecute).toHaveBeenLastCalledWith('latest-config-entity', {
      type: 'updateConfig',
      data: config1,
    });

    rerender({ enabled: true, revision: 2, runtime: secondRuntime });
    expect(secondRegister).toHaveBeenLastCalledWith(
      'latest-config-entity',
      config1,
      expect.anything(),
    );
    expect(secondExecute).toHaveBeenLastCalledWith('latest-config-entity', {
      type: 'updateConfig',
      data: config1,
    });

    rerender({ enabled: false, revision: 3, runtime: secondRuntime });
    const disabledExecuteCount = secondExecute.mock.calls.length;
    const config2: PhysicsConfigType = {
      ...clonePhysicsConfig(config1),
      walkSpeed: 21,
      runSpeed: 29,
      normalGravityScale: 3,
    };
    act(() => useGaesupStore.setState({ physics: config2 }));
    expect(secondExecute).toHaveBeenCalledTimes(disabledExecuteCount);

    rerender({ enabled: true, revision: 4, runtime: secondRuntime });
    expect(secondRegister).toHaveBeenLastCalledWith(
      'latest-config-entity',
      config2,
      expect.anything(),
    );
    expect(secondExecute).toHaveBeenLastCalledWith('latest-config-entity', {
      type: 'updateConfig',
      data: config2,
    });

    act(() => useGaesupStore.getState().resetPhysics());
    const resetConfig = useGaesupStore.getState().physics;
    expect(resetConfig).toHaveProperty('navigationAgentRadius', undefined);
    expect(secondExecute).toHaveBeenLastCalledWith('latest-config-entity', {
      type: 'updateConfig',
      data: resetConfig,
    });

    unmount();
  });

  test('projects live mode and automation into one retained frame state', () => {
    const originalMode = { ...useGaesupStore.getState().mode };
    const originalAutomation = useGaesupStore.getState().automation;
    const createAutomation = (throttle: number): PhysicsState['automationOption'] => ({
      ...originalAutomation,
      isActive: throttle > 0,
      settings: {
        ...originalAutomation.settings,
        throttle,
      },
    });
    const characterAutomation = createAutomation(0);
    const vehicleAutomation = createAutomation(1);
    const airplaneAutomation = createAutomation(2);
    const finalCharacterAutomation = createAutomation(3);
    useGaesupStore.setState({
      mode: { ...originalMode, type: 'character' },
      automation: characterAutomation,
    });
    getGlobalStateManager().reset();

    const runtime = createRuntime();
    const register = jest.spyOn(runtime.physicsBridge, 'register');
    const updateEntity = jest
      .spyOn(runtime.physicsBridge, 'updateEntity')
      .mockImplementation(() => undefined);
    const rigidBodyRef = createRigidBodyRef();
    const lockRotations = jest.spyOn(rigidBodyRef.current, 'lockRotations');
    const setTranslation = jest.spyOn(rigidBodyRef.current, 'setTranslation');
    const getState = jest.spyOn(useGaesupStore, 'getState');
    const { unmount } = renderHook(() =>
      usePhysicsBridge({
        rigidBodyRef,
        motionsRuntime: runtime,
        entityId: 'live-projection-entity',
      }),
    );
    const frameCallback = mockUseFrame.mock.calls.at(-1)?.[0];
    const frameState = {} as RootState;

    const executeProjection = (
      mode: PhysicsState['modeType'],
      automation: PhysicsState['automationOption'],
    ): { calcProp: PhysicsCalcProps; physicsState: PhysicsState } => {
      act(() => {
        useGaesupStore.setState({
          mode: { ...originalMode, type: mode },
          automation,
        });
      });
      const expectedWorldContext = useGaesupStore.getState();
      getState.mockClear();
      act(() => frameCallback?.(frameState, 0.016));

      expect(getState).toHaveBeenCalledTimes(1);
      const update = updateEntity.mock.calls.at(-1)?.[1];
      if (!update) throw new Error('Expected a physics frame update.');
      expect(update.physicsState.modeType).toBe(mode);
      expect(update.physicsState.automationOption).toBe(automation);
      expect(update.calcProp.worldContext).toBe(expectedWorldContext);
      expect(update.calcProp.worldContext.automation).toBe(update.physicsState.automationOption);
      expect(update.calcProp.worldContext.mode.type).toBe(update.physicsState.modeType);
      return update;
    };

    try {
      expect(frameCallback).toBeDefined();
      const firstEngine = runtime.physicsBridge.getEngine('live-projection-entity');
      const character = executeProjection('character', characterAutomation);
      const retainedState = character.physicsState;
      const retainedCalcProp = character.calcProp;
      const retainedPosition = retainedState.activeState.position.clone();
      const retainedYaw = retainedState.activeState.euler.y;
      const retainedVelocity = retainedState.activeState.velocity.clone();

      const vehicle = executeProjection('vehicle', vehicleAutomation);
      const airplane = executeProjection('airplane', airplaneAutomation);
      const finalCharacter = executeProjection('character', finalCharacterAutomation);

      for (const update of [vehicle, airplane, finalCharacter]) {
        expect(update.physicsState).toBe(retainedState);
        expect(update.calcProp).toBe(retainedCalcProp);
        expect(update.physicsState.activeState.position).toEqual(retainedPosition);
        expect(update.physicsState.activeState.euler.y).toBe(retainedYaw);
        expect(update.physicsState.activeState.velocity).toEqual(retainedVelocity);
        expect(runtime.physicsBridge.getEngine('live-projection-entity')).toBe(firstEngine);
      }
      expect(register).toHaveBeenCalledTimes(1);
      expect(mockUseFrame).toHaveBeenCalledTimes(1);
      expect(mockUseFrame.mock.calls.at(-1)?.[0]).toBe(frameCallback);
      expect(lockRotations).toHaveBeenCalledTimes(1);
      expect(lockRotations).toHaveBeenCalledWith(false, true);
      expect(setTranslation).toHaveBeenCalledTimes(1);
      expect(setTranslation).toHaveBeenCalledWith(
        { x: retainedPosition.x, y: retainedPosition.y + 5, z: retainedPosition.z },
        true,
      );
    } finally {
      unmount();
      getState.mockRestore();
      useGaesupStore.setState({
        mode: originalMode,
        automation: originalAutomation,
      });
      getGlobalStateManager().reset();
    }
  });
});
