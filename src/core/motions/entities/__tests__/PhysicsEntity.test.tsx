import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react-hooks';
import { PhysicsEntity } from '../PhysicsEntity';
import { usePhysicsEntity } from '../../hooks/usePhysicsEntity';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';
import { getGlobalAnimationBridge } from '../../../animation/hooks/useAnimationBridge';

jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(() => ({
    scene: new THREE.Group(),
    animations: [],
  })),
  useAnimations: jest.fn(() => ({
    actions: {},
    ref: { current: null },
  })),
}));

jest.mock('@react-three/fiber', () => ({
  useGraph: jest.fn(() => ({
    nodes: {},
  })),
}));

jest.mock('../../../stores/gaesupStore', () => ({
  useGaesupStore: jest.fn((selector) => {
    const mockStore = {
      mode: { type: 'character' },
      states: { isRiding: false },
      interaction: { keyboard: {} },
    };
    return selector ? selector(mockStore) : mockStore;
  }),
}));

jest.mock('../../../animation/hooks/useAnimationBridge', () => ({
  getGlobalAnimationBridge: jest.fn(() => ({
    registerAnimations: jest.fn(),
    unregisterAnimations: jest.fn(),
  })),
}));

jest.mock('../../index', () => jest.fn());
jest.mock('../useGaesupGltf', () => ({
  useGltfAndSize: jest.fn(() => ({ size: { x: 1, y: 2, z: 1 } })),
}));

jest.mock('../setGroundRay', () => ({
  useSetGroundRay: jest.fn(() => jest.fn()),
}));

jest.mock('../../../hooks/useAnimationPlayer', () => ({
  useAnimationPlayer: jest.fn(),
}));

describe('PhysicsEntity', () => {
  const mockRigidBodyRef = { current: null };
  const mockOuterGroupRef = { current: null };
  const mockInnerGroupRef = { current: null };
  const mockColliderRef = { current: null };
  const mockGroundRay = { current: null };

  const defaultProps = {
    url: 'test-model.glb',
    isActive: true,
    outerGroupRef: mockOuterGroupRef,
    innerGroupRef: mockInnerGroupRef,
    colliderRef: mockColliderRef,
    groundRay: mockGroundRay,
    position: new THREE.Vector3(0, 0, 0),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    const { container } = render(
      <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
    );
    expect(container).toBeTruthy();
  });

  it('should register animations when isActive and has actions', async () => {
    const mockActions = {
      idle: new THREE.AnimationAction(
        new THREE.AnimationMixer(new THREE.Object3D()),
        new THREE.AnimationClip('idle', 1, [])
      ),
    };

    const { useAnimations } = require('@react-three/drei');
    useAnimations.mockReturnValue({
      actions: mockActions,
      ref: { current: null },
    });

    const animationBridge = getGlobalAnimationBridge();

    render(<PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />);

    await waitFor(() => {
      expect(animationBridge.registerAnimations).toHaveBeenCalledWith(
        'character',
        mockActions
      );
    });
  });

  it('should unregister animations on unmount', async () => {
    const mockActions = {
      idle: new THREE.AnimationAction(
        new THREE.AnimationMixer(new THREE.Object3D()),
        new THREE.AnimationClip('idle', 1, [])
      ),
    };

    const { useAnimations } = require('@react-three/drei');
    useAnimations.mockReturnValue({
      actions: mockActions,
      ref: { current: null },
    });

    const animationBridge = getGlobalAnimationBridge();

    const { unmount } = render(
      <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
    );

    unmount();

    await waitFor(() => {
      expect(animationBridge.unregisterAnimations).toHaveBeenCalledWith('character');
    });
  });

  it('should not re-register animations if already registered', async () => {
    const mockActions = {
      idle: new THREE.AnimationAction(
        new THREE.AnimationMixer(new THREE.Object3D()),
        new THREE.AnimationClip('idle', 1, [])
      ),
    };

    const { useAnimations } = require('@react-three/drei');
    useAnimations.mockReturnValue({
      actions: mockActions,
      ref: { current: null },
    });

    const animationBridge = getGlobalAnimationBridge();

    const { rerender } = render(
      <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
    );

    rerender(<PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />);

    await waitFor(() => {
      expect(animationBridge.registerAnimations).toHaveBeenCalledTimes(1);
    });
  });
});

describe('usePhysicsEntity', () => {
  const mockRigidBody = {
    translation: () => ({ x: 0, y: 0, z: 0 }),
    linvel: () => ({ x: 0, y: 0, z: 0 }),
    rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
    setLinvel: jest.fn(),
    setTranslation: jest.fn(),
  } as unknown as RapierRigidBody;

  const mockActions = {
    idle: new THREE.AnimationAction(
      new THREE.AnimationMixer(new THREE.Object3D()),
      new THREE.AnimationClip('idle', 1, [])
    ),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should register entity with MotionBridge when active', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    expect(result.current.executeMotionCommand).toBeDefined();
    expect(result.current.updateMotion).toBeDefined();
    expect(result.current.getMotionSnapshot).toBeDefined();
  });

  it('should execute motion commands', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    const mockCommand = {
      type: 'move',
      data: { movement: new THREE.Vector3(1, 0, 0) },
    };

    act(() => {
      result.current.executeMotionCommand(mockCommand);
    });
  });

  it('should update motion with delta time', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    act(() => {
      result.current.updateMotion(0.016);
    });
  });

  it('should get motion snapshot', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    const snapshot = result.current.getMotionSnapshot();
    expect(snapshot).toBeDefined();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    unmount();
  });

  it('should handle vehicle mode type', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'vehicle',
        rigidBody: mockRigidBody,
      })
    );

    expect(result.current.executeMotionCommand).toBeDefined();
  });
}); 