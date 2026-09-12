import React from 'react';
import { render } from '@testing-library/react';
import * as THREE from 'three';

import { useGaesupStore } from '../../../../stores/gaesupStore';
import { WorldConfigProvider } from '..';

describe('WorldConfigProvider', () => {
  it('reapplies the route camera after asynchronous save hydration', () => {
    const mode = { type: 'character', controller: 'keyboard', control: 'thirdPerson' } as const;
    const preset = { type: 'thirdPerson', distance: 9, height: 7, fov: 52 } as const;
    const { rerender } = render(
      <WorldConfigProvider mode={mode} cameraOption={preset} runtimeRevision={0} />,
    );
    useGaesupStore.getState().setMode({ control: 'topDown' });
    useGaesupStore.getState().setCameraOption({
      yDistance: 52, zoom: 2, focus: true, target: new THREE.Vector3(20, 0, 20),
    });
    rerender(<WorldConfigProvider mode={mode} cameraOption={preset} runtimeRevision={1} />);
    expect(useGaesupStore.getState().mode.control).toBe('thirdPerson');
    expect(useGaesupStore.getState().cameraOption).toMatchObject({ yDistance: 7, zoom: 1, focus: false });
    expect(useGaesupStore.getState().cameraOption.target).toBeUndefined();
  });

  it('replaces stale camera fields when camera presets change', () => {
    useGaesupStore.getState().setCameraOption({
      focus: true,
      target: new THREE.Vector3(1, 2, 3),
      offset: new THREE.Vector3(4, 5, 6),
      zoom: 2,
    });

    const { rerender, unmount } = render(
      <WorldConfigProvider
        mode={{ type: 'character', control: 'thirdPerson' }}
        cameraOption={{
          type: 'thirdPerson',
          distance: 13,
          height: 10,
          fov: 75,
          smoothness: 0.25,
          enableCollision: false,
        }}
      />,
    );

    rerender(
      <WorldConfigProvider
        mode={{ type: 'character', control: 'topDown' }}
        cameraOption={{
          type: 'topDown',
          distance: 34,
          height: 52,
          fov: 52,
          smoothness: 0.14,
          enableCollision: false,
          enableZoom: true,
          minZoom: 0.3,
          maxZoom: 2.8,
          zoomSpeed: 0.002,
        }}
      />,
    );

    const cameraOption = useGaesupStore.getState().cameraOption;
    expect(cameraOption.focus).toBe(false);
    expect(cameraOption.target).toBeUndefined();
    expect(cameraOption.offset).toBeUndefined();
    expect(cameraOption.xDistance).toBe(0);
    expect(cameraOption.yDistance).toBe(52);
    expect(cameraOption.zDistance).toBe(0);
    expect(cameraOption.fov).toBe(52);
    expect(cameraOption.enableZoom).toBe(true);
    expect(cameraOption.minZoom).toBe(0.3);
    expect(cameraOption.maxZoom).toBe(2.8);
    expect(cameraOption.zoomSpeed).toBe(0.002);

    unmount();
  });
});
