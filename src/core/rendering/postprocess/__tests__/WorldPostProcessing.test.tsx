import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { PerspectiveCamera, Scene } from 'three';

const mockGl = { isWebGPURenderer: true, render: jest.fn() };
const mockScene = new Scene();
const mockCamera = new PerspectiveCamera();
const mockRgb: { add: jest.Mock; mul: jest.Mock } = { add: jest.fn(() => ({})), mul: jest.fn(() => mockRgb) };
const mockPass = { options: {}, setMRT: jest.fn(), getTextureNode: jest.fn(() => ({ rgb: mockRgb, a: {} })), dispose: jest.fn() };
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
let mockFrame: () => void;
let mockPriority: number | undefined;

jest.mock('@react-three/fiber', () => ({
  useThree: (selector: (state: object) => unknown) => selector({ gl: mockGl, scene: mockScene, camera: mockCamera }),
  useFrame: (callback: () => void, priority?: number) => { mockFrame = callback; mockPriority = priority; },
}));
jest.mock('three/webgpu', () => ({ RenderPipeline: mockCreatePipeline }));
jest.mock('three/tsl', () => ({ pass: mockCreatePass, uniform: mockUniform, saturation: jest.fn(), vec4: jest.fn(), mrt: jest.fn(), output: {}, velocity: {}, normalView: {} }));
jest.mock('three/addons/tsl/display/BloomNode.js', () => ({ bloom: mockCreateBloom }));
jest.mock('three/addons/tsl/display/TRAANode.js', () => ({ traa: mockCreateTemporal }));
jest.mock('three/addons/tsl/display/GTAONode.js', () => ({ ao: mockCreateAo }));
jest.mock('../../outline', () => ({ ToonOutlines: () => null }));
jest.mock('../ColorGrade', () => ({ ColorGrade: () => null }));

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
