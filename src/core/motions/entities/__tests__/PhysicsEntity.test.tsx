import React from 'react';
import renderer, { ReactTestInstance, ReactTestRenderer } from 'react-test-renderer';
import { PhysicsEntity } from '../PhysicsEntity';
import { usePhysicsEntity } from '../../hooks/usePhysicsEntity';
import { useGltfAndSize } from '../useGltfAndSize';
import { useSetGroundRay } from '../useSetGroundRay';
import { InnerGroupRef } from '../InnerGroupRef';
import { PartsGroupRef } from '../PartsGroupRef';

jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(() => ({
    scene: {
      clone: () => ({
        traverse: jest.fn()
      })
    },
    animations: []
  })),
  useAnimations: jest.fn(() => ({
    actions: {},
    ref: { current: null }
  }))
}));

jest.mock('@react-three/rapier', () => ({
  RigidBody: ({ children }: { children: React.ReactNode }) => <group>{children}</group>,
  CapsuleCollider: () => <mesh />,
  euler: jest.fn(() => ({
    set: jest.fn()
  }))
}));

jest.mock('@react-three/fiber', () => ({
  useGraph: jest.fn(() => ({ nodes: {} }))
}));

jest.mock('../hooks/usePhysicsEntity');
jest.mock('../useGltfAndSize');
jest.mock('../useSetGroundRay');
jest.mock('../InnerGroupRef', () => ({
  InnerGroupRef: jest.fn(({ children }) => <group>{children}</group>)
}));
jest.mock('../PartsGroupRef', () => ({
  PartsGroupRef: jest.fn(() => <mesh />)
}));

const mockUsePhysicsEntity = usePhysicsEntity as jest.Mock;
const mockUseGltfAndSize = useGltfAndSize as jest.Mock;
const mockUseSetGroundRay = useSetGroundRay as jest.Mock;
const mockPartsGroupRef = PartsGroupRef as jest.Mock;

describe('PhysicsEntity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePhysicsEntity.mockReturnValue({
      mode: { type: 'character' },
      isRiding: false,
      handleIntersectionEnter: jest.fn(),
      handleIntersectionExit: jest.fn(),
      handleCollisionEnter: jest.fn()
    });
    mockUseGltfAndSize.mockReturnValue({
      size: { x: 1, y: 2, z: 1 }
    });
    mockUseSetGroundRay.mockReturnValue(jest.fn());
  });

  it('오류 없이 렌더링되어야 합니다.', () => {
    const component = renderer.create(<PhysicsEntity url="test.glb" isActive={true} />);
    expect(component.toJSON()).not.toBeNull();
  });

  it('parts prop이 제공되면 PartsGroupRef를 렌더링해야 합니다.', () => {
    const parts = [{ url: 'part1.glb', color: 'red' }];
    renderer.create(<PhysicsEntity url="test.glb" isActive={true} parts={parts} />);
    expect(mockPartsGroupRef).toHaveBeenCalledTimes(1);
    expect(mockPartsGroupRef).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'part1.glb',
        color: 'red'
      }),
      {}
    );
  });

  it('parts prop이 없으면 PartsGroupRef를 렌더링하지 않아야 합니다.', () => {
    renderer.create(<PhysicsEntity url="test.glb" isActive={true} />);
    expect(mockPartsGroupRef).not.toHaveBeenCalled();
  });
}); 