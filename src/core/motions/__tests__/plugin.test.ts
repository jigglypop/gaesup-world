import { createPluginRegistry } from '../../plugins';
import { PhysicsBridge } from '../bridge/PhysicsBridge';
import {
  createMotionsRuntime,
  createMotionsPlugin,
  DEFAULT_MOTIONS_INPUT_EXTENSION_ID,
  DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID,
  DEFAULT_MOTIONS_RUNTIME_SERVICE_ID,
  MOTIONS_TELEPORT_EVENT,
  requestMotionsTeleport,
  type MotionsInputExtension,
  type MotionsPhysicsExtension,
  type MotionsRuntimeService,
  type MotionsTeleportPayload,
} from '../plugin';

describe('motions plugin', () => {
  it('registers physics bridge and input adapter extensions', async () => {
    const registry = createPluginRegistry();
    const readyEvents: unknown[] = [];
    registry.context.events.on('motions:ready', (payload) => readyEvents.push(payload));
    registry.register(createMotionsPlugin());

    await registry.setup('gaesup.motions');

    const physics = registry.context.systems.require<MotionsPhysicsExtension>('physics.bridge');
    const input = registry.context.input.require<MotionsInputExtension>('interaction.input');
    const bridge = physics.createBridge();

    expect(physics.Bridge).toBe(PhysicsBridge);
    expect(bridge).toBeInstanceOf(PhysicsBridge);
    expect(input.createAdapter().getKeyboard()).toEqual(expect.objectContaining({
      forward: false,
      backward: false,
    }));
    expect(registry.context.services.has(DEFAULT_MOTIONS_RUNTIME_SERVICE_ID)).toBe(true);
    expect(readyEvents).toEqual([
      {
        pluginId: 'gaesup.motions',
        physicsExtensionId: 'physics.bridge',
        inputExtensionId: 'interaction.input',
        runtimeServiceId: 'motions.runtime',
      },
    ]);
  });

  it('supports custom extension ids and removes them on dispose', async () => {
    const registry = createPluginRegistry();
    registry.register(createMotionsPlugin({
      id: 'custom.motions',
      physicsExtensionId: 'custom.physics',
      inputExtensionId: 'custom.input',
      runtimeServiceId: 'custom.motions.runtime',
    }));

    await registry.setup('custom.motions');
    expect(registry.context.systems.has('custom.physics')).toBe(true);
    expect(registry.context.input.has('custom.input')).toBe(true);
    expect(registry.context.services.has('custom.motions.runtime')).toBe(true);

    await registry.dispose('custom.motions');
    expect(registry.context.systems.has('custom.physics')).toBe(false);
    expect(registry.context.input.has('custom.input')).toBe(false);
    expect(registry.context.services.has('custom.motions.runtime')).toBe(false);
  });

  it('creates runtime bridge and input adapter from registered extensions', async () => {
    const registry = createPluginRegistry();
    registry.register(createMotionsPlugin());
    await registry.setup('gaesup.motions');

    const runtime = createMotionsRuntime(registry.context);

    expect(runtime.physicsBridge).toBeInstanceOf(PhysicsBridge);
    expect(runtime.inputAdapter.getKeyboard()).toEqual(expect.objectContaining({
      forward: false,
      backward: false,
    }));
    expect(runtime.extensionIds).toEqual({
      physics: DEFAULT_MOTIONS_PHYSICS_EXTENSION_ID,
      input: DEFAULT_MOTIONS_INPUT_EXTENSION_ID,
    });
  });

  it('supports custom runtime extension ids', async () => {
    const registry = createPluginRegistry();
    registry.register(createMotionsPlugin({
      id: 'custom.motions',
      physicsExtensionId: 'custom.physics',
      inputExtensionId: 'custom.input',
    }));
    await registry.setup('custom.motions');

    const runtime = createMotionsRuntime(registry.context, {
      physicsExtensionId: 'custom.physics',
      inputExtensionId: 'custom.input',
    });

    expect(runtime.physicsBridge).toBeInstanceOf(PhysicsBridge);
    expect(runtime.extensionIds).toEqual({
      physics: 'custom.physics',
      input: 'custom.input',
    });
  });

  it('publishes teleport requests through the runtime event bus', async () => {
    const registry = createPluginRegistry();
    registry.register(createMotionsPlugin());
    await registry.setup('gaesup.motions');
    const runtime = createMotionsRuntime(registry.context);
    const events: MotionsTeleportPayload[] = [];

    runtime.events.on<MotionsTeleportPayload>(MOTIONS_TELEPORT_EVENT, (payload) => {
      events.push(payload);
    });

    requestMotionsTeleport(runtime, {
      position: { x: 1, y: 2, z: 3 },
    });

    expect(events).toEqual([
      {
        position: { x: 1, y: 2, z: 3 },
      },
    ]);
  });

  it('registers a runtime service that creates MotionsRuntime from the plugin context', async () => {
    const registry = createPluginRegistry();
    registry.register(createMotionsPlugin());
    await registry.setup('gaesup.motions');

    const service = registry.context.services.require<MotionsRuntimeService>('motions.runtime');
    const runtime = service.create();

    expect(runtime.physicsBridge).toBeInstanceOf(PhysicsBridge);
    expect(runtime.inputAdapter.getKeyboard()).toEqual(expect.objectContaining({
      forward: false,
      backward: false,
    }));
    expect(runtime.events).toBe(registry.context.events);
  });

  it('uses custom physics and input factories when provided', async () => {
    const registry = createPluginRegistry();
    const physicsBridge = new PhysicsBridge();
    const inputAdapter = {
      getKeyboard: () => ({
        forward: true,
        backward: false,
        leftward: false,
        rightward: false,
        shift: false,
        space: false,
        keyZ: false,
        keyR: false,
        keyF: false,
        keyE: false,
        escape: false,
      }),
      getMouse: () => ({
        target: { x: 0, y: 0, z: 0 },
        angle: 0,
        isActive: false,
        shouldRun: false,
      }),
      updateKeyboard: jest.fn(),
      updateMouse: jest.fn(),
    };
    registry.register(createMotionsPlugin({
      createPhysicsBridge: () => physicsBridge,
      createInputAdapter: () => inputAdapter,
    }));
    await registry.setup('gaesup.motions');

    const service = registry.context.services.require<MotionsRuntimeService>('motions.runtime');
    const runtime = service.create();

    expect(runtime.physicsBridge).toBe(physicsBridge);
    expect(runtime.inputAdapter).toBe(inputAdapter);
    expect(runtime.inputAdapter.getKeyboard().forward).toBe(true);
  });
});
