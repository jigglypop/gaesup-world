import type { ReactNode } from 'react';

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';

import { AssetPreviewCanvas } from '../components/AssetPreviewCanvas';

let mockScene: THREE.Group;
jest.mock('@react-three/fiber', () => ({ Canvas: ({ children }: { children: ReactNode }) => children }));
jest.mock('@react-three/drei', () => ({ OrbitControls: () => null, useGLTF: (url: string) => {
  if (url === '/broken.glb') throw new Error('Failed to fetch model');
  return { scene: mockScene };
} }));

test('mounts only visible previews, releases owned textures on exit, and restores on re-entry', () => {
  const previousObserver = Object.getOwnPropertyDescriptor(globalThis, 'IntersectionObserver');
  const disconnect = jest.fn();
  const observe = jest.fn();
  let notify = (_visible: boolean): void => {};
  const observer = jest.fn((callback: IntersectionObserverCallback) => {
    const instance = { observe, disconnect };
    notify = (visible) => callback(
      [{ isIntersecting: visible } as IntersectionObserverEntry],
      instance as unknown as IntersectionObserver,
    );
    return instance;
  });
  Object.defineProperty(globalThis, 'IntersectionObserver', { configurable: true, value: observer });
  mockScene = new THREE.Group();
  const mesh = new THREE.SkinnedMesh(new THREE.BufferGeometry(), new THREE.MeshStandardMaterial());
  const bone = new THREE.Bone();
  mesh.add(bone);
  mesh.bind(new THREE.Skeleton([bone]));
  mockScene.add(mesh);
  const sourceDispose = jest.spyOn(mesh.skeleton, 'dispose');
  const container = document.createElement('div');
  let view: ReactTestRenderer | undefined;
  try {
    act(() => {
      view = create(<AssetPreviewCanvas asset={{ id: 'model', name: '소품', kind: 'object3d', url: '/model.glb' }} />, {
        createNodeMock: () => container,
      });
    });
    expect(observe).toHaveBeenCalledWith(container);
    expect(view!.root.findAllByType('primitive')).toHaveLength(0);
    act(() => { notify(true); });
    const first = view!.root.findByType('primitive').props.object as THREE.Group;
    const skeleton = (first.children[0] as THREE.SkinnedMesh).skeleton;
    skeleton.computeBoneTexture();
    const disposeTexture = jest.spyOn(skeleton.boneTexture!, 'dispose');
    act(() => { notify(false); });
    expect(view!.root.findAllByType('primitive')).toHaveLength(0);
    expect(disposeTexture).toHaveBeenCalledTimes(1);
    expect(sourceDispose).not.toHaveBeenCalled();
    act(() => { notify(true); });
    expect(view!.root.findByType('primitive').props.object).not.toBe(first);
    act(() => { view!.unmount(); });
    view = undefined;
    expect(disconnect).toHaveBeenCalledTimes(1);
    act(() => { notify(true); });
    expect(sourceDispose).not.toHaveBeenCalled();
  } finally {
    if (view) act(() => { view!.unmount(); });
    if (previousObserver) Object.defineProperty(globalThis, 'IntersectionObserver', previousObserver);
    else Reflect.deleteProperty(globalThis, 'IntersectionObserver');
    mesh.skeleton.dispose();
    mesh.geometry.dispose();
    mesh.material.dispose();
    jest.restoreAllMocks();
  }
});

test('contains a failed model and recovers when a different model is selected', () => {
  const report = jest.spyOn(console, 'error').mockImplementation(() => {});
  mockScene = new THREE.Group();
  let view: ReactTestRenderer | undefined;
  try {
    act(() => { view = create(<><button>다른 에셋 선택</button><AssetPreviewCanvas asset={{ id: 'model', name: '소품', kind: 'object3d', url: '/broken.glb' }} /></>); });
    expect(view!.root.findByProps({ role: 'img' }).props['aria-label']).toBe('소품 미리보기를 불러오지 못했습니다');
    expect(view!.root.findByType('button').children).toEqual(['다른 에셋 선택']);
    act(() => { view!.update(<><button>다른 에셋 선택</button><AssetPreviewCanvas asset={{ id: 'model', name: '소품', kind: 'object3d', url: '/working.glb' }} /></>); });
    expect(view!.root.findAllByProps({ role: 'img' })).toHaveLength(0);
    expect(view!.root.findByType('primitive').props.object).toBeInstanceOf(THREE.Group);
  } finally {
    if (view) act(() => { view!.unmount(); });
    report.mockRestore();
  }
});

