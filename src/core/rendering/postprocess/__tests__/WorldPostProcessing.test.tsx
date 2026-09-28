import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { BoxGeometry, Mesh, MeshBasicMaterial, OrthographicCamera, PerspectiveCamera, Scene } from 'three';
import type { Camera } from 'three';

const mockGl = { isWebGPURenderer: true, render: jest.fn() };
const mockScene = new Scene();
const mockCamera = new PerspectiveCamera();
const mockRgb: { add: jest.Mock; mul: jest.Mock } = { add: jest.fn(() => ({})), mul: jest.fn(() => mockRgb) };
const mockPass = { options: {}, renderTarget: {}, setMRT: jest.fn(), getMRT: jest.fn(() => null), getTextureNode: jest.fn(() => ({ rgb: mockRgb, a: {} })), dispose: jest.fn() };
const mockTemporal = { setSize: jest.fn(), getTextureNode: jest.fn(() => ({ rgb: mockRgb, a: {} })), dispose: jest.fn(), _previousDepthNode: { value: { dispose: jest.fn() } } };
const mockAo = { radius: { value: 0 }, samples: { value: 0 }, resolutionScale: 1, getTextureNode: jest.fn(() => ({ r: {} })), dispose: jest.fn(), _noiseNode: { value: { dispose: jest.fn() } } };
const mockCreateTemporal = jest.fn(() => mockTemporal);
const mockCreateAo = jest.fn(() => mockAo);
const mockBloom = { rgb: {}, strength: { value: 0 }, radius: { value: 0 }, threshold: { value: 0 }, dispose: jest.fn() };
const mockUniform = jest.fn((value: number) => ({ value }));
const mockPipeline = { outputNode: {}, render: jest.fn(), dispose: jest.fn() };
const mockCreatePipeline = jest.fn(() => mockPipeline);
const mockCreateBloom = jest.fn(() => mockBloom);
const mockCreatePass = jest.fn(() => mockPass);
const mockMrt = jest.fn();
const mockLighting = { color: { rgb: mockRgb, a: {} }, update: jest.fn(), dispose: jest.fn() };
const mockLightingModules = { gi: {}, reflections: {}, denoise: {} };
const mockSurfaceOutputs = { normal: { output: 'normal' }, surface: { output: 'surface' } };
const mockLoadLighting = jest.fn<Promise<typeof mockLightingModules>, [boolean, boolean]>(() => Promise.resolve(mockLightingModules));
const mockCreateLighting = jest.fn<typeof mockLighting, unknown[]>(() => mockLighting);
let mockActiveCamera: Camera | null = null;
let mockFrame: () => void;
let mockPriority: number | undefined;

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: object) => unknown) => selector({ gl: mockGl, scene: mockScene, camera: mockActiveCamera ?? mockCamera }),
  useFrame: (callback: () => void, priority?: number) => { mockFrame = callback; mockPriority = priority; },
}));
jest.mock('three/webgpu', () => ({ RenderPipeline: mockCreatePipeline }));
jest.mock('three/tsl', () => ({ pass: mockCreatePass, uniform: mockUniform, saturation: jest.fn(), vec4: jest.fn(), mrt: mockMrt, output: {}, velocity: {}, normalView: {} }));
jest.mock('three/addons/tsl/display/BloomNode.js', () => ({ bloom: mockCreateBloom }));
jest.mock('three/addons/tsl/display/TRAANode.js', () => ({ traa: mockCreateTemporal }));
jest.mock('three/addons/tsl/display/GTAONode.js', () => ({ ao: mockCreateAo }));
jest.mock('../../outline', () => ({ ToonOutlines: () => null }));
jest.mock('../ColorGrade', () => ({ ColorGrade: () => null }));
jest.mock('../screenSpaceLighting', () => ({
  ...jest.requireActual('../screenSpaceLighting'),
  loadScreenSpaceLighting: mockLoadLighting,
  createScreenSpaceLighting: mockCreateLighting,
  surfaceOutputs: () => mockSurfaceOutputs,
}));

import { logger } from '../../../utils/logger';
import { invalidateRenderHistory } from '../../renderHistory';
import { WorldPostProcessing } from '../WorldPostProcessing';

