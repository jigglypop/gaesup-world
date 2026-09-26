import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';

const mockCamera = new THREE.PerspectiveCamera();
const mockRenderer = {
  isWebGPURenderer: true,
  backend: { isWebGPUBackend: true },
};
let mockFrameCallback: ((delta?: number) => void) | null = null;
type ShadowSlot = THREE.DirectionalLightShadow & { shadowNode?: unknown };
const mockLights: THREE.DirectionalLight[] = [];
const shadowOf = (light: THREE.DirectionalLight) => light.shadow as ShadowSlot;

const mockCsmInstances: Array<{
  camera: typeof mockCamera | null;
  dispose: jest.Mock;
  fade: boolean;
  updateFrustums: jest.Mock;
  lights?: { shadow: { needsUpdate: boolean } }[];
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
  useEngineFrame: (_phase: string, callback: (delta: number) => void) => {
    mockFrameCallback = (delta = 1 / 60) => callback(delta);
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
  const light = new THREE.DirectionalLight();
  light.position.set(28, 36, 18);
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
    mockCamera.position.set(0, 5, 10);
    mockCamera.updateMatrixWorld();
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
    expect(shadowOf(mockLights[0]!).shadowNode).toBe(node);

    act(() => view.unmount());
    expect(shadowOf(mockLights[0]!).shadowNode).toBeUndefined();
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
    expect(shadowOf(mockLights[1]!).shadowNode).toBe(mockCsmInstances[1]);
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

  it('redraws the nearest cascade at its rate and the farther ones in turn', async () => {
    const view = await mountSun({ quality: 'high' });
    const node = mockCsmInstances[0]!;
    node.lights = [0, 1, 2, 3].map(() => ({ shadow: { needsUpdate: false } }));
    const redraws = [0, 0, 0, 0];
    for (let frame = 0; frame < 61; frame++) {
      mockFrameCallback!();
      node.lights.forEach(({ shadow }, index) => {
        if (shadow.needsUpdate) redraws[index]!++;
        shadow.needsUpdate = false;
      });
    }
    // The first frame redraws all four; after it the nearest runs at 30 Hz and the far ones at 15 Hz each, one a frame.
    expect(redraws[0]).toBeGreaterThanOrEqual(30);
    expect(redraws[0]).toBeLessThanOrEqual(32);
    for (const index of [1, 2, 3]) expect(redraws[index]).toBeGreaterThanOrEqual(14);
    for (const index of [1, 2, 3]) expect(redraws[index]).toBeLessThanOrEqual(17);
    act(() => view.unmount());
  });

  it('redraws every cascade when the camera jumps or the sun turns', async () => {
    const view = await mountSun({ quality: 'high', updateHz: { far: 0 } });
    const node = mockCsmInstances[0]!;
    node.lights = [0, 1, 2, 3].map(() => ({ shadow: { needsUpdate: false } }));
    const farRedraws = () => node.lights!.slice(1).filter(({ shadow }) => shadow.needsUpdate).length;
    const clear = () => node.lights!.forEach(({ shadow }) => { shadow.needsUpdate = false; });
    mockFrameCallback!();
    clear();
    mockFrameCallback!();
    expect(farRedraws()).toBe(0);

    mockCamera.position.x += 20;
    mockCamera.updateMatrixWorld();
    mockFrameCallback!();
    expect(farRedraws()).toBe(3);
    clear();

    mockLights[0]!.position.set(-30, 20, 10);
    mockFrameCallback!();
    expect(farRedraws()).toBe(3);
    act(() => view.unmount());
  });

  it('paces the single WebGL shadow map with the near rate', async () => {
    mockRenderer.backend.isWebGPUBackend = false;
    mockRenderer.isWebGPURenderer = false;
    const view = await mountSun({ updateHz: 20 });
    const light = mockLights[0]!;
    let redraws = 0;
    for (let frame = 0; frame < 61; frame++) {
      mockFrameCallback!();
      if (light.shadow.needsUpdate) redraws++;
      light.shadow.needsUpdate = false;
    }
    expect(light.shadow.autoUpdate).toBe(false);
    expect(redraws).toBeGreaterThanOrEqual(20);
    expect(redraws).toBeLessThanOrEqual(22);
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
