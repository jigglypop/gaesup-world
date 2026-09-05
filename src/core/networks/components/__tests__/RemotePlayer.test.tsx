import React from 'react';

import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import type { PlayerState } from '../../types';
import { RemotePlayer } from '../RemotePlayer';

jest.mock('three', () => {
  const actual = jest.requireActual('three') as typeof import('three');
  return {
    ...actual,
    Vector3: jest.fn((x?: number, y?: number, z?: number) => new actual.Vector3(x, y, z)),
    Quaternion: jest.fn((x?: number, y?: number, z?: number, w?: number) => new actual.Quaternion(x, y, z, w)),
  };
});

jest.mock('@react-three/drei', () => ({
  Text: 'Text',
  useAnimations: jest.fn(() => ({ actions: {}, ref: undefined })),
  useGLTF: jest.fn(() => ({
    animations: [],
    scene: { traverse: jest.fn() },
  })),
}));

jest.mock('@react-three/fiber', () => ({
  useFrame: jest.fn(),
}));

jest.mock('@react-three/rapier', () => ({
  CapsuleCollider: 'CapsuleCollider',
  RigidBody: 'RigidBody',
}));

jest.mock('three-stdlib', () => ({
  SkeletonUtils: {
    clone: jest.fn((scene: { traverse: () => void }) => scene),
  },
}));

jest.mock('../../../ui/components/SpeechBalloon', () => ({
  SpeechBalloon: 'SpeechBalloon',
}));

const PLAYER_STATE: PlayerState = {
  name: 'Remote player',
  color: '',
  position: [1, 2, 3],
  rotation: [1, 0, 0, 0],
};

