import { LineBasicMaterial, MeshBasicMaterial, MeshStandardMaterial, MeshToonMaterial, PerspectiveCamera, UnsignedByteType } from 'three';
import type { Material } from 'three';
import type { PassNode } from 'three/webgpu';

jest.mock('three/addons/tsl/display/SSGINode.js', () => ({ ssgi: jest.fn() }));
jest.mock('three/addons/tsl/display/SSRNode.js', () => ({ ssr: jest.fn() }));
jest.mock('three/addons/tsl/display/DenoiseNode.js', () => ({ denoise: jest.fn() }));

import {
  createScreenSpaceLighting,
  disposeAll,
  loadScreenSpaceLighting,
  surfaceOutputs,
  type ScreenSpaceLightingModules,
  type ScreenSpaceLightingSettings,
} from '../screenSpaceLighting';

type Tsl = Parameters<typeof surfaceOutputs>[0];
/** A stand-in TSL node: every property and call yields a node, except the fields it was created with. */
type Chain = ((...args: unknown[]) => Chain) & { [key: string]: unknown };

/** Keys that promise and matcher checks probe; a node answering them would pass for a thenable or a matcher. */
const PROBED = new Set<PropertyKey>(['then', 'asymmetricMatch', '$typeof', 'toJSON', 'nodeType']);

function chain(fields: Record<string, unknown> = {}): Chain {
  const target = Object.assign(() => undefined, fields);
  const node: Chain = new Proxy(target, {
    get: (object, key) => {
      if (Object.prototype.hasOwnProperty.call(object, key)) return (object as Record<PropertyKey, unknown>)[key];
      return typeof key === 'symbol' || PROBED.has(key) ? undefined : node;
    },
    apply: () => node,
  }) as unknown as Chain;
  return node;
}

/** TSL whose functions return stand-in nodes, with the few calls the tests read back. */
function fakeTsl(overrides: Record<string, unknown> = {}): Tsl {
  const functions: Record<string, unknown> = {
    rtt: jest.fn(() => chain({ setResolutionScale: jest.fn(), dispose: jest.fn() })),
    uniform: jest.fn((value: unknown) => ({ value })),
    ...overrides,
  };
  return new Proxy(functions, { get: (object, key: string) => (key in object ? object[key] : (object[key] = jest.fn(() => chain()))) }) as unknown as Tsl;
}

const SETTINGS: ScreenSpaceLightingSettings = {
  giRadius: 4,
  giSteps: 8,
  giIntensity: 8,
  giResolutionScale: 0.5,
  reflectionDistance: 8,
  reflectionQuality: 0.5,
  reflectionIntensity: 1,
  reflectionResolutionScale: 0.5,
  reflectionMaxRoughness: 0.5,
};

function fakeScene() {
  const surfaceTexture = { type: 0 };
  const textures = { output: chain(), depth: chain(), normal: chain(), surface: chain() };
  const pass = { getTexture: jest.fn(() => surfaceTexture), getTextureNode: jest.fn((name: keyof typeof textures) => textures[name]) };
  return { surfaceTexture, textures, pass: pass as unknown as PassNode };
}

function fakeModules() {
  const setSize = jest.fn();
  const gi = {
    sliceCount: { value: 1 },
    stepCount: { value: 12 },
    radius: { value: 12 },
    giIntensity: { value: 10 },
    useScreenSpaceSampling: { value: true },
    useTemporalFiltering: true,
    setSize,
    getAONode: () => chain(),
    getGINode: () => chain(),
    dispose: jest.fn(),
  };
  const reflection = chain({
    maxDistance: { value: 1 },
    quality: { value: 0.5 },
    intensity: { value: 1 },
    thickness: { value: 0.1 },
    resolutionScale: 1,
    dispose: jest.fn(),
  });
  const filters: Chain[] = [];
  const modules = {
    gi: { ssgi: jest.fn(() => gi) },
    reflections: { ssr: jest.fn(() => reflection) },
    denoise: {
      denoise: jest.fn(() => {
        const filter = chain({ depthPhi: { value: 5 }, dispose: jest.fn() });
        filters.push(filter);
        return filter;
      }),
    },
  };
  return { gi, setSize, reflection, filters, modules: modules as unknown as ScreenSpaceLightingModules };
}

describe('surfaceOutputs', () => {
  // Each output is a function node whose body runs per material while its shader builds.
  const tsl = fakeTsl({
    Fn: (body: (builder: { material: Material | null }) => unknown) => () => body,
    vec4: (...parts: unknown[]) => parts,
    vec3: (...parts: unknown[]) => ({ vec3: parts }),
    float: (value: number) => ({ float: value }),
    normalView: 'normalView',
    roughness: 'roughness',
    metalness: 'metalness',
    diffuseColor: { rgb: 'baseColor' },
  });
  const outputs = surfaceOutputs(tsl) as unknown as Record<'normal' | 'surface', (builder: { material: Material | null }) => unknown>;
  const build = (material: Material | null) => ({ normal: outputs.normal({ material }), surface: outputs.surface({ material }) });

  it('lets standard and physical materials reflect with their roughness and metalness', () => {
    expect(build(new MeshStandardMaterial())).toEqual({ normal: ['normalView', 'roughness'], surface: ['baseColor', 'metalness'] });
  });

  it('keeps other lit materials out of reflections but lets them receive bounced light', () => {
    expect(build(new MeshToonMaterial())).toEqual({ normal: ['normalView', { float: 1 }], surface: ['baseColor', 0] });
  });

  it('gives unlit materials no bounced light', () => {
    const unlit = { surface: [{ vec3: [0] }, 0] };
    expect(build(new MeshBasicMaterial())).toMatchObject(unlit);
    expect(build(new LineBasicMaterial())).toMatchObject(unlit);
    expect(build({ isNodeMaterial: true, lights: false } as unknown as Material)).toMatchObject(unlit);
    expect(build({ isNodeMaterial: true, lights: true } as unknown as Material)).toMatchObject({ surface: ['baseColor', 0] });
  });
});

