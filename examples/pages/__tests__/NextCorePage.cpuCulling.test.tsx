import type { ReactNode } from 'react';

import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import * as THREE from 'three';

import { cullSpheres } from 'gaesup-world/next';

import { NextCorePage } from '../NextCorePage';

jest.mock('@react-three/drei', () => ({ OrbitControls: jest.fn(() => null) }));
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: ReactNode }) => children,
  useFrame: jest.fn(),
}));
jest.mock('gaesup-world', () => ({ logger: { error: jest.fn() } }));
jest.mock('gaesup-world/next', () => {
  const actual = jest.requireActual<typeof import('gaesup-world/next')>('gaesup-world/next');
  return { ...actual, cullSpheres: jest.fn(actual.cullSpheres) };
});

test('remounting the benchmark reproduces the same object positions', () => {
  const createElement = document.createElement.bind(document);
  const spy = jest.spyOn(document, 'createElement').mockImplementation((tag, options) => {
    const element = createElement(tag, options);
    if (tag.toLowerCase() === 'instancedmesh') {
      Object.assign(element, { instanceMatrix: new THREE.InstancedBufferAttribute(new Float32Array(10000 * 16), 16) });
    }
    return element;
  });
  const sample = () => {
    const view = render(<MemoryRouter><NextCorePage /></MemoryRouter>);
    try {
      const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
      const camera = new THREE.PerspectiveCamera(60, 1.7, 0.1, 1000);
      camera.position.set(0, 24, 70);
      camera.lookAt(0, 0, 0);
      camera.updateMatrixWorld();
      act(() => frame({ camera } as Parameters<typeof frame>[0], 1 / 60));
      return new Float32Array(jest.mocked(cullSpheres).mock.calls.at(-1)![1]);
    } finally {
      view.unmount();
    }
  };
  try {
    const first = sample();
    const second = sample();
    expect(first.length).toBe(30000);
    expect(first.some(value => value !== 0)).toBe(true);
    expect(second.every((value, index) => value === first[index])).toBe(true);
  } finally {
    spy.mockRestore();
  }
});

test('an unchanged fractional camera matrix skips culling and GPU uploads', () => {
  jest.clearAllMocks();
  const instanceMatrix = new THREE.InstancedBufferAttribute(new Float32Array(10000 * 16), 16);
  const createElement = document.createElement.bind(document);
  const createElementSpy = jest
    .spyOn(document, 'createElement')
    .mockImplementation((tag, options) => {
      const element = createElement(tag, options);
      if (tag.toLowerCase() === 'instancedmesh') Object.assign(element, { instanceMatrix });
      return element;
    });
  const view = render(
    <MemoryRouter>
      <NextCorePage />
    </MemoryRouter>,
  );
  createElementSpy.mockRestore();
  const instance = view.container.querySelector('instancedMesh');
  if (!instance) throw new Error('Missing instance mesh');
  const callback = jest.mocked(useFrame).mock.calls[0]?.[0];
  if (!callback) throw new Error('Missing frame callback');
  const camera = new THREE.PerspectiveCamera(60, 1.7, 0.1, 1000);
  camera.position.set(0.1, 24.3, 70.2);
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld();
  const state = { camera } as Parameters<typeof callback>[0];
  try {
    act(() => {
      for (let frame = 0; frame < 120; frame++) callback(state, 1 / 60);
    });
    expect(cullSpheres).toHaveBeenCalledTimes(1);
    expect(instanceMatrix.version).toBe(1);
    const rotation = view.getByRole('checkbox', { name: '카메라 자동 회전' });
    for (const enabled of [false, true]) {
      fireEvent.click(rotation);
      expect(jest.mocked(OrbitControls).mock.calls.at(-1)?.[0].autoRotate).toBe(enabled);
      expect(view.container.querySelector('instancedMesh')).toBe(instance);
      const latestCallback = jest.mocked(useFrame).mock.calls.at(-1)?.[0];
      if (!latestCallback) throw new Error('Missing updated frame callback');
      act(() => latestCallback(state, 1 / 60));
      expect(cullSpheres).toHaveBeenCalledTimes(1);
      expect(instanceMatrix.version).toBe(1);
    }
    camera.position.x += 1;
    camera.updateMatrixWorld();
    act(() => callback(state, 1 / 60));
    expect(cullSpheres).toHaveBeenCalledTimes(2);
    expect(instanceMatrix.version).toBe(2);
  } finally {
    view.unmount();
  }
});