describe('RemotePlayer', () => {
  const mockedUseGLTF = jest.mocked(useGLTF);

  beforeEach(() => {
    mockedUseGLTF.mockClear();
    jest.mocked(useAnimations).mockClear();
  });

  test('plays initial idle immediately and completes or cancels delayed transitions', () => {
    jest.useFakeTimers();
    const makeAction = () => {
      const action = new THREE.AnimationMixer(new THREE.Group()).clipAction(new THREE.AnimationClip('test', 1, []));
      jest.spyOn(action, 'play');
      return action;
    };
    const idle = makeAction();
    const run = makeAction();
    const actions = { idle, run };
    const mockedAnimations = jest.mocked(useAnimations);
    const original = mockedAnimations.getMockImplementation();
    mockedAnimations.mockReturnValue({ actions } as unknown as ReturnType<typeof useAnimations>);
    let renderer: ReactTestRenderer | undefined;
    const render = (animation: string) => <RemotePlayer playerId="animated" state={{ ...PLAYER_STATE, animation }} characterUrl="/cached.glb" />;
    try {
      act(() => { renderer = create(render('idle')); });
      expect(idle.play).toHaveBeenCalledTimes(1);
      act(() => { renderer?.update(render('run')); });
      expect(run.play).not.toHaveBeenCalled();
      act(() => { jest.advanceTimersByTime(180); });
      expect(run.play).toHaveBeenCalledTimes(1);
      act(() => { renderer?.update(render('idle')); });
      act(() => { renderer?.update(render('run')); });
      act(() => { jest.advanceTimersByTime(180); });
      expect(idle.play).toHaveBeenCalledTimes(1);
      act(() => { renderer?.update(render('idle')); });
      expect(idle.play).toHaveBeenCalledTimes(2);
      act(() => { renderer?.update(render('run')); });
      act(() => { renderer?.unmount(); });
      renderer = undefined;
      act(() => { jest.advanceTimersByTime(180); });
      expect(run.play).toHaveBeenCalledTimes(1);
    } finally {
      act(() => renderer?.unmount());
      if (original) mockedAnimations.mockImplementation(original);
      jest.useRealTimers();
    }
  });

  test('starts the replacement model action even when its animation name is unchanged', () => {
    jest.useFakeTimers();
    const mockedAnimations = jest.mocked(useAnimations);
    const original = mockedAnimations.getMockImplementation();
    const makeAction = () => new THREE.AnimationMixer(new THREE.Group()).clipAction(new THREE.AnimationClip('idle', 1, []));
    const first = makeAction();
    const second = makeAction();
    const secondPlay = jest.spyOn(second, 'play');
    const crossFade = jest.spyOn(second, 'crossFadeFrom');
    mockedAnimations.mockReturnValue({ actions: { idle: first } } as unknown as ReturnType<typeof useAnimations>);
    let renderer: ReactTestRenderer | undefined;
    try {
      act(() => { renderer = create(<RemotePlayer playerId="replacement" state={{ ...PLAYER_STATE, animation: 'idle' }} characterUrl="/first.glb" />); });
      expect(first.isRunning()).toBe(true);
      first.stop();
      mockedAnimations.mockReturnValue({ actions: { idle: second } } as unknown as ReturnType<typeof useAnimations>);
      act(() => { renderer?.update(<RemotePlayer playerId="replacement" state={{ ...PLAYER_STATE, animation: 'idle' }} characterUrl="/second.glb" />); });
      expect(secondPlay).toHaveBeenCalledTimes(1);
      expect(second.isRunning()).toBe(true);
      expect(crossFade).not.toHaveBeenCalled();
    } finally {
      act(() => renderer?.unmount());
      if (original) mockedAnimations.mockImplementation(original);
      jest.useRealTimers();
    }
  });

  test('preserves WXYZ half-turn rotations on initial placement and subsequent updates', () => {
    const rotation = new THREE.Quaternion();
    const body = {
      setNextKinematicTranslation: jest.fn(),
      setNextKinematicRotation: (value: THREE.Quaternion) => rotation.copy(value),
    };
    const frameState = { camera: { position: { distanceTo: () => 0 } } } as unknown as Parameters<Parameters<typeof useFrame>[0]>[0];
    let renderer: ReactTestRenderer | undefined;
    try {
      act(() => {
        renderer = create(<RemotePlayer playerId="rotation" state={{ ...PLAYER_STATE, rotation: [0, 0, 0, 1] }} characterUrl="/rotation.glb" />, {
          createNodeMock: element => element.type === 'RigidBody' ? body : new THREE.Group(),
        });
      });
      expect(rotation.toArray()).toEqual([0, 0, 1, 0]);
      act(() => { renderer?.update(<RemotePlayer playerId="rotation" state={{ ...PLAYER_STATE, rotation: [0, 1, 0, 0] }} characterUrl="/rotation.glb" />); });
      jest.mocked(useFrame).mock.calls.at(-1)?.[0](frameState, 0.3);
      expect(rotation.toArray()).toEqual([1, 0, 0, 0]);
    } finally {
      act(() => renderer?.unmount());
    }
  });

  test('releases cloned bone textures on model replacement and departure without disposing shared assets', () => {
    const actual = jest.requireActual('three-stdlib') as typeof import('three-stdlib');
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.MeshStandardMaterial();
    const bone = new THREE.Bone();
    const source = new THREE.SkinnedMesh(geometry, material);
    source.add(bone);
    source.bind(new THREE.Skeleton([bone]));
    source.skeleton.computeBoneTexture();
    const sourceTexture = source.skeleton.boneTexture!;
    const sourceDispose = jest.spyOn(sourceTexture, 'dispose');
    const geometryDispose = jest.spyOn(geometry, 'dispose');
    const materialDispose = jest.spyOn(material, 'dispose');
    const originalLoader = mockedUseGLTF.getMockImplementation();
    const originalClone = jest.mocked(SkeletonUtils.clone).getMockImplementation();
    const ownedDisposals: jest.SpyInstance[] = [];
    jest.mocked(SkeletonUtils.clone).mockImplementation((scene) => {
      const cloned = actual.SkeletonUtils.clone(scene);
      cloned.traverse((object) => {
        if (!(object instanceof THREE.SkinnedMesh)) return;
        expect(object.skeleton).not.toBe(source.skeleton);
        object.skeleton.computeBoneTexture();
        ownedDisposals.push(jest.spyOn(object.skeleton.boneTexture!, 'dispose'));
      });
      return cloned;
    });
    mockedUseGLTF.mockReturnValue({ scene: source, animations: [] } as unknown as ReturnType<typeof useGLTF>);
    let renderer: ReactTestRenderer | undefined;
    try {
      act(() => { renderer = create(<RemotePlayer playerId="bones" state={PLAYER_STATE} characterUrl="/first.glb" />); });
      expect(ownedDisposals).toHaveLength(1);
      expect(ownedDisposals[0]).not.toHaveBeenCalled();
      const replacement = new THREE.Group();
      replacement.add(source);
      mockedUseGLTF.mockReturnValue({ scene: replacement, animations: [] } as unknown as ReturnType<typeof useGLTF>);
      act(() => { renderer?.update(<RemotePlayer playerId="bones" state={PLAYER_STATE} characterUrl="/second.glb" />); });
      expect(ownedDisposals).toHaveLength(2);
      expect(ownedDisposals[0]).toHaveBeenCalledTimes(1);
      expect(ownedDisposals[1]).not.toHaveBeenCalled();
      act(() => renderer?.unmount());
      renderer = undefined;
      expect(ownedDisposals[1]).toHaveBeenCalledTimes(1);
      expect(sourceDispose).not.toHaveBeenCalled();
      expect(geometryDispose).not.toHaveBeenCalled();
      expect(materialDispose).not.toHaveBeenCalled();
      expect(source.skeleton.boneTexture).toBe(sourceTexture);
    } finally {
      act(() => renderer?.unmount());
      if (originalLoader) mockedUseGLTF.mockImplementation(originalLoader);
      if (originalClone) jest.mocked(SkeletonUtils.clone).mockImplementation(originalClone);
      source.skeleton.dispose();
      geometry.dispose();
      material.dispose();
    }
  });

  test('restores source materials when tint is cleared and shares owned clones across meshes', () => {
    const source = new THREE.MeshStandardMaterial({ color: '#abcdef' });
    const sourceDispose = jest.spyOn(source, 'dispose');
    const geometry = new THREE.BufferGeometry();
    const scene = new THREE.Group();
    scene.add(new THREE.Mesh(geometry, source), new THREE.Mesh(geometry, [source, source]));
    const clonedScene = scene.clone(true);
    const originalArray = (clonedScene.children[1] as THREE.Mesh).material;
    jest.mocked(SkeletonUtils.clone).mockReturnValueOnce(clonedScene);
    const originalLoader = mockedUseGLTF.getMockImplementation();
    mockedUseGLTF.mockReturnValue({ scene, animations: [] } as unknown as ReturnType<typeof useGLTF>);
    let renderer: ReactTestRenderer | undefined;
    try {
      act(() => { renderer = create(<RemotePlayer playerId="tint" state={{ ...PLAYER_STATE, color: '#ff0000' }} characterUrl="/tint.glb" />); });
      const single = clonedScene.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>;
      const multiple = clonedScene.children[1] as THREE.Mesh<THREE.BufferGeometry, THREE.Material[]>;
      const tinted = single.material;
      const tintedDispose = jest.spyOn(tinted, 'dispose');
      expect(tinted).not.toBe(source);
      expect(tinted.color.getHexString()).toBe('ff0000');
      expect(multiple.material).toEqual([tinted, tinted]);
      act(() => { renderer?.update(<RemotePlayer playerId="tint" state={{ ...PLAYER_STATE, color: '#00ff00' }} characterUrl="/tint.glb" />); });
      const green = single.material;
      const greenDispose = jest.spyOn(green, 'dispose');
      expect(green).not.toBe(tinted);
      expect(green.color.getHexString()).toBe('00ff00');
      expect(multiple.material).toEqual([green, green]);
      expect(tintedDispose).toHaveBeenCalledTimes(1);
      act(() => { renderer?.update(<RemotePlayer playerId="tint" state={PLAYER_STATE} characterUrl="/tint.glb" />); });
      expect(single.material).toBe(source);
      expect(multiple.material).toBe(originalArray);
      expect(greenDispose).toHaveBeenCalledTimes(1);
      expect(tintedDispose).toHaveBeenCalledTimes(1);
      expect(sourceDispose).not.toHaveBeenCalled();
      expect(source.color.getHexString()).toBe('abcdef');
      act(() => { renderer?.update(<RemotePlayer playerId="tint" state={{ ...PLAYER_STATE, color: '#0000ff' }} characterUrl="/tint.glb" />); });
      const blueDispose = jest.spyOn(single.material, 'dispose');
      act(() => renderer?.unmount());
      renderer = undefined;
      expect(single.material).toBe(source);
      expect(multiple.material).toBe(originalArray);
      expect(blueDispose).toHaveBeenCalledTimes(1);
      expect(sourceDispose).not.toHaveBeenCalled();
    } finally {
      act(() => renderer?.unmount());
      if (originalLoader) mockedUseGLTF.mockImplementation(originalLoader);
      sourceDispose.mockRestore();
      source.dispose();
      geometry.dispose();
    }
  });

  test('network rerenders reuse vectors and quaternions instead of allocating discarded replacements', () => {
    const vectors = jest.mocked(THREE.Vector3).mockClear();
    const quaternions = jest.mocked(THREE.Quaternion).mockClear();
    const body = {
      translation: () => ({ x: 1, y: 2, z: 3 }),
      rotation: () => ({ x: 0, y: 0, z: 0, w: 1 }),
      setNextKinematicTranslation: jest.fn(),
      setNextKinematicRotation: jest.fn(),
    };
    const frameState = { camera: { position: { distanceTo: () => 0 } } } as unknown as Parameters<Parameters<typeof useFrame>[0]>[0];
    let renderer: ReactTestRenderer | undefined;
    try {
      act(() => {
        renderer = create(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} characterUrl="/avatars/remote.glb" />, {
          createNodeMock: element => element.type === 'RigidBody' ? body : new THREE.Group(),
        });
      });
      const initialVectors = vectors.mock.calls.length;
      const initialQuaternions = quaternions.mock.calls.length;
      expect(initialVectors).toBeGreaterThan(0);
      expect(initialQuaternions).toBeGreaterThan(0);
      for (let tick = 1; tick <= 40; tick++) {
        act(() => {
          renderer?.update(<RemotePlayer playerId="remote-1" state={{ ...PLAYER_STATE, position: [1 + tick / 10, 2, 3] }} characterUrl="/avatars/remote.glb" />);
        });
        const frame = jest.mocked(useFrame).mock.calls.at(-1)?.[0];
        expect(frame).toBeDefined();
        frame?.(frameState, 1 / 60);
      }
      expect(body.setNextKinematicTranslation).toHaveBeenCalledTimes(41);
      const translation = body.setNextKinematicTranslation.mock.calls.at(-1)?.[0] as { x: number };
      expect(translation.x).toBeGreaterThan(1);
      expect(translation.x).toBeLessThan(5);
      expect(vectors).toHaveBeenCalledTimes(initialVectors);
      expect(quaternions).toHaveBeenCalledTimes(initialQuaternions);
    } finally {
      act(() => renderer?.unmount());
    }
  });

  test.each([64, 128])('distance throttling preserves elapsed interpolation time at %i FPS', (fps) => {
    const simulate = (distance: number) => {
      const position = new THREE.Vector3();
      const rotation = new THREE.Quaternion();
      const body = {
        setNextKinematicTranslation: jest.fn((value: THREE.Vector3) => position.copy(value)),
        setNextKinematicRotation: jest.fn((value: THREE.Quaternion) => rotation.copy(value)),
      };
      const frameState = { camera: { position: { distanceTo: () => distance } } } as unknown as Parameters<Parameters<typeof useFrame>[0]>[0];
      let renderer: ReactTestRenderer | undefined;
      try {
        act(() => {
          renderer = create(<RemotePlayer playerId="lod" state={PLAYER_STATE} characterUrl="/lod.glb" />, {
            createNodeMock: element => element.type === 'RigidBody' ? body : new THREE.Group(),
          });
        });
        jest.mocked(useFrame).mock.calls.at(-1)?.[0](frameState, 0);
        act(() => {
          renderer?.update(<RemotePlayer playerId="lod" state={{ ...PLAYER_STATE, position: [5, 2, 3], rotation: [Math.SQRT1_2, 0, Math.SQRT1_2, 0] }} characterUrl="/lod.glb" />);
        });
        body.setNextKinematicTranslation.mockClear();
        const frame = jest.mocked(useFrame).mock.calls.at(-1)![0];
        for (let tick = 0; tick < fps / 2; tick++) frame(frameState, 1 / fps);
        const result = { x: position.x, rotation: rotation.clone(), writes: body.setNextKinematicTranslation.mock.calls.length };
        frame(frameState, 0.3);
        expect(position.x).toBe(5);
        expect(rotation.y).toBeCloseTo(Math.SQRT1_2);
        return result;
      } finally {
        act(() => renderer?.unmount());
      }
    };
    const near = simulate(0);
    const far = simulate(200);
    expect(near.writes).toBe(fps / 2);
    expect(far.writes).toBe(4);
    expect(near.x).toBeGreaterThan(4.8);
    expect(Math.abs(near.x - far.x)).toBeLessThan(0.05);
    expect(near.rotation.angleTo(far.rotation)).toBeLessThan(0.001);
  });

  test('binds animations to the scaled model root without sharing the movement group ref', () => {
    let renderer!: ReactTestRenderer;
    act(() => {
      renderer = create(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} characterUrl="/avatars/remote.glb" />);
    });
    const groups = renderer.root.findAllByType('group');
    const modelRoot = groups.find((group) => group.props.scale !== undefined);
    const movementGroup = modelRoot?.parent;
    const animationRef = jest.mocked(useAnimations).mock.calls.at(-1)?.[1];
    expect(modelRoot).toBeDefined();
    expect(modelRoot?.props.ref).toBe(animationRef);
    expect(movementGroup?.props.ref).not.toBe(animationRef);
    act(() => renderer.unmount());
  });

  test('supports an empty to model URL to empty transition on the same mounted instance', () => {
    let renderer!: ReactTestRenderer;

    act(() => {
      renderer = create(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} />);
    });
    expect(renderer.toJSON()).toBeNull();
    expect(mockedUseGLTF).not.toHaveBeenCalled();

    act(() => {
      renderer.update(
        <RemotePlayer
          playerId="remote-1"
          state={PLAYER_STATE}
          characterUrl="/avatars/remote.glb"
        />,
      );
    });
    expect(renderer.toJSON()).not.toBeNull();
    expect(mockedUseGLTF).toHaveBeenCalledWith('/avatars/remote.glb');

    act(() => {
      renderer.update(<RemotePlayer playerId="remote-1" state={PLAYER_STATE} />);
    });
    expect(renderer.toJSON()).toBeNull();

    act(() => {
      renderer.unmount();
    });
  });
});
