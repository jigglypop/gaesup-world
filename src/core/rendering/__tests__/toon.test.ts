import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

import {
  applyToonToScene,
  disposeToonGradients,
  releaseToonFromScene,
  setDefaultToonMode,
} from '../toon';

function getMesh(root: THREE.Object3D, name: string): THREE.Mesh {
  const mesh = root.getObjectByName(name);
  if (!(mesh instanceof THREE.Mesh)) throw new Error(`Missing mesh: ${name}`);
  return mesh;
}

function getMaterial(mesh: THREE.Mesh): THREE.Material {
  if (Array.isArray(mesh.material)) throw new Error('Expected one material.');
  return mesh.material;
}

function getMaterials(mesh: THREE.Mesh): THREE.Material[] {
  if (!Array.isArray(mesh.material)) throw new Error('Expected a material array.');
  return mesh.material;
}

describe('toon scene ownership', () => {
  afterEach(() => {
    setDefaultToonMode(false);
    jest.restoreAllMocks();
    disposeToonGradients();
  });

  test('keeps the shared source pure and isolates deduplicated materials per clone', () => {
    const map = new THREE.Texture();
    const normalMap = new THREE.Texture();
    const alphaMap = new THREE.Texture();
    const emissiveMap = new THREE.Texture();
    const sourceMaterial = new THREE.MeshStandardMaterial({
      color: '#336699',
      emissive: '#110022',
      emissiveIntensity: 0.7,
      map,
      normalMap,
      alphaMap,
      emissiveMap,
      opacity: 0.6,
      side: THREE.DoubleSide,
      transparent: true,
    });
    const authoredToon = new THREE.MeshToonMaterial({ color: '#abcdef' });
    const geometry = new THREE.BoxGeometry();
    const source = new THREE.Group();
    const sourceSingle = new THREE.Mesh(geometry, sourceMaterial);
    sourceSingle.name = 'single';
    const sourceArray = new THREE.Mesh(geometry, [sourceMaterial, authoredToon, sourceMaterial]);
    sourceArray.name = 'array';
    source.add(sourceSingle, sourceArray);
    const first = SkeletonUtils.clone(source);
    const second = SkeletonUtils.clone(source);

    const result: void = applyToonToScene(first, 5);
    const firstGenerated = getMaterial(getMesh(first, 'single')) as THREE.MeshToonMaterial;
    const firstArray = getMaterials(getMesh(first, 'array'));
    const gradient = firstGenerated.gradientMap;

    expect(getMaterial(sourceSingle)).toBe(sourceMaterial);
    expect(result).toBeUndefined();
    expect(sourceArray.material).toEqual([sourceMaterial, authoredToon, sourceMaterial]);
    expect(firstGenerated).not.toBe(sourceMaterial);
    expect(firstGenerated.isMeshToonMaterial).toBe(true);
    expect(firstArray).toEqual([firstGenerated, authoredToon, firstGenerated]);
    expect(firstGenerated.color).toEqual(sourceMaterial.color);
    expect(firstGenerated.emissive).toEqual(sourceMaterial.emissive);
    expect(firstGenerated.emissiveIntensity).toBe(sourceMaterial.emissiveIntensity);
    expect(firstGenerated.map).toBe(map);
    expect(firstGenerated.normalMap).toBe(normalMap);
    expect(firstGenerated.alphaMap).toBe(alphaMap);
    expect(firstGenerated.emissiveMap).toBe(emissiveMap);
    expect(firstGenerated.opacity).toBe(sourceMaterial.opacity);
    expect(firstGenerated.side).toBe(sourceMaterial.side);

    applyToonToScene(second, 5);
    const secondGenerated = getMaterial(getMesh(second, 'single')) as THREE.MeshToonMaterial;
    expect(secondGenerated).not.toBe(firstGenerated);
    expect(secondGenerated.gradientMap).toBe(gradient);

    const generatedDispose = jest.spyOn(firstGenerated, 'dispose');
    const sourceDispose = jest.spyOn(sourceMaterial, 'dispose');
    const authoredDispose = jest.spyOn(authoredToon, 'dispose');
    const geometryDispose = jest.spyOn(geometry, 'dispose');
    const textureDisposes = [map, normalMap, alphaMap, emissiveMap].map((texture) =>
      jest.spyOn(texture, 'dispose'),
    );
    const gradientDispose = gradient ? jest.spyOn(gradient, 'dispose') : null;

    releaseToonFromScene(first);
    expect(getMaterial(getMesh(first, 'single'))).toBe(sourceMaterial);
    expect(getMaterials(getMesh(first, 'array'))).toEqual([
      sourceMaterial,
      authoredToon,
      sourceMaterial,
    ]);
    expect(getMaterial(getMesh(second, 'single'))).toBe(secondGenerated);
    expect(getMaterial(sourceSingle)).toBe(sourceMaterial);
    expect(generatedDispose).toHaveBeenCalledTimes(1);
    expect(sourceDispose).not.toHaveBeenCalled();
    expect(authoredDispose).not.toHaveBeenCalled();
    expect(geometryDispose).not.toHaveBeenCalled();
    for (const dispose of textureDisposes) expect(dispose).not.toHaveBeenCalled();
    expect(gradientDispose).not.toHaveBeenCalled();

    releaseToonFromScene(first);
    expect(generatedDispose).toHaveBeenCalledTimes(1);
    releaseToonFromScene(second);
  });

  test('keeps repeated apply stable and releases every generated material after reentry and errors', () => {
    const firstSource = new THREE.MeshStandardMaterial({ color: '#111111' });
    const secondSource = new THREE.MeshStandardMaterial({ color: '#222222' });
    const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(), firstSource);
    const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(), secondSource);
    const root = new THREE.Group();
    root.add(firstMesh, secondMesh);

    applyToonToScene(root);
    const firstGenerated = getMaterial(firstMesh) as THREE.MeshToonMaterial;
    const secondGenerated = getMaterial(secondMesh) as THREE.MeshToonMaterial;
    applyToonToScene(root);
    expect(getMaterial(firstMesh)).toBe(firstGenerated);
    expect(getMaterial(secondMesh)).toBe(secondGenerated);

    const firstError = new Error('first generated material failed to dispose');
    const firstDispose = jest.spyOn(firstGenerated, 'dispose').mockImplementation(() => {
      releaseToonFromScene(root);
      throw firstError;
    });
    const secondDispose = jest.spyOn(secondGenerated, 'dispose');
    let caught: unknown;
    try {
      releaseToonFromScene(root);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(firstError);
    expect(getMaterial(firstMesh)).toBe(firstSource);
    expect(getMaterial(secondMesh)).toBe(secondSource);
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
    releaseToonFromScene(root);
    expect(firstDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);

    applyToonToScene(root);
    expect(getMaterial(firstMesh)).not.toBe(firstGenerated);
    expect(getMaterial(secondMesh)).not.toBe(secondGenerated);
    releaseToonFromScene(root);
  });

  test('treats authored toon materials as shared non-owned inputs', () => {
    const gradient = new THREE.DataTexture(new Uint8Array([0, 255]), 2, 1, THREE.RedFormat);
    const authoredToon = new THREE.MeshToonMaterial({ gradientMap: gradient });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), authoredToon);
    const root = new THREE.Group();
    root.add(mesh);
    const materialDispose = jest.spyOn(authoredToon, 'dispose');
    const gradientDispose = jest.spyOn(gradient, 'dispose');

    applyToonToScene(root);
    applyToonToScene(root);
    expect(mesh.material).toBe(authoredToon);
    releaseToonFromScene(root);
    releaseToonFromScene(root);

    expect(mesh.material).toBe(authoredToon);
    expect(materialDispose).not.toHaveBeenCalled();
    expect(gradientDispose).not.toHaveBeenCalled();
  });

  test('preserves falsy runtime material array slots', () => {
    const source = new THREE.MeshStandardMaterial();
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(), source);
    const sourceSlots: Array<THREE.Material | null | undefined> = [source, null, undefined, source];
    (mesh as unknown as { material: Array<THREE.Material | null | undefined> }).material =
      sourceSlots;

    applyToonToScene(mesh);
    const projected = (mesh as unknown as { material: Array<THREE.Material | null | undefined> })
      .material;
    expect(projected[0]).toBe(projected[3]);
    expect(projected[1]).toBeNull();
    expect(projected[2]).toBeUndefined();

    releaseToonFromScene(mesh);
    expect(
      (mesh as unknown as { material: Array<THREE.Material | null | undefined> }).material,
    ).toBe(sourceSlots);
  });

  test('rolls back assigned slots and generated ownership when material assignment fails', () => {
    const firstSource = new THREE.MeshStandardMaterial({ color: '#111111' });
    const failingSource = new THREE.MeshStandardMaterial({ color: '#222222' });
    const firstMesh = new THREE.Mesh(new THREE.BoxGeometry(), firstSource);
    const failingObject = new THREE.Object3D();
    const assignmentError = new Error('material assignment failed');
    let failingMaterial: THREE.Material = failingSource;
    Object.defineProperties(failingObject, {
      isMesh: { value: true },
      material: {
        configurable: true,
        get: () => failingMaterial,
        set: (material: THREE.Material) => {
          failingMaterial = material;
          if ((material as THREE.MeshToonMaterial).isMeshToonMaterial) throw assignmentError;
        },
      },
    });
    const root = new THREE.Group();
    root.add(firstMesh, failingObject);
    const disposed: THREE.MeshToonMaterial[] = [];
    const nativeDispose = THREE.MeshToonMaterial.prototype.dispose;
    const cleanupError = new Error('generated cleanup failed');
    jest.spyOn(THREE.MeshToonMaterial.prototype, 'dispose').mockImplementation(function (
      this: THREE.MeshToonMaterial,
    ) {
      disposed.push(this);
      if (disposed.length === 1) throw cleanupError;
      nativeDispose.call(this);
    });
    let caught: unknown;

    try {
      applyToonToScene(root);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(assignmentError);
    expect(firstMesh.material).toBe(firstSource);
    expect(failingMaterial).toBe(failingSource);
    expect(disposed).toHaveLength(2);
    expect(new Set(disposed).size).toBe(2);
    releaseToonFromScene(root);
    expect(disposed).toHaveLength(2);
  });

  test('continues slot restoration and disposal after a cleanup setter fails', () => {
    const failingSource = new THREE.MeshStandardMaterial({ color: '#111111' });
    const secondSource = new THREE.MeshStandardMaterial({ color: '#222222' });
    const failingObject = new THREE.Object3D();
    const restoreError = new Error('material restore failed');
    const disposeError = new Error('generated dispose failed');
    let failRestore = false;
    let failingMaterial: THREE.Material = failingSource;
    Object.defineProperties(failingObject, {
      isMesh: { value: true },
      material: {
        configurable: true,
        get: () => failingMaterial,
        set: (material: THREE.Material) => {
          if (failRestore && material === failingSource) throw restoreError;
          failingMaterial = material;
        },
      },
    });
    const secondMesh = new THREE.Mesh(new THREE.BoxGeometry(), secondSource);
    const root = new THREE.Group();
    root.add(failingObject, secondMesh);
    applyToonToScene(root);
    const failingGenerated = failingMaterial as THREE.MeshToonMaterial;
    const secondGenerated = secondMesh.material as THREE.MeshToonMaterial;
    const failingDispose = jest.spyOn(failingGenerated, 'dispose').mockImplementation(() => {
      throw disposeError;
    });
    const secondDispose = jest.spyOn(secondGenerated, 'dispose');
    failRestore = true;
    let caught: unknown;

    try {
      releaseToonFromScene(root);
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(restoreError);
    expect(failingMaterial).toBe(failingGenerated);
    expect(secondMesh.material).toBe(secondSource);
    expect(failingDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
    releaseToonFromScene(root);
    expect(failingDispose).toHaveBeenCalledTimes(1);
    expect(secondDispose).toHaveBeenCalledTimes(1);
  });
});