describe('WorldPostProcessing ownership', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('owns temporal/AO targets and restores camera jitter after rendering', async () => {
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing />); });
    expect(mockPass.options).toEqual({ samples: 0 });
    expect(mockAo.samples.value).toBe(8);
    expect(mockAo.resolutionScale).toBe(0.5);
    const projection = mockCamera.projectionMatrix.clone();
    mockPipeline.render.mockImplementationOnce(() => { mockCamera.setViewOffset(100, 100, 1, 1, 100, 100); });
    mockFrame();
    expect(mockCamera.projectionMatrix.equals(projection)).toBe(true);
    expect(mockCamera.view).toBeNull();
    mockCamera.position.x += 10;
    mockFrame();
    expect(mockTemporal.setSize).toHaveBeenCalledWith(1, 1);
    mockTemporal.setSize.mockClear();
    invalidateRenderHistory(mockScene);
    mockFrame();
    expect(mockTemporal.setSize).toHaveBeenCalledWith(1, 1);
    act(() => view!.unmount());
    expect(mockTemporal.dispose).toHaveBeenCalledTimes(1);
    expect(mockAo.dispose).toHaveBeenCalledTimes(1);
    expect(mockTemporal._previousDepthNode.value.dispose).toHaveBeenCalledTimes(1);
    expect(mockAo._noiseNode.value.dispose).toHaveBeenCalledTimes(1);
  });

  it('omits temporal/AO work in performance mode and resets explicit world history', async () => {
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="performance" />); });
    expect(mockCreateTemporal).not.toHaveBeenCalled();
    expect(mockCreateAo).not.toHaveBeenCalled();
    await act(async () => { view!.update(<WorldPostProcessing quality="quality" />); });
    expect(mockAo.samples.value).toBe(16);
    expect(mockAo.resolutionScale).toBe(1);
    mockTemporal.setSize.mockClear();
    await act(async () => { view!.update(<WorldPostProcessing quality="quality" historyVersion={1} />); });
    expect(mockTemporal.setSize).toHaveBeenCalledWith(1, 1);
    act(() => view!.unmount());
  });

  it('renders the scene while loading, takes over one frame render, then releases all targets', async () => {
    let view: ReactTestRenderer;
    act(() => { view = create(<WorldPostProcessing />); });
    mockFrame();
    expect(mockPriority).toBe(1);
    expect(mockGl.render).toHaveBeenCalledWith(mockScene, mockCamera);
    await act(async () => { await Promise.resolve(); });
    mockGl.render.mockClear();
    mockFrame();
    expect(mockPipeline.render).toHaveBeenCalledTimes(1);
    expect(mockGl.render).not.toHaveBeenCalled();
    act(() => view!.unmount());
    expect(mockPipeline.dispose).toHaveBeenCalledTimes(1);
    expect(mockBloom.dispose).toHaveBeenCalledTimes(1);
    expect(mockPass.dispose).toHaveBeenCalledTimes(1);
  });

  it('takes over drawing once the scene is compiled for its pass, and draws the scene directly until then', async () => {
    let finish!: () => void;
    Object.assign(mockGl, { compileAsync: jest.fn(() => new Promise<void>((resolve) => { finish = resolve; })) });
    // The scene compiles a drawable at a time, each on a later task.
    const tasks = () => act(async () => { for (let i = 0; i < 3; i++) await new Promise((resolve) => setTimeout(resolve, 0)); });
    const content = new Mesh(new BoxGeometry(), new MeshBasicMaterial());
    mockScene.add(content);
    let view: ReactTestRenderer;
    try {
      await act(async () => { view = create(<WorldPostProcessing />); });
      await tasks();
      mockFrame();
      expect(mockGl.render).toHaveBeenCalledWith(mockScene, mockCamera);
      expect(mockPipeline.render).not.toHaveBeenCalled();
      finish();
      await tasks();
      mockGl.render.mockClear();
      mockFrame();
      expect(mockPipeline.render).toHaveBeenCalledTimes(1);
      expect(mockGl.render).not.toHaveBeenCalled();
    } finally {
      act(() => view!.unmount());
      mockScene.remove(content);
      delete (mockGl as { compileAsync?: unknown }).compileAsync;
    }
  });

  it('does not allocate targets when unmounted before lazy imports finish', async () => {
    let view: ReactTestRenderer;
    act(() => { view = create(<WorldPostProcessing />); });
    act(() => view!.unmount());
    await act(async () => { await Promise.resolve(); });
    expect(mockCreatePass).not.toHaveBeenCalled();
    expect(mockCreatePipeline).not.toHaveBeenCalled();
  });

  it('updates numeric effect controls without rebuilding or disposing the render pipeline', async () => {
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing />); });
    await act(async () => {
      view!.update(<WorldPostProcessing quality="quality" aoRadius={3} bloomStrength={0.7} bloomRadius={0.2} bloomThreshold={0.9} saturation={1.4} />);
    });
    expect(mockCreatePipeline).toHaveBeenCalledTimes(1);
    expect(mockCreateBloom).toHaveBeenCalledTimes(1);
    expect(mockPipeline.dispose).not.toHaveBeenCalled();
    expect(mockPass.dispose).not.toHaveBeenCalled();
    expect(mockBloom.strength.value).toBe(0.7);
    expect(mockBloom.radius.value).toBe(0.2);
    expect(mockBloom.threshold.value).toBe(0.9);
    expect(mockUniform.mock.results[0]?.value.value).toBe(1.4);
    expect(mockAo.radius.value).toBe(3);
    expect(mockAo.samples.value).toBe(16);
    expect(mockAo.resolutionScale).toBe(1);
    expect(mockCreateAo).toHaveBeenCalledTimes(1);
    expect(mockCreateTemporal).toHaveBeenCalledTimes(1);
    act(() => view!.unmount());
    expect(mockPipeline.dispose).toHaveBeenCalledTimes(1);
  });

  it('cleans up partially allocated targets after initialization fails', async () => {
    const error = new Error('pipeline allocation failed');
    mockCreatePipeline.mockImplementationOnce(() => { throw error; });
    const log = jest.spyOn(logger, 'error').mockImplementation(() => {});
    let view: ReactTestRenderer;
    try {
      await act(async () => { view = create(<WorldPostProcessing />); });
      expect(log).toHaveBeenCalledWith('WebGPU postprocessing initialization failed', error);
      expect(mockBloom.dispose).toHaveBeenCalledTimes(1);
      expect(mockPass.dispose).toHaveBeenCalledTimes(1);
      mockFrame();
      expect(mockGl.render).toHaveBeenCalledWith(mockScene, mockCamera);
      act(() => view!.unmount());
      expect(mockPass.dispose).toHaveBeenCalledTimes(1);
    } finally { log.mockRestore(); }
  });
});

