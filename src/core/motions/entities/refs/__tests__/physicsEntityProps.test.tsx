import type { ReactNode } from 'react';

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import type * as THREE from 'three';

import type { PhysicsEntityProps } from '../../types';
import { PhysicsEntity } from '../PhysicsEntity';

const mockBodies: Record<string, unknown>[] = [];
const mockColliders: Record<string, unknown>[] = [];
const mockEntityOptions: Record<string, unknown>[] = [];
const mockInterpolated: unknown[][] = [];

jest.mock('@core/animation/hooks/useSharedAnimations', () => ({
  useSharedAnimations: () => ({ actions: {}, ref: { current: null } }),
}));
jest.mock('@react-three/drei', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return { useGLTF: () => ({ scene: new three.Group(), animations: [] }) };
});
jest.mock('@react-three/fiber', () => ({ useGraph: () => ({ nodes: {}, materials: {} }) }));
jest.mock('@react-three/rapier', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return {
    CapsuleCollider: (props: Record<string, unknown>) => { mockColliders.push(props); return null; },
    RigidBody: ({ children, ...props }: { children?: ReactNode }) => { mockBodies.push(props); return children ?? null; },
    euler: () => new three.Euler(),
    useRapier: () => ({ world: {} }),
  };
});
jest.mock('@core/boilerplate/hooks/useEntity', () => ({
  useEntity: (options: Record<string, unknown>) => {
    mockEntityOptions.push(options);
    return { handleCollisionEnter: jest.fn(), handleIntersectionEnter: jest.fn(), handleIntersectionExit: jest.fn() };
  },
}));
jest.mock('../../../hooks', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return { useGltfAndSize: () => ({ size: new three.Vector3(1, 2, 1) }) };
});
jest.mock('../InnerGroupRef', () => ({ InnerGroupRef: ({ children }: { children?: ReactNode }) => children ?? null }));
jest.mock('@core/simulation/physicsContext', () => ({
  useWorldPhysicsInterpolation: (...args: unknown[]) => { mockInterpolated.push(args); return { current: null }; },
}));

const mounted: ReactTestRenderer[] = [];
afterEach(() => act(() => mounted.splice(0).forEach((renderer) => renderer.unmount())));

function mount(props: Partial<PhysicsEntityProps>) {
  let renderer!: ReactTestRenderer;
  act(() => { renderer = create(<PhysicsEntity url="/model.glb" isActive={false} componentType="character" {...props} />); });
  mounted.push(renderer);
  return {
    body: mockBodies.at(-1) ?? {},
    capsule: (mockColliders.at(-1)?.['args'] ?? []) as number[],
    scales: renderer.root.findAll((node) => node.type === 'group' && node.props['scale'] !== undefined).map((node) => node.props['scale']),
  };
}

test('an [x, y, z] rotation turns the upright body by its yaw like a Euler does', () => {
  const rotation = mount({ rotation: [0.3, 1.2, 0.4] }).body['rotation'] as THREE.Euler;
  expect([rotation.x, rotation.y, rotation.z]).toEqual([0, 1.2, 0]);
});

test('scale draws the model scaled and the derived capsule follows; an explicit colliderSize stays in world units', () => {
  const [unscaledHalfHeight = 0] = mount({}).capsule;
  const scaled = mount({ scale: 0.5 });
  expect(scaled.scales).toEqual([[0.5, 0.5, 0.5]]);
  expect(scaled.capsule[0]).toBeLessThan(unscaledHalfHeight);

  const [halfHeight, radius] = mount({ scale: [0.5, 0.5, 0.5], colliderSize: { height: 2, radius: 0.4 } }).capsule;
  expect(halfHeight).toBeCloseTo(0.6);
  expect(radius).toBe(0.4);
});

test('a fixed body is left out of per-tick interpolation; a body that moves is interpolated', () => {
  mount({});
  expect(mockInterpolated.at(-1)?.[2]).toBe(true);
  mount({ rigidbodyType: 'kinematicPosition' });
  expect(mockInterpolated.at(-1)?.[2]).toBe(false);
});

test('a position prop tells the physics bridge the body already stands where it spawns', () => {
  mount({ position: [4, 1, 4] });
  expect(mockEntityOptions.at(-1)).toMatchObject({ spawnAtBody: true });
  mount({});
  expect(mockEntityOptions.at(-1)).not.toHaveProperty('spawnAtBody');
});
