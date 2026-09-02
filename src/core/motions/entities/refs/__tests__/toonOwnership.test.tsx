import { StrictMode, type ReactElement, type ReactNode } from 'react';

import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import { disposeToonGradients, setDefaultToonMode } from '../../../../rendering/toon';
import { PhysicsEntity } from '../PhysicsEntity';
import RiderRef from '../RiderRef';

type MockGltf = {
  animations: THREE.AnimationClip[];
  scene: THREE.Object3D;
};

type MockGraph = {
  materials: Record<string, THREE.Material>;
  nodes: Record<string, THREE.Object3D>;
};

const mockGltfs = new Map<string, MockGltf>();
const mockCloneRoots: THREE.Object3D[] = [];
let mockGraphs = new WeakMap<THREE.Object3D, MockGraph>();

const mockUseGraph = jest.fn((root: THREE.Object3D): MockGraph => {
  const cached = mockGraphs.get(root);
  if (cached) return cached;
  const nodes: Record<string, THREE.Object3D> = {};
  const materials: Record<string, THREE.Material> = {};
  root.traverse((object) => {
    if (!object.name) return;
    nodes[object.name] = object;
    const mesh = object as THREE.Mesh;
    if (!mesh.isMesh || Array.isArray(mesh.material)) return;
    materials[mesh.material.name || object.name] = mesh.material;
  });
  const graph = { materials, nodes };
  mockGraphs.set(root, graph);
  return graph;
});

jest.mock('@react-three/drei', () => ({
  useAnimations: () => ({ actions: {}, ref: { current: null } }),
  useGLTF: (url: string) => {
    const gltf = mockGltfs.get(url);
    if (!gltf) throw new Error(`Missing mock GLTF: ${url}`);
    return gltf;
  },
}));

jest.mock('@react-three/fiber', () => ({
  useGraph: (root: THREE.Object3D) => mockUseGraph(root),
}));

jest.mock('@react-three/rapier', () => {
  const three = jest.requireActual<typeof import('three')>('three');
  return {
    CapsuleCollider: () => null,
    RigidBody: ({ children }: { children?: ReactNode }) => children ?? null,
    euler: () => new three.Euler(),
  };
});

jest.mock('@core/boilerplate/hooks/useEntity', () => ({
  useEntity: () => ({
    handleCollisionEnter: jest.fn(),
    handleIntersectionEnter: jest.fn(),
    handleIntersectionExit: jest.fn(),
  }),
}));

jest.mock('@/core/hooks', () => ({
  useAnimationPlayer: jest.fn(),
}));

jest.mock('../../../hooks', () => ({
  useGltfAndSize: ({ url }: { url?: string }) => {
    const gltf = url ? mockGltfs.get(url) : undefined;
    if (!gltf) throw new Error(`Missing mock GLTF: ${url ?? ''}`);
    return {
      getSize: jest.fn(),
      gltf,
      setSize: jest.fn(),
      size: new THREE.Vector3(1, 2, 1),
    };
  },
}));

function createSource(url: string): THREE.Group {
  const material = new THREE.MeshStandardMaterial({ color: '#4477aa' });
  material.name = `${url}-material`;
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(), material);
  mesh.name = `${url}-mesh`;
  const scene = new THREE.Group();
  scene.name = `${url}-scene`;
  scene.add(mesh);
  mockGltfs.set(url, { animations: [], scene });
  return scene;
}

function getOnlyMesh(root: THREE.Object3D): THREE.Mesh {
  let result: THREE.Mesh | undefined;
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    if (mesh.isMesh) result = mesh;
  });
  if (!result) throw new Error('Expected one mesh in the mock scene.');
  return result;
}

function getUniqueClones(source: THREE.Object3D): THREE.Object3D[] {
  return [...new Set(mockCloneRoots)].filter((root) => root.name === source.name);
}

function getProjectedClone(source: THREE.Object3D): THREE.Object3D {
  const projected = getUniqueClones(source).filter((root) => {
    const material = getOnlyMesh(root).material as THREE.MeshToonMaterial;
    return material.isMeshToonMaterial === true;
  });
  expect(projected).toHaveLength(1);
  return projected[0] as THREE.Object3D;
}

function getRenderedMaterial(renderer: ReactTestRenderer): THREE.Material {
  const meshes = renderer.root.findAllByType('mesh');
  const material = meshes.at(-1)?.props.material as THREE.Material | THREE.Material[] | undefined;
  if (!material || Array.isArray(material)) throw new Error('Expected one rendered material.');
  return material;
}

function physicsEntity(url: string): ReactElement {
  return <PhysicsEntity url={url} isActive={false} isNotColliding componentType="character" />;
}

function rider(url: string): ReactElement {
  return <RiderRef url={url} />;
}

