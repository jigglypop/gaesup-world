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
  fade: boolean;
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
  useThree: (selector: (state: { camera: object; gl: object }) => unknown) =>
    selector({ camera: mockCamera, gl: mockRenderer }),
}));

jest.mock('../../../runtime/frame', () => ({
  useEngineFrame: (_phase: string, callback: () => void) => {
    mockFrameCallback = callback;
  },
}));

jest.mock('three/addons/csm/CSMShadowNode.js', () => ({
  CSMShadowNode: mockCsmConstructor,
}));

import { logger } from '../../../utils/logger';
import { CascadedSun } from '../CascadedSun';
import { castNearShadowOnly } from '../nearShadow';

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

  it('draws near-only casters, such as grass blades, into the nearest cascade and leaves them out of the far ones', async () => {
    const seen: string[] = [];
    const grass = { castShadow: true, name: 'grass' };
    const wall = { castShadow: true, name: 'wall' };
    const cascades = [0, 1, 2].map((index) => ({
      renderShadow: () => { seen.push(`${index}: grass ${String(grass.castShadow)}, wall ${String(wall.castShadow)}`); },
    }));
    mockCsmConstructor.mockImplementationOnce(() => {
      const node = {
        camera: mockCamera, dispose: jest.fn(), fade: false, updateFrustums: jest.fn(),
        _shadowNodes: [] as typeof cascades,
        // Like three's CSMShadowNode, the cascades appear when the node first builds.
        _init() { this._shadowNodes.push(...cascades); },
      };
      mockCsmInstances.push(node);
      return node;
    });
    const release = castNearShadowOnly(grass as unknown as import('three').Object3D);
    const view = await mountSun({ quality: 'medium' });
    try {
      const node = mockCsmInstances[0] as unknown as { _init(builder: object): void; _shadowNodes: typeof cascades };
      node._init({});
      for (const cascade of node._shadowNodes) cascade.renderShadow();
      expect(seen).toEqual(['0: grass true, wall true', '1: grass false, wall true', '2: grass false, wall true']);
      expect(grass.castShadow).toBe(true);
    } finally {
      release();
      act(() => view.unmount());
    }
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
    expect(view.root.findByType('directionalLight').props['castShadow']).toBe(true);
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
