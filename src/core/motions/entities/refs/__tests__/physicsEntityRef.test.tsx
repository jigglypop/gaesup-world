import { createRef, StrictMode, type ReactNode, type Ref } from 'react';

import type { RapierRigidBody } from '@react-three/rapier';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';

import { PhysicsEntity } from '../PhysicsEntity';

type MockBody = { alive: boolean };
const mockBodies: MockBody[] = [];

jest.mock('@core/animation/hooks/useSharedAnimations', () => ({
  useSharedAnimations: () => ({ actions: {}, ref: { current: null } }),
}));
jest.mock('@react-three/drei', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return { useGLTF: () => ({ scene: new three.Group(), animations: [] }) };
});
jest.mock('@react-three/fiber', () => ({ useGraph: () => ({ nodes: {}, materials: {} }) }));
// Like rapier: the body is created in a passive effect, handed to the ref, and removed from the world on cleanup.
jest.mock('@react-three/rapier', () => {
  const react = jest.requireActual<typeof import('react')>('react');
  const three = jest.requireActual<typeof import('three')>('three');
  return {
    CapsuleCollider: () => null,
    RigidBody: ({ children, ref }: { children?: ReactNode; ref?: Ref<MockBody> }) => {
      react.useEffect(() => {
        const body = { alive: true };
        mockBodies.push(body);
        if (typeof ref === 'function') ref(body);
        else if (ref) ref.current = body;
        return () => { body.alive = false; };
      }, [ref]);
      return children ?? null;
    },
    euler: () => new three.Euler(),
    useRapier: () => ({ world: {} }),
  };
});
jest.mock('@core/boilerplate/hooks/useEntity', () => ({
  useEntity: () => ({ handleCollisionEnter: jest.fn(), handleIntersectionEnter: jest.fn(), handleIntersectionExit: jest.fn() }),
}));
jest.mock('../../../hooks', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return { useGltfAndSize: () => ({ size: new three.Vector3(1, 2, 1) }) };
});
jest.mock('../InnerGroupRef', () => ({ InnerGroupRef: ({ children }: { children?: ReactNode }) => children ?? null }));

test('a remounted entity forwards the body rapier recreated, and nothing once it unmounts', () => {
  const forwarded = createRef<RapierRigidBody>();
  let renderer!: ReactTestRenderer;
  act(() => {
    renderer = create(
      <StrictMode>
        <PhysicsEntity ref={forwarded} url="/model.glb" isActive={false} componentType="character" />
      </StrictMode>,
    );
  });
  const live = mockBodies.filter((body) => body.alive);
  expect(live).toHaveLength(1);
  expect(forwarded.current).toBe(live[0]);

  act(() => renderer.unmount());
  expect(forwarded.current).toBeNull();
});
