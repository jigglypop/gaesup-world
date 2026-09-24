import type { ReactElement } from 'react';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import type * as THREE from 'three';

import { FrameSchedulerHost } from '../../runtime/frame';
import { TeleportDropEffect } from '../components/TeleportDropEffect';

type Position = { x: number; y: number; z: number };
type View = Awaited<ReturnType<typeof ReactThreeTestRenderer.create>>;

let now = 0;
const act = ReactThreeTestRenderer.act;
const mount = (element: ReactElement) => ReactThreeTestRenderer.create(<><FrameSchedulerHost />{element}</>);
const effects = (view: View) => view.scene.children;
const positionOf = (view: View, index: number) => (effects(view)[index]!.instance as THREE.Group).position.toArray();

function teleport(position: Position, effect?: { id: string; durationMs?: number }, target: EventTarget = window, type = 'gaesup:teleport') {
  target.dispatchEvent(new CustomEvent(type, { detail: effect ? { position, effect } : { position } }));
}

async function frame(view: View): Promise<void> {
  await act(async () => {
    await view.advanceFrames(1, 1 / 60);
  });
}

beforeEach(() => {
  now = 1000;
  jest.spyOn(performance, 'now').mockImplementation(() => now);
});

describe('TeleportDropEffect', () => {
  test('a teleport with an effect draws a ring, a beam and the particles at the destination', async () => {
    const view = await mount(<TeleportDropEffect particleCount={4} />);
    await act(async () => teleport({ x: 1, y: 2, z: 3 }, { id: 'a' }));

    expect(effects(view)).toHaveLength(1);
    expect(positionOf(view, 0)).toEqual([1, 2, 3]);
    expect(effects(view)[0]!.findAllByType('Mesh')).toHaveLength(2 + 4);
    await view.unmount();
  });

  test('a plain teleport draws nothing; the document teleport-request event is also honored', async () => {
    const view = await mount(<TeleportDropEffect />);
    await act(async () => teleport({ x: 0, y: 0, z: 0 }));
    expect(effects(view)).toHaveLength(0);

    await act(async () => teleport({ x: 5, y: 0, z: 0 }, { id: 'b' }, document, 'teleport-request'));
    expect(positionOf(view, 0)).toEqual([5, 0, 0]);
    await view.unmount();
  });

  test('keeps only the latest maxEffects effects', async () => {
    const view = await mount(<TeleportDropEffect maxEffects={2} particleCount={1} />);
    await act(async () => {
      for (const x of [1, 2, 3]) teleport({ x, y: 0, z: 0 }, { id: `e${x}` });
    });

    expect(effects(view).map((_, index) => positionOf(view, index)[0])).toEqual([2, 3]);
    await view.unmount();
  });

  test('the ring expands while the effect plays and the effect removes itself when it ends', async () => {
    const view = await mount(<TeleportDropEffect particleCount={1} />);
    await act(async () => teleport({ x: 0, y: 0, z: 0 }, { id: 'c', durationMs: 500 }));
    const ring = () => effects(view)[0]!.findAllByType('Mesh')[0]!.instance as THREE.Mesh;

    await frame(view);
    const startScale = ring().scale.x;
    now += 250;
    await frame(view);
    expect(ring().scale.x).toBeGreaterThan(startScale);

    now += 250;
    await frame(view);
    expect(effects(view)).toHaveLength(0);
    await view.unmount();
  });

  test('ignores teleports while disabled', async () => {
    const view = await mount(<TeleportDropEffect enabled={false} />);
    await act(async () => teleport({ x: 0, y: 0, z: 0 }, { id: 'd' }));
    expect(effects(view)).toHaveLength(0);
    await view.unmount();
  });
});
