import { act, create, type ReactTestRenderer } from 'react-test-renderer';

const mockGl = { isWebGPURenderer: true, render: jest.fn() };
const mockScene = {};
const mockCamera = {};
const mockRgb = { add: jest.fn(() => ({})) };
const mockPass = { getTextureNode: jest.fn(() => ({ rgb: mockRgb, a: {} })), dispose: jest.fn() };
const mockBloom = { rgb: {}, dispose: jest.fn() };
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
jest.mock('three/tsl', () => ({ pass: mockCreatePass, saturation: jest.fn(), vec4: jest.fn() }));
jest.mock('three/addons/tsl/display/BloomNode.js', () => ({ bloom: mockCreateBloom }));
jest.mock('../../outline', () => ({ ToonOutlines: () => null }));
jest.mock('../ColorGrade', () => ({ ColorGrade: () => null }));

import { logger } from '../../../utils/logger';
import { WorldPostProcessing } from '../WorldPostProcessing';

describe('WorldPostProcessing ownership', () => {
  beforeEach(() => { jest.clearAllMocks(); });

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
