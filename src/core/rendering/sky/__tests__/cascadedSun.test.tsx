import { act, create, type ReactTestRenderer } from 'react-test-renderer';

const mockCamera = {
  projectionMatrix: { elements: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1] },
};
const mockRenderer = {
  isWebGPURenderer: true,
  backend: { isWebGPUBackend: true },
};
let mockFrameCallback: (() => void) | null = null;
const mockLights: Array<{ shadow: { radius: number; shadowNode?: unknown } }> = [];

const mockCsmInstances: Array<{
  camera: typeof mockCamera | null;
  dispose: jest.Mock;
  updateFrustums: jest.Mock;
}> = [];
const mockCsmConstructor = jest.fn().mockImplementation(() => {
  const node = {
    camera: mockCamera,
    dispose: jest.fn(),
    fade: false,
    updateFrustums: jest.fn(),
  };
  mockCsmInstances.push(node);
  return node;
});

jest.mock('@react-three/fiber', () => ({
  useFrame: (callback: () => void) => {
    mockFrameCallback = callback;
  },
  useThree: (selector: (state: { camera: object; gl: object }) => unknown) =>
    selector({ camera: mockCamera, gl: mockRenderer }),
}));

jest.mock('three/addons/csm/CSMShadowNode.js', () => ({
  CSMShadowNode: mockCsmConstructor,
}));

import { logger } from '../../../utils/logger';
import { CascadedSun } from '../CascadedSun';

function createDirectionalLight(element: { type: unknown }) {
  if (element.type !== 'directionalLight') return null;
  const light = { shadow: { radius: 1 } };
  mockLights.push(light);
  return light;
}

async function mountSun(props: React.ComponentProps<typeof CascadedSun> = {}) {
  let view: ReactTestRenderer | null = null;
  await act(async () => {
    view = create(<CascadedSun {...props} />, { createNodeMock: createDirectionalLight });
    await Promise.resolve();
  });
  return view!;
}

describe('CascadedSun', () => {
  beforeEach(() => {
    mockRenderer.isWebGPURenderer = true;
    mockRenderer.backend.isWebGPUBackend = true;
    mockCamera.projectionMatrix.elements[0] = 1;
    mockFrameCallback = null;
    mockLights.length = 0;
    mockCsmInstances.length = 0;
    mockCsmConstructor.mockClear();
  });

  it('creates and owns a quality-configured CSM node on native WebGPU', async () => {
    const view = await mountSun({ quality: 'high', maxFar: 180, fade: false });
    const node = mockCsmInstances[0]!;

    expect(mockCsmConstructor).toHaveBeenCalledWith(expect.objectContaining({ shadow: expect.any(Object) }), {
      cascades: 4,
      lightMargin: 140,
      maxFar: 180,
      mode: 'practical',
    });
    expect(node.fade).toBe(false);
    expect(mockLights[0]!.shadow.shadowNode).toBe(node);

    act(() => view.unmount());
    expect(mockLights[0]!.shadow.shadowNode).toBeUndefined();
    expect(node.dispose).toHaveBeenCalledTimes(1);
  });

  it('keeps the single directional-light fallback on a WebGL backend', async () => {
    mockRenderer.backend.isWebGPUBackend = false;
    const view = await mountSun();

    expect(mockCsmConstructor).not.toHaveBeenCalled();
    expect(view.root.findByType('directionalLight')).toBeDefined();
    act(() => view.unmount());
  });

  it('replaces the light and owned cascade node when shadow quality changes', async () => {
    const view = await mountSun({ quality: 'low' });
    const previousNode = mockCsmInstances[0]!;
    await act(async () => { view.update(<CascadedSun quality="high" />); });
    expect(previousNode.dispose).toHaveBeenCalledTimes(1);
    expect(mockLights).toHaveLength(2);
    expect(mockLights[1]!.shadow.shadowNode).toBe(mockCsmInstances[1]);
    expect(view.root.findByType('directionalLight').props.castShadow).toBe(true);
    act(() => view.unmount());
  });

  it('updates cascade frustums only after the camera projection changes', async () => {
    const view = await mountSun();
    const node = mockCsmInstances[0]!;
    const runFrame = mockFrameCallback;
    expect(runFrame).not.toBeNull();

    runFrame!();
    expect(node.updateFrustums).not.toHaveBeenCalled();

    mockCamera.projectionMatrix.elements[0] = 2;
    runFrame!();
    runFrame!();
    expect(node.updateFrustums).toHaveBeenCalledTimes(1);

    act(() => view.unmount());
  });

  it('disposes a CSM node whose async load finishes after unmount', async () => {
    let view: ReactTestRenderer;
    act(() => {
      view = create(<CascadedSun />, { createNodeMock: createDirectionalLight });
    });
    act(() => view!.unmount());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockCsmInstances).toHaveLength(1);
    expect(mockCsmInstances[0]!.dispose).toHaveBeenCalledTimes(1);
  });

  it('reports CSM initialization failures through the project logger', async () => {
    const failure = new Error('CSM constructor failed');
    mockCsmConstructor.mockImplementationOnce(() => {
      throw failure;
    });
    const logError = jest.spyOn(logger, 'error').mockImplementation(() => {});
    try {
      const view = await mountSun();
      expect(logError).toHaveBeenCalledWith('Cascaded sun shadow initialization failed', failure);
      act(() => view.unmount());
    } finally {
      logError.mockRestore();
    }
  });
});
