import type { ReactNode } from 'react';

import ReactThreeTestRenderer from '@react-three/test-renderer';
import * as THREE from 'three';

import { useNPCStore } from '../../../stores/npcStore';
import type { NPCInstance as NPCInstanceData } from '../../../types';
import { NPCInstance } from '../index';

const mockModel: { loaded: boolean; pending: Promise<void>; gltf?: { scene: THREE.Group; animations: THREE.AnimationClip[] } } = {
  loaded: false, pending: Promise.resolve(),
};
jest.mock('../../../../assets/useGLTFAsset', () => ({
  // Like the loader's cache, every call for a loaded model returns the same result.
  useGLTFAsset: () => {
    if (!mockModel.loaded) throw mockModel.pending;
    const three = jest.requireActual<typeof import('three')>('three');
    return (mockModel.gltf ??= { scene: new three.Group(), animations: [] });
  },
}));
jest.mock('@react-three/rapier', () => ({
  RigidBody: ({ children }: { children?: ReactNode }) => <group name="npc-body">{children}</group>,
  CapsuleCollider: () => null,
}));
jest.mock('three-stdlib', () => ({ SkeletonUtils: { clone: (object: THREE.Object3D) => object.clone() } }));
jest.mock('@motions/entities/refs/PhysicsEntity', () => ({ PhysicsEntity: () => null }));
jest.mock('../../../hooks/useNPCSimulation', () => ({
  useNPCSimulation: () => ({ bindBody: () => () => {}, getPose: () => undefined, getGesture: () => undefined, gestureRevision: 0, isAttending: () => false }),
}));
jest.mock('../../../../rendering/useSceneToon', () => ({ useSceneToon: () => {} }));
jest.mock('../../../../simulation/physicsContext', () => ({ useWorldPhysicsInterpolation: () => ({ current: null }) }));
jest.mock('../../../../animation/hooks/useSharedAnimations', () => ({ useSharedAnimations: () => ({ actions: {} }) }));
jest.mock('../../../../rendering/CompileGate', () => ({
  CompileGate: ({ children }: { children?: ReactNode }) => <group name="compile-gate">{children}</group>,
}));

const npc: NPCInstanceData = { id: 'gated', templateId: 'gated-template', name: 'gated', position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };

test('a part model still loading suspends only itself: the NPC body renders, and the model shows inside a compile gate', async () => {
  let finish!: () => void;
  mockModel.loaded = false;
  mockModel.pending = new Promise<void>((resolve) => { finish = resolve; });
  useNPCStore.getState().addTemplate({
    id: 'gated-template', name: 'gated', category: 'humanoid', defaultAnimation: 'idle', clothingParts: [],
    baseParts: [{ id: 'gated-body', type: 'body', url: 'body.glb' }],
  });
  const renderer = await ReactThreeTestRenderer.create(<NPCInstance instance={npc} />);
  try {
    expect(renderer.scene.findByProps({ name: 'npc-body' })).toBeDefined();
    expect(() => renderer.scene.findByProps({ name: 'compile-gate' })).toThrow();
    mockModel.loaded = true;
    await ReactThreeTestRenderer.act(async () => {
      finish();
      await mockModel.pending;
    });
    const gate = renderer.scene.findByProps({ name: 'compile-gate' });
    expect(gate.children.length).toBeGreaterThan(0);
  } finally {
    await renderer.unmount();
    useNPCStore.getState().removeTemplate('gated-template');
  }
});
