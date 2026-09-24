import type { ReactElement } from 'react';

import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { GaesupWorldContent } from '..';
import { useGaesupStore } from '../../../../stores/gaesupStore';
import { isProductionEnv } from '../../../../utils/env';

jest.mock('@/core/camera', () => ({ Camera: () => null }));
jest.mock('@/core/perf/PerformanceCollector', () => ({ PerformanceCollector: () => 'collector' }));
jest.mock('@/core/rendering/shadow/ShadowDepthMaterials', () => ({ ShadowDepthMaterials: () => null }));
jest.mock('@/core/rendering/postprocess/WorldPostProcessing', () => ({ WorldPostProcessing: () => null }));
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