function verifyLifecycle(buildSubject: (url: string) => ReactElement): void {
  const firstUrl = '/first.glb';
  const secondUrl = '/second.glb';
  const firstSource = createSource(firstUrl);
  const secondSource = createSource(secondUrl);
  const firstSourceMaterial = getOnlyMesh(firstSource).material;
  const secondSourceMaterial = getOnlyMesh(secondSource).material;
  const disposed: THREE.MeshToonMaterial[] = [];
  const nativeDispose = THREE.MeshToonMaterial.prototype.dispose;
  jest.spyOn(THREE.MeshToonMaterial.prototype, 'dispose').mockImplementation(function (
    this: THREE.MeshToonMaterial,
  ) {
    disposed.push(this);
    nativeDispose.call(this);
  });

  let renderer: ReactTestRenderer | undefined;
  act(() => {
    renderer = create(<StrictMode>{buildSubject(firstUrl)}</StrictMode>);
  });
  const view = renderer as ReactTestRenderer;
  const firstClone = getProjectedClone(firstSource);
  const firstActiveMaterial = getOnlyMesh(firstClone).material as THREE.MeshToonMaterial;

  expect(getOnlyMesh(firstSource).material).toBe(firstSourceMaterial);
  expect(getRenderedMaterial(view)).toBe(firstActiveMaterial);
  expect(getUniqueClones(firstSource).length).toBeGreaterThanOrEqual(2);
  for (const clone of getUniqueClones(firstSource)) {
    if (clone !== firstClone) expect(getOnlyMesh(clone).material).toBe(firstSourceMaterial);
  }
  expect(disposed).toHaveLength(1);
  expect(disposed).not.toContain(firstActiveMaterial);

  act(() => {
    view.update(<StrictMode>{buildSubject(secondUrl)}</StrictMode>);
  });
  const secondClone = getProjectedClone(secondSource);
  const secondActiveMaterial = getOnlyMesh(secondClone).material as THREE.MeshToonMaterial;

  expect(getOnlyMesh(firstClone).material).toBe(firstSourceMaterial);
  expect(getOnlyMesh(firstSource).material).toBe(firstSourceMaterial);
  expect(getOnlyMesh(secondSource).material).toBe(secondSourceMaterial);
  expect(getRenderedMaterial(view)).toBe(secondActiveMaterial);
  expect(disposed).toContain(firstActiveMaterial);
  expect(disposed).not.toContain(secondActiveMaterial);
  expect(disposed).toHaveLength(2);

  act(() => {
    view.unmount();
  });

  expect(getOnlyMesh(secondClone).material).toBe(secondSourceMaterial);
  expect(getOnlyMesh(secondSource).material).toBe(secondSourceMaterial);
  expect(disposed).toContain(secondActiveMaterial);
  expect(disposed).toHaveLength(3);
  expect(new Set(disposed).size).toBe(disposed.length);
}

describe('GLTF clone toon ownership', () => {
  beforeEach(() => {
    mockGltfs.clear();
    mockCloneRoots.length = 0;
    mockGraphs = new WeakMap();
    mockUseGraph.mockClear();
    const nativeClone = SkeletonUtils.clone;
    jest.spyOn(SkeletonUtils, 'clone').mockImplementation((source: THREE.Object3D) => {
      const clone = nativeClone(source);
      mockCloneRoots.push(clone);
      return clone;
    });
    setDefaultToonMode(true);
  });

  afterEach(() => {
    setDefaultToonMode(false);
    jest.restoreAllMocks();
    disposeToonGradients();
  });

  test('PhysicsEntity owns committed StrictMode generations across URL switch and unmount', () => {
    verifyLifecycle(physicsEntity);
  });

  test('RiderRef owns committed StrictMode generations across URL switch and unmount', () => {
    verifyLifecycle(rider);
  });

  test.each([
    ['PhysicsEntity', physicsEntity],
    ['RiderRef', rider],
  ])('leaves %s clone materials untouched when default toon mode is disabled', (_name, build) => {
    setDefaultToonMode(false);
    const url = '/plain.glb';
    const source = createSource(url);
    const sourceMaterial = getOnlyMesh(source).material;
    const dispose = jest.spyOn(THREE.MeshToonMaterial.prototype, 'dispose');
    let renderer: ReactTestRenderer | undefined;
    act(() => {
      renderer = create(<StrictMode>{build(url)}</StrictMode>);
    });
    const view = renderer as ReactTestRenderer;

    for (const clone of getUniqueClones(source)) {
      expect(getOnlyMesh(clone).material).toBe(sourceMaterial);
    }
    expect(getRenderedMaterial(view)).toBe(sourceMaterial);

    act(() => {
      view.unmount();
    });
    expect(dispose).not.toHaveBeenCalled();
  });
});
