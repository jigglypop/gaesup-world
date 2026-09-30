import type { ReactElement, ReactNode } from 'react';

import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { GaesupWorldContent } from '..';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { isProductionEnv } from '../../../../utils/env';

jest.mock('@/core/camera', () => ({ Camera: () => null }));
jest.mock('@/core/perf/PerformanceCollector', () => ({ PerformanceCollector: () => 'collector' }));
jest.mock('@/core/rendering/shadow/ShadowDepthMaterials', () => ({ ShadowDepthMaterials: () => null }));
jest.mock('@/core/rendering/CompileGate', () => ({ CompileGate: ({ children }: { children: ReactNode }) => children }));
const mockPostProcessing = jest.fn();
jest.mock('@/core/rendering/postprocess/WorldPostProcessing', () => ({
  WorldPostProcessing: (props: object) => {
    mockPostProcessing(props);
    return null;
  },
}));
// A quality profile sizes the canvas; these tests have no canvas, only its state.
jest.mock('@react-three/fiber', () => ({
  ...jest.requireActual('@react-three/fiber'),
  useThree: (selector: (state: object) => unknown) => selector({ viewport: { dpr: 1 }, setDpr: () => undefined, gl: {} }),
}));
jest.mock('@/core/runtime/frame/react/FrameSchedulerHost', () => ({ FrameSchedulerHost: () => null }));
jest.mock('@/core/utils/env', () => ({ ...jest.requireActual('@/core/utils/env'), isProductionEnv: jest.fn(() => true) }));

const productionEnv = jest.mocked(isProductionEnv);

function render(element: ReactElement): ReactTestRenderer {
  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(element);
  });
  return renderer!;
}

const hasCollector = (renderer: ReactTestRenderer) => JSON.stringify(renderer.toJSON())?.includes('collector') ?? false;

describe('GaesupWorldContent performance sampling', () => {
  afterEach(() => productionEnv.mockReturnValue(true));

  it('does not sample renderer stats in production unless requested', () => {
    const renderer = render(<GaesupWorldContent />);
    expect(hasCollector(renderer)).toBe(false);

    let release = () => {};
    act(() => {
      release = useGaesupStore.getState().retainPerformanceSampling();
    });
    expect(hasCollector(renderer)).toBe(true);

    act(() => release());
    expect(hasCollector(renderer)).toBe(false);
    act(() => renderer.unmount());
  });

  it('samples when forced on or outside production', () => {
    const forced = render(<GaesupWorldContent performance />);
    expect(hasCollector(forced)).toBe(true);
    act(() => forced.unmount());

    productionEnv.mockReturnValue(false);
    const development = render(<GaesupWorldContent />);
    expect(hasCollector(development)).toBe(true);
    act(() => development.unmount());
  });
});

describe('GaesupWorldContent post-processing presets', () => {
  beforeEach(() => mockPostProcessing.mockClear());

  async function presetFor(element: ReactElement): Promise<unknown> {
    let renderer: ReactTestRenderer | undefined;
    await act(async () => {
      renderer = create(element);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const props = mockPostProcessing.mock.calls.at(-1)?.[0] as { quality?: string } | undefined;
    act(() => renderer!.unmount());
    return props ? props.quality : 'not mounted';
  }

  it('picks the preset from the tier, or the one the app asked for', async () => {
    expect(await presetFor(<GaesupWorldContent quality="high" postProcessing />)).toBe('quality');
    expect(await presetFor(<GaesupWorldContent quality="high" postProcessing={{ quality: 'cinematic' }} />)).toBe('cinematic');
    expect(await presetFor(<GaesupWorldContent postProcessing={{ quality: 'cinematic', giRadius: 3 }} />)).toBe('cinematic');
    expect(mockPostProcessing).toHaveBeenLastCalledWith(expect.objectContaining({ giRadius: 3 }));
  });

  it('keeps post-processing off on tiers without it, even when cinematic is asked for', async () => {
    expect(await presetFor(<GaesupWorldContent quality="low" postProcessing={{ quality: 'cinematic' }} />)).toBe('not mounted');
  });
});