test('falls back from a failed thumbnail to the model and tries a new thumbnail', () => {
  mockScene = new THREE.Group();
  let view: ReactTestRenderer | undefined;
  const asset = { id: 'model', name: '소품', kind: 'object3d' as const, url: '/working.glb', thumbnailUrl: '/broken.png' };
  try {
    act(() => { view = create(<AssetPreviewCanvas asset={asset} />); });
    expect(view!.root.findByType('img').props.src).toBe('/broken.png');
    expect(view!.root.findAllByType('primitive')).toHaveLength(0);
    act(() => { view!.root.findByType('img').props.onError(); });
    expect(view!.root.findAllByType('img')).toHaveLength(0);
    expect(view!.root.findByType('primitive').props.object).toBeInstanceOf(THREE.Group);
    act(() => { view!.update(<AssetPreviewCanvas asset={{ ...asset, thumbnailUrl: '/new.png' }} />); });
    expect(view!.root.findByType('img').props.src).toBe('/new.png');
    expect(view!.root.findAllByType('primitive')).toHaveLength(0);
  } finally {
    if (view) act(() => { view!.unmount(); });
  }
});

test('isolates skinned preview bones and disposes only owned skeleton textures', () => {
  mockScene = new THREE.Group();
  const geometry = new THREE.BufferGeometry();
  const material = new THREE.MeshStandardMaterial();
  const mesh = new THREE.SkinnedMesh(geometry, material);
  const bone = new THREE.Bone();
  mesh.add(bone);
  mesh.bind(new THREE.Skeleton([bone]));
  mockScene.add(mesh);
  mesh.skeleton.computeBoneTexture();
  const sourceDispose = jest.spyOn(mesh.skeleton.boneTexture!, 'dispose');
  const geometryDispose = jest.spyOn(geometry, 'dispose');
  const materialDispose = jest.spyOn(material, 'dispose');
  let view: ReactTestRenderer | undefined;
  try {
    act(() => { view = create(<AssetPreviewCanvas asset={{ id: 'character', name: '캐릭터', kind: 'characterPart', url: '/character.glb' }} />); });
    const clone = view!.root.findByType('primitive').props.object as THREE.Group;
    const previewMesh = clone.children[0] as THREE.SkinnedMesh;
    expect(previewMesh.skeleton).not.toBe(mesh.skeleton);
    expect(previewMesh.skeleton.bones[0]).toBe(previewMesh.children[0]);
    expect(previewMesh.skeleton.bones[0]).not.toBe(bone);
    previewMesh.skeleton.bones[0]!.position.x = 5;
    expect(bone.position.x).toBe(0);
    expect(previewMesh.geometry).toBe(geometry);
    expect(previewMesh.material).toBe(material);
    previewMesh.skeleton.computeBoneTexture();
    const previewDispose = jest.spyOn(previewMesh.skeleton.boneTexture!, 'dispose');
    act(() => { view!.unmount(); });
    view = undefined;
    expect(previewDispose).toHaveBeenCalledTimes(1);
    expect(sourceDispose).not.toHaveBeenCalled();
    expect(geometryDispose).not.toHaveBeenCalled();
    expect(materialDispose).not.toHaveBeenCalled();
  } finally {
    if (view) act(() => { view!.unmount(); });
    mesh.skeleton.dispose();
    geometry.dispose();
    material.dispose();
    jest.restoreAllMocks();
  }
});