/** The first argument of a mock's first call. */
const firstArgument = (mock: jest.Mock) => (mock.mock.calls[0] as unknown[] | undefined)?.[0];

describe('WorldPostProcessing screen-space lighting', () => {
  /** A WebGPU device that can render to the formats in `features`. */
  const useDevice = (features = ['rg11b10ufloat-renderable']) =>
    Object.assign(mockGl, { backend: { isWebGPUBackend: true }, hasFeature: jest.fn((name: string) => features.includes(name)) });
  const settle = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

  beforeEach(() => { jest.clearAllMocks(); });
  afterEach(() => {
    delete (mockGl as { backend?: unknown }).backend;
    delete (mockGl as { hasFeature?: unknown }).hasFeature;
    mockActiveCamera = null;
  });

  it('cinematic replaces GTAO with GI, adds reflections, and hands the lit colour to TRAA and bloom', async () => {
    useDevice();
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="cinematic" />); });
    await settle();
    expect(mockLoadLighting).toHaveBeenCalledWith(true, true);
    expect(mockCreateAo).not.toHaveBeenCalled();
    expect(mockMrt).toHaveBeenCalledWith(expect.objectContaining(mockSurfaceOutputs));
    expect(mockCreateLighting).toHaveBeenCalledWith(expect.anything(), mockLightingModules, mockPass, mockCamera, true);
    expect(firstArgument(mockCreateTemporal)).toBe(mockLighting.color);
    expect(firstArgument(mockCreateBloom)).toBe(mockTemporal.getTextureNode.mock.results[0]?.value);
    expect(mockLighting.update).toHaveBeenLastCalledWith(expect.objectContaining({
      giRadius: 4, giSteps: 8, giIntensity: 8, giResolutionScale: 0.5,
      reflectionDistance: 8, reflectionQuality: 0.5, reflectionIntensity: 1, reflectionResolutionScale: 0.5, reflectionMaxRoughness: 0.5,
    }));
    act(() => view!.unmount());
    expect(mockLighting.dispose).toHaveBeenCalledTimes(1);
    expect(mockPipeline.dispose).toHaveBeenCalledTimes(1);
    expect(mockPass.dispose).toHaveBeenCalledTimes(1);
  });

  it('moves GI and reflection controls without rebuilding, and resets TRAA history on request', async () => {
    useDevice();
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="cinematic" />); });
    await settle();
    mockTemporal.setSize.mockClear();
    await act(async () => {
      view!.update(
        <WorldPostProcessing
          quality="cinematic"
          giRadius={2}
          giSteps={12}
          giIntensity={3}
          giResolutionScale={1}
          reflectionDistance={20}
          reflectionQuality={0.8}
          reflectionIntensity={0.5}
          reflectionResolutionScale={1}
          reflectionMaxRoughness={0.3}
          historyVersion={1}
        />,
      );
    });
    expect(mockLighting.update).toHaveBeenLastCalledWith(expect.objectContaining({
      giRadius: 2, giSteps: 12, giIntensity: 3, giResolutionScale: 1,
      reflectionDistance: 20, reflectionQuality: 0.8, reflectionIntensity: 0.5, reflectionResolutionScale: 1, reflectionMaxRoughness: 0.3,
    }));
    expect(mockTemporal.setSize).toHaveBeenCalledWith(1, 1);
    expect(mockCreatePipeline).toHaveBeenCalledTimes(1);
    expect(mockCreateLighting).toHaveBeenCalledTimes(1);
    expect(mockLighting.dispose).not.toHaveBeenCalled();
    act(() => view!.unmount());
  });

  it('keeps the existing presets free of screen-space lighting', async () => {
    useDevice();
    for (const quality of ['performance', 'balanced', 'quality'] as const) {
      let view: ReactTestRenderer;
      await act(async () => { view = create(<WorldPostProcessing quality={quality} />); });
      await settle();
      act(() => view!.unmount());
    }
    expect(mockLoadLighting).not.toHaveBeenCalled();
    expect(mockCreateLighting).not.toHaveBeenCalled();
    expect(mockMrt).not.toHaveBeenCalledWith(expect.objectContaining({ surface: expect.anything() }));
  });

  it('renders cinematic as quality where GI and reflections cannot run', async () => {
    // Without a WebGPU device (the WebGL2 backend of WebGPURenderer).
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="cinematic" />); });
    await settle();
    expect(mockLoadLighting).not.toHaveBeenCalled();
    expect(mockCreateAo).toHaveBeenCalledTimes(1);
    expect(mockAo.samples.value).toBe(16);
    expect(mockAo.resolutionScale).toBe(1);
    expect(firstArgument(mockCreateTemporal)).toBe(mockPass.getTextureNode.mock.results[0]?.value);
    act(() => view!.unmount());
  });

  it('keeps GTAO and reflections on a device without RG11B10 targets, and GI off for orthographic cameras', async () => {
    useDevice([]);
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="cinematic" />); });
    await settle();
    expect(mockLoadLighting).toHaveBeenLastCalledWith(false, true);
    expect(mockCreateAo).toHaveBeenCalledTimes(1);
    act(() => view!.unmount());

    useDevice();
    mockActiveCamera = new OrthographicCamera();
    await act(async () => { view = create(<WorldPostProcessing quality="cinematic" />); });
    await settle();
    expect(mockLoadLighting).toHaveBeenLastCalledWith(false, true);
    act(() => view!.unmount());
  });

  it('lets any preset opt into GI, filtered without TRAA when antialiasing is off', async () => {
    useDevice();
    let view: ReactTestRenderer;
    await act(async () => { view = create(<WorldPostProcessing quality="performance" globalIllumination />); });
    await settle();
    expect(mockLoadLighting).toHaveBeenCalledWith(true, false);
    expect(mockCreateLighting).toHaveBeenCalledWith(expect.anything(), mockLightingModules, mockPass, mockCamera, false);
    expect(mockCreateTemporal).not.toHaveBeenCalled();
    act(() => view!.unmount());
  });
});
