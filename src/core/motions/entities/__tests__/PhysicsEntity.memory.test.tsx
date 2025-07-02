import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { PhysicsEntity } from '../PhysicsEntity';
import { usePhysicsEntity } from '../../hooks/usePhysicsEntity';
import * as THREE from 'three';
import { RapierRigidBody } from '@react-three/rapier';

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

describe('PhysicsEntity 메모리 누수 테스트', () => {
  let memorySnapshots: number[] = [];
  
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

  const measureMemory = () => {
    if (global.gc) {
      global.gc();
    }
    return process.memoryUsage().heapUsed;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    memorySnapshots = [];
  });

  it('반복적인 마운트/언마운트 시 메모리 누수가 발생하지 않아야 함', async () => {
    const iterations = 10;
    
    for (let i = 0; i < iterations; i++) {
      const { unmount } = render(
        <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
      );
      
      await waitFor(() => {
        expect(mockOuterGroupRef.current).toBeTruthy();
      }, { timeout: 100 });
      
      unmount();
      
      await waitFor(() => {
        expect(mockOuterGroupRef.current).toBeFalsy();
      }, { timeout: 100 });
      
      memorySnapshots.push(measureMemory());
    }
    
    const firstSnapshot = memorySnapshots[0];
    const lastSnapshot = memorySnapshots[memorySnapshots.length - 1];
    const memoryGrowth = lastSnapshot - firstSnapshot;
    const averageGrowthPerIteration = memoryGrowth / iterations;
    
    expect(averageGrowthPerIteration).toBeLessThan(1024 * 1024);
  });

  it('애니메이션 등록/해제가 제대로 정리되어야 함', async () => {
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

    const { getGlobalAnimationBridge } = require('../../../animation/hooks/useAnimationBridge');
    const animationBridge = getGlobalAnimationBridge();

    const { unmount } = render(
      <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
    );

    await waitFor(() => {
      expect(animationBridge.registerAnimations).toHaveBeenCalled();
    });

    unmount();

    await waitFor(() => {
      expect(animationBridge.unregisterAnimations).toHaveBeenCalled();
    });
  });

  it('Three.js 리소스가 제대로 정리되어야 함', async () => {
    const mockGeometry = new THREE.BoxGeometry();
    const mockMaterial = new THREE.MeshBasicMaterial();
    const mockMesh = new THREE.Mesh(mockGeometry, mockMaterial);
    const mockScene = new THREE.Group();
    mockScene.add(mockMesh);

    const disposeSpy = jest.spyOn(mockGeometry, 'dispose');
    const materialDisposeSpy = jest.spyOn(mockMaterial, 'dispose');

    const { useGLTF } = require('@react-three/drei');
    useGLTF.mockReturnValue({
      scene: mockScene,
      animations: [],
    });

    const { unmount } = render(
      <PhysicsEntity {...defaultProps} ref={mockRigidBodyRef} />
    );

    unmount();

    await waitFor(() => {
      expect(disposeSpy).toHaveBeenCalled();
      expect(materialDisposeSpy).toHaveBeenCalled();
    });
  });
});

describe('usePhysicsEntity 훅 메모리 누수 테스트', () => {
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

  it('엔티티 등록/해제가 올바르게 처리되어야 함', async () => {
    const { result, unmount } = renderHook(() =>
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

    unmount();
  });

  it('isActive가 false일 때 리소스를 할당하지 않아야 함', () => {
    const { result } = renderHook(() =>
      usePhysicsEntity({
        isActive: false,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    const snapshot = result.current.getMotionSnapshot();
    expect(snapshot).toBeNull();
  });

  it('여러 개의 엔티티가 동시에 존재할 때 충돌이 없어야 함', async () => {
    const { result: result1 } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'character',
        rigidBody: mockRigidBody,
      })
    );

    const { result: result2 } = renderHook(() =>
      usePhysicsEntity({
        isActive: true,
        actions: mockActions,
        modeType: 'vehicle',
        rigidBody: mockRigidBody,
      })
    );

    const snapshot1 = result1.current.getMotionSnapshot();
    const snapshot2 = result2.current.getMotionSnapshot();

    expect(snapshot1).toBeDefined();
    expect(snapshot2).toBeDefined();
  });
}); 