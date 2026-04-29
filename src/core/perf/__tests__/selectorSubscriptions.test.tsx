import React, { Profiler } from 'react';

import { act, render, renderHook } from '@testing-library/react';

import { CameraController } from '../../camera/components/CameraController';
import { useGaesupContext } from '../../hooks/useGaesupContext';
import { useGaesupStore } from '../../stores/gaesupStore';

const nextPerformanceSample = (calls: number) => ({
  render: {
    calls,
    triangles: calls * 10,
    points: 0,
    lines: 0,
  },
  engine: {
    geometries: 1,
    textures: 1,
    programs: 1,
  },
});

describe('perf selector subscriptions', () => {
  it('useGaesupContext does not rerender for unrelated performance updates', () => {
    let renders = 0;
    renderHook(() => {
      renders += 1;
      return useGaesupContext();
    });
    const initialRenders = renders;

    act(() => {
      useGaesupStore.getState().setPerformance(nextPerformanceSample(11));
    });

    expect(renders).toBe(initialRenders);
  });

  it('CameraController ignores unrelated performance store updates', () => {
    let commits = 0;
    render(
      <Profiler id="camera-controller" onRender={() => { commits += 1; }}>
        <CameraController />
      </Profiler>,
    );
    const initialCommits = commits;

    act(() => {
      useGaesupStore.getState().setPerformance(nextPerformanceSample(22));
    });

    expect(commits).toBe(initialCommits);
  });
});
