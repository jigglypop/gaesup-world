import { render } from '@testing-library/react';
import * as THREE from 'three';

import Ocean from '../mesh/water';

jest.mock('@react-three/fiber', () => ({ extend: jest.fn(), useFrame: jest.fn(), useThree: () => false }));
jest.mock('three', () => {
  const actual = jest.requireActual<typeof import('three')>('three');
  return {
    ...actual,
    DataTexture: jest.fn((...args: ConstructorParameters<typeof actual.DataTexture>) => new actual.DataTexture(...args)),
  };
});

test('toon water skips procedural normals; reflective water creates and shares them on demand', () => {
  const view = render(<Ocean toon />);
  expect(THREE.DataTexture).not.toHaveBeenCalled();
  view.rerender(<Ocean toon={false} />);
  expect(THREE.DataTexture).toHaveBeenCalledTimes(1);
  const texture = jest.mocked(THREE.DataTexture).mock.results[0]!.value as THREE.DataTexture;
  expect(texture.image.width).toBe(128);
  expect(texture.image.height).toBe(128);
  view.rerender(<><Ocean toon={false} /><Ocean toon={false} /></>);
  expect(THREE.DataTexture).toHaveBeenCalledTimes(1);
  view.unmount();
});
