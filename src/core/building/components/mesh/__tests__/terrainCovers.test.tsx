import React from 'react';
import ReactThreeTestRenderer from '@react-three/test-renderer';

import { SandBatch } from '../sand';
import { SnowfieldBatch } from '../snowfield';

describe('terrain cover batches', () => {
  it('renders an exterior skirt for sand tile edges', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <SandBatch entries={[{ position: [0, 0, 0], size: 4 }]} />,
    );

    expect(renderer.scene.findByProps({ name: 'sand-surface' })).toBeDefined();
    const skirt = renderer.scene.findByProps({ name: 'sand-skirt' });
    expect(skirt).toBeDefined();
    expect(skirt.instance.raycast).toBeDefined();
    expect(skirt.instance.userData.nonInteractive).toBe(true);

    renderer.unmount();
  });

  it('renders an exterior skirt for snowfield tile edges', async () => {
    const renderer = await ReactThreeTestRenderer.create(
      <SnowfieldBatch entries={[{ position: [0, 0, 0], size: 4 }]} />,
    );

    expect(renderer.scene.findByProps({ name: 'snowfield-surface' })).toBeDefined();
    const skirt = renderer.scene.findByProps({ name: 'snowfield-skirt' });
    expect(skirt).toBeDefined();
    expect(skirt.instance.raycast).toBeDefined();
    expect(skirt.instance.userData.nonInteractive).toBe(true);

    renderer.unmount();
  });
});
