import * as THREE from 'three';

import {
  compareSkeletons,
  getBindPoseHash,
  remapSkinnedGeometryJoints,
  resolveSharedSkeletonBinding,
} from '../skeleton';

function makeSkeleton(boneNames: string[]): THREE.Skeleton {
  const bones = boneNames.map((name) => {
    const bone = new THREE.Bone();
    bone.name = name;
    return bone;
  });
  return new THREE.Skeleton(bones);
}

function makeSkinnedGeometry(skinIndices: number[]): THREE.BufferGeometry {
  const vertexCount = skinIndices.length / 4;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    'position',
    new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
  );
  geometry.setAttribute(
    'skinIndex',
    new THREE.BufferAttribute(new Uint16Array(skinIndices), 4),
  );
  geometry.setAttribute(
    'skinWeight',
    new THREE.BufferAttribute(new Float32Array(skinIndices.length).fill(0.25), 4),
  );
  return geometry;
}

describe('compareSkeletons', () => {
  it('reports identical for same bones in same order', () => {
    const a = makeSkeleton(['hips', 'spine', 'chest']);
    const b = makeSkeleton(['hips', 'spine', 'chest']);
    expect(compareSkeletons(a, b)).toEqual({ compatibility: 'identical', missingBones: [] });
  });

  it('reports remappable for same bones in different order', () => {
    const a = makeSkeleton(['hips', 'spine', 'chest']);
    const b = makeSkeleton(['hips', 'chest', 'spine']);
    expect(compareSkeletons(a, b).compatibility).toBe('remappable');
  });

  it('reports incompatible with missing bones listed', () => {
    const wearable = makeSkeleton(['hips', 'spine', 'tail']);
    const character = makeSkeleton(['hips', 'spine', 'chest']);
    expect(compareSkeletons(wearable, character)).toEqual({
      compatibility: 'incompatible',
      missingBones: ['tail'],
    });
  });

  it('reports incompatible when bone names are duplicated', () => {
    const wearable = makeSkeleton(['hips', 'spine', 'spine']);
    const character = makeSkeleton(['spine', 'hips', 'extra']);
    expect(compareSkeletons(wearable, character).compatibility).toBe('incompatible');
  });
});

describe('remapSkinnedGeometryJoints', () => {
  it('rewrites joint indices from source order to target order', () => {
    const source = makeSkeleton(['hips', 'spine', 'chest']);
    const target = makeSkeleton(['hips', 'chest', 'spine']);
    const geometry = makeSkinnedGeometry([0, 1, 2, 0, 2, 2, 1, 0]);

    const remapped = remapSkinnedGeometryJoints(geometry, source, target);
    const skinIndex = remapped.getAttribute('skinIndex');
    expect(Array.from(skinIndex.array as Uint16Array)).toEqual([0, 2, 1, 0, 1, 1, 2, 0]);
    // Original geometry is untouched.
    expect(Array.from(geometry.getAttribute('skinIndex').array as Uint16Array)).toEqual([
      0, 1, 2, 0, 2, 2, 1, 0,
    ]);
  });
});

describe('resolveSharedSkeletonBinding', () => {
  const makeMesh = (boneNames: string[], skinIndices: number[]): THREE.SkinnedMesh => {
    const skeleton = makeSkeleton(boneNames);
    const mesh = new THREE.SkinnedMesh(makeSkinnedGeometry(skinIndices));
    mesh.bind(skeleton);
    return mesh;
  };

  it('shares the target skeleton directly when bone order matches', () => {
    const mesh = makeMesh(['hips', 'spine'], [0, 1, 0, 0]);
    const target = makeSkeleton(['hips', 'spine']);
    const binding = resolveSharedSkeletonBinding(mesh, target);
    expect(binding.skeleton).toBe(target);
    expect(binding.geometry).toBe(mesh.geometry);
    expect(binding.ownsGeometry).toBe(false);
  });

  it('remaps geometry and shares the target skeleton when order differs', () => {
    const mesh = makeMesh(['spine', 'hips'], [0, 1, 0, 0]);
    const target = makeSkeleton(['hips', 'spine']);
    const binding = resolveSharedSkeletonBinding(mesh, target);
    expect(binding.compatibility).toBe('remappable');
    expect(binding.skeleton).toBe(target);
    expect(binding.ownsGeometry).toBe(true);
    expect(Array.from(binding.geometry.getAttribute('skinIndex').array as Uint16Array)).toEqual([
      1, 0, 1, 1,
    ]);
  });

  it('keeps the wearable skeleton when the rig contract is broken', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mesh = makeMesh(['hips', 'tail'], [0, 1, 0, 0]);
    const target = makeSkeleton(['hips', 'spine']);
    const binding = resolveSharedSkeletonBinding(mesh, target, 'test.glb');
    expect(binding.compatibility).toBe('incompatible');
    expect(binding.skeleton).toBe(mesh.skeleton);
    expect(binding.ownsGeometry).toBe(false);
    warn.mockRestore();
  });
});

describe('getBindPoseHash', () => {
  it('matches for skeletons with identical bind poses and differs otherwise', () => {
    const a = makeSkeleton(['hips', 'spine']);
    const b = makeSkeleton(['hips', 'spine']);
    expect(getBindPoseHash(a)).toBe(getBindPoseHash(b));

    const bone = new THREE.Bone();
    bone.name = 'hips';
    bone.position.set(0, 1.2, 0);
    bone.updateMatrixWorld(true);
    const moved = new THREE.Skeleton([bone]);
    expect(getBindPoseHash(moved)).not.toBe(getBindPoseHash(a));
  });
});