describe('createScreenSpaceLighting', () => {
  const camera = new PerspectiveCamera();

  it('configures GI and reflections from the scene pass and moves only uniforms on update', () => {
    const { surfaceTexture, textures, pass } = fakeScene();
    const { gi, setSize, reflection, filters, modules } = fakeModules();
    const tsl = fakeTsl();
    const lighting = createScreenSpaceLighting(tsl, modules, pass, camera, true);

    expect(surfaceTexture.type).toBe(UnsignedByteType);
    expect(gi).toMatchObject({ sliceCount: { value: 2 }, useScreenSpaceSampling: { value: false }, useTemporalFiltering: true });
    const [source, depth, normal, giCamera] = (modules.gi!.ssgi as unknown as jest.Mock).mock.calls[0] as unknown[];
    // GI reads capped radiance and interpolated depth, not the raw pass textures.
    expect([source === textures.output, depth === textures.depth, normal, giCamera]).toEqual([false, false, textures.normal, camera]);
    expect(filters).toHaveLength(2);
    expect(filters.map((filter) => (filter['depthPhi'] as { value: number }).value)).toEqual([0.5, 0.5]);
    expect(modules.reflections!.ssr).toHaveBeenCalledWith(textures.output, textures.depth, textures.normal, expect.objectContaining({ camera }));
    expect(lighting.color).toBe((tsl.rtt as jest.Mock).mock.results[1]?.value);

    lighting.update({ ...SETTINGS, giSteps: 40.4, giIntensity: -1, giResolutionScale: 0.1, reflectionQuality: 2, reflectionResolutionScale: 0.75 });
    expect(gi).toMatchObject({ radius: { value: 4 }, stepCount: { value: 32 }, giIntensity: { value: 0 } });
    const { maxDistance, quality, intensity, thickness, resolutionScale } = reflection;
    expect({ maxDistance, quality, intensity, thickness, resolutionScale }).toEqual({
      maxDistance: { value: 8 },
      quality: { value: 1 },
      intensity: { value: 1 },
      thickness: { value: 0.35 },
      resolutionScale: 0.75,
    });
    const smoothed = (tsl.rtt as jest.Mock).mock.results[0]?.value as { setResolutionScale: jest.Mock };
    expect(smoothed.setResolutionScale).toHaveBeenLastCalledWith(0.25);
    // SSGINode sizes itself from the drawing buffer; the scaled size is what reaches it.
    (gi.setSize as unknown as (width: number, height: number) => void)(1000, 600);
    expect(setSize).toHaveBeenLastCalledWith(250, 150);
    lighting.update(SETTINGS);
    (gi.setSize as unknown as (width: number, height: number) => void)(1000, 600);
    expect(setSize).toHaveBeenLastCalledWith(500, 300);
  });

  it('turns off temporal GI noise without TRAA and builds only the requested effects', () => {
    const { pass } = fakeScene();
    const { gi, modules } = fakeModules();
    createScreenSpaceLighting(fakeTsl(), modules, pass, camera, false);
    expect(gi.useTemporalFiltering).toBe(false);

    const reflectionsOnly = fakeModules();
    const tsl = fakeTsl();
    createScreenSpaceLighting(tsl, { ...reflectionsOnly.modules, gi: null, denoise: null }, fakeScene().pass, camera, true);
    expect(reflectionsOnly.modules.gi!.ssgi).not.toHaveBeenCalled();
    expect(reflectionsOnly.modules.denoise!.denoise).not.toHaveBeenCalled();
    expect(tsl.rtt).toHaveBeenCalledTimes(1);
  });

  it('disposes every node and target it created', () => {
    const { pass } = fakeScene();
    const { gi, reflection, filters, modules } = fakeModules();
    const tsl = fakeTsl();
    createScreenSpaceLighting(tsl, modules, pass, camera, true).dispose();
    const targets = (tsl.rtt as jest.Mock).mock.results.map((result) => result.value as { dispose: jest.Mock });
    for (const owned of [gi, reflection, ...filters, ...targets]) expect(owned.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('disposeAll', () => {
  it('disposes every resource and rethrows the first failure', () => {
    const failure = new Error('first');
    const resources = [
      { dispose: jest.fn(() => { throw failure; }) },
      null,
      { dispose: jest.fn(() => { throw new Error('second'); }) },
      { dispose: jest.fn() },
    ];
    expect(() => disposeAll(resources)).toThrow(failure);
    for (const resource of resources) if (resource) expect(resource.dispose).toHaveBeenCalledTimes(1);
  });
});

describe('loadScreenSpaceLighting', () => {
  it('loads GI with its filter and reflections only when asked', async () => {
    const gi = await loadScreenSpaceLighting(true, false);
    expect(gi.gi).not.toBeNull();
    expect(gi.denoise).not.toBeNull();
    expect(gi.reflections).toBeNull();
    const reflections = await loadScreenSpaceLighting(false, true);
    expect(reflections).toMatchObject({ gi: null, denoise: null });
    expect(reflections.reflections).not.toBeNull();
  });
});
