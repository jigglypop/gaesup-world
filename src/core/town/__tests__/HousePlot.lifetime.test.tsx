import { act, StrictMode } from 'react';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import { BoxGeometry, Mesh, PlaneGeometry } from 'three';
import type { BufferGeometry, Object3D } from 'three';

import { HousePlot } from '../components/HousePlot';
import { useTownStore } from '../stores/townStore';

function geometryOf<TGeometry extends BufferGeometry>(
  instance: Object3D,
  Geometry: new (...args: never[]) => TGeometry,
): TGeometry {
  if (!(instance instanceof Mesh) || !(instance.geometry instanceof Geometry)) {
    throw new Error(`Expected a mesh with ${Geometry.name}`);
  }
  return instance.geometry;
}

beforeEach(() => {
  useTownStore.setState({ houses: {}, residents: {}, decorationScore: 0 });
});

test.each(['reserved', 'occupied'] as const)('preserves %s houses through updates and remounts', async (state) => {
  const view = await ReactThreeTestRenderer.create(<StrictMode><HousePlot id="home" position={[0, 0, 0]} /></StrictMode>);
  try {
    await act(async () => {
      const town = useTownStore.getState();
      town.registerResident({ id: 'resident', name: 'Resident' });
      if (state === 'reserved') town.reserveHouse('home', 'resident', 5);
      else town.moveIn('home', 'resident', 2);
    });
    const house = useTownStore.getState().houses['home'];
    expect(house?.state).toBe(state);
    await view.update(<StrictMode><HousePlot id="home" position={[20, 0, 20]} size={[8, 9]} /></StrictMode>);
    expect(useTownStore.getState().houses['home']).toBe(house);
    expect(view.scene.findByType('Group').instance.position.toArray()).toEqual([0, 0, 0]);
    await view.update(<></>);
    expect(useTownStore.getState().serialize().houses[0]).toEqual(house);
    await view.update(<HousePlot id="home" position={[30, 0, 30]} />);
    expect(useTownStore.getState().houses['home']).toBe(house);
    await act(async () => { useTownStore.getState().unregisterHouse('home'); });
    expect(useTownStore.getState().houses['home']).toBeUndefined();
    expect(view.scene.children).toHaveLength(0);
  } finally {
    await view.unmount();
  }
});

test('loaded coordinates and dimensions drive the rendered house and survive moving out', async () => {
  const view = await ReactThreeTestRenderer.create(<HousePlot id="loaded" position={[0, 0, 0]} />);
  try {
    await act(async () => {
      useTownStore.getState().hydrate({ version: 1,
        houses: [{ id: 'loaded', position: [10, 2, 15], size: [8, 6], state: 'occupied', residentId: 'r' }],
        residents: [{ id: 'r', name: 'Resident' }],
      });
    });
    expect(view.scene.findByType('Group').instance.position.toArray()).toEqual([10, 2, 15]);
    expect(geometryOf(view.scene.findAllByType('Mesh')[0]!.instance, PlaneGeometry).parameters).toMatchObject({ width: 8, height: 6 });
    expect(geometryOf(view.scene.findAllByType('Mesh')[1]!.instance, BoxGeometry).parameters.width).toBeCloseTo(4.8);
    expect(geometryOf(view.scene.findAllByType('Mesh')[1]!.instance, BoxGeometry).parameters.depth).toBeCloseTo(3.6);
    await act(async () => { expect(useTownStore.getState().moveOut('loaded')).toBe(true); });
    expect(useTownStore.getState().serialize().houses[0]).toEqual({ id: 'loaded', position: [10, 2, 15], size: [8, 6], state: 'empty' });
    expect(geometryOf(view.scene.findByType('Mesh').instance, PlaneGeometry).parameters).toMatchObject({ width: 8, height: 6 });
  } finally {
    await view.unmount();
  }
});
