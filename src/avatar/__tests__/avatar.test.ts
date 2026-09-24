/** @jest-environment jsdom */
import fs from 'node:fs';
import path from 'node:path';

import { Mesh, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { AnimationSystem } from '../../core/animation/core/AnimationSystem';
import { HttpAssetSource } from '../../core/assets/api';
import { GLTFAssetCache } from '../../core/assets/GLTFAssetCache';
import { useAssetStore } from '../../core/assets/stores/assetStore';
import type { AssetRecord } from '../../core/assets/types';
import { LocalStorageAdapter } from '../../core/save/adapters/LocalStorageAdapter';
import { SaveSystem } from '../../core/save/core/SaveSystem';
import { avatarManifestFromRecord, parseAvatarManifest, parseAvatarState } from '../core/manifest';
import type { AvatarState } from '../core/types';
import { AvatarRuntime } from '../runtime/AvatarRuntime';
import { createAvatarSaveBinding, createAvatarStore } from '../store';

const root = path.resolve(__dirname, '../../..');
const records = JSON.parse(
  fs.readFileSync(path.join(root, 'public/gltf/avatars/manual-v1/catalog.json'), 'utf8'),
) as AssetRecord[];
const initial: AvatarState = {
  body: 'body-sd-neutral-v1',
  equipment: { hair: 'hair-001', top: 'top-001', bottom: 'bottom-001', shoes: 'shoes-001' },
};
const getAsset = (id: string) => records.find((record) => record.id === id);
const load = async (uri: string) => {
  const bytes = fs.readFileSync(path.join(root, 'public', uri));
  const buffer = new ArrayBuffer(bytes.length);
  new Uint8Array(buffer).set(bytes);
  return new GLTFLoader().parseAsync(buffer, '');
};
beforeAll(() => {
  globalThis.fetch ??= jest.fn(() =>
    Promise.reject(new Error('Network is disabled in fixture tests')),
  );
});
function skinned(runtime: AvatarRuntime): SkinnedMesh[] {
  const meshes: SkinnedMesh[] = [];
  runtime.scene.traverse((object) => {
    if (object instanceof SkinnedMesh) meshes.push(object);
  });
  return meshes;
}
const runtimes: AvatarRuntime[] = [];
function create(options: Partial<ConstructorParameters<typeof AvatarRuntime>[0]> = {}) {
  const avatar = new AvatarRuntime({ getAsset, cache: new GLTFAssetCache(load), ...options });
  runtimes.push(avatar);
  return avatar;
}
afterEach(() => {
  for (const runtime of runtimes.splice(0)) runtime.dispose();
  localStorage.clear();
});

describe('canonical avatar manifests', () => {
  it('uses existing HTTP catalog and slot queries, and resolves relative artifact URLs', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      json: async () => records,
    })) as unknown as typeof fetch;
    const catalog = new HttpAssetSource('/api', fetcher);
    const loaded = await catalog.listAssets({ kind: 'avatar-part' });
    expect(loaded).toHaveLength(17);
    useAssetStore.getState().registerAssets(loaded);
    expect(
      useAssetStore
        .getState()
        .listAssets({ kind: 'avatar-part', slot: 'onepiece' })
        .map((record) => record.id),
    ).toEqual(['onepiece-001']);
    const top = getAsset('top-001')!;
    const relative = {
      ...top,
      url: 'https://assets.example/avatar/top/model.glb',
      metadata: { avatar: { ...avatarManifestFromRecord(top), source: { uri: './model.glb' } } },
    };
    expect(avatarManifestFromRecord(relative).source.uri).toBe(relative.url);
    useAssetStore.getState().resetAssets();
  });
  it('parses the full authored catalog and rejects malformed, semantic LOD overrides and URL save payloads', () => {
    expect(records).toHaveLength(17);
    for (const record of records) expect(avatarManifestFromRecord(record).assetId).toBe(record.id);
    const body = avatarManifestFromRecord(getAsset(initial.body)!);
    expect(() => parseAvatarManifest({ ...body, bones: {} })).toThrow('bone mapping');
    expect(() => parseAvatarManifest({ ...body, bodyRegions: {} })).toThrow('all body regions');
    expect(() =>
      parseAvatarManifest({
        ...body,
        lods: [{ ...body.lods![0], attachment: { mode: 'bone', bone: 'head' } }],
      }),
    ).toThrow('semantics');
    expect(() =>
      parseAvatarState({ body: initial.body, equipment: { top: 'https://evil/model.glb' } }),
    ).toThrow('asset IDs');
    expect(() =>
      parseAvatarState({
        body: initial.body,
        equipment: { onepiece: 'onepiece-001', top: 'top-001' },
      }),
    ).toThrow('Conflicting');
  });
});

describe('real GLB assembly and transactions', () => {
  it('maps arbitrarily named animation targets through manifest bone IDs', async () => {
    const cache = new GLTFAssetCache(async (uri) => {
      const gltf = await load(uri);
      if (uri.includes('body-sd-neutral-v1')) {
        const renames = new Map<string, string>();
        gltf.scene.traverse((node) => {
          const renamed = `provider_${node.id}`;
          renames.set(node.name, renamed);
          node.name = renamed;
        });
        for (const clip of gltf.animations)
          for (const track of clip.tracks) {
            const separator = track.name.lastIndexOf('.');
            track.name = `${renames.get(track.name.slice(0, separator))}${track.name.slice(separator)}`;
          }
      }
      return gltf;
    });
    const avatar = create({ cache });
    await avatar.restore(initial);
    avatar.playAnimation('armsUp');
    avatar.update(0.5);
    const upperArm = skinned(avatar)[0]!.skeleton.bones.find((bone) => bone.name === 'upperArmL')!;
    expect(Math.abs(upperArm.quaternion.z)).toBeGreaterThan(0.5);
  });
  it('remaps permuted joint indices without modifying cached source geometry', async () => {
    let source: SkinnedMesh | undefined;
    const cache = new GLTFAssetCache(async (uri) => {
      const gltf = await load(uri);
      if (uri.endsWith('top-002.glb')) {
        const handled = new Set();
        gltf.scene.traverse((object) => {
          if (!(object instanceof SkinnedMesh)) return;
          source ??= object;
          if (!handled.has(object.skeleton)) {
            object.skeleton.bones.reverse();
            object.skeleton.boneInverses.reverse();
            handled.add(object.skeleton);
          }
          const joints = object.geometry.getAttribute('skinIndex');
          for (let i = 0; i < joints.count; i++)
            for (let axis = 0; axis < 4; axis++)
              joints.setComponent(
                i,
                axis,
                object.skeleton.bones.length - 1 - joints.getComponent(i, axis),
              );
        });
      }
      return gltf;
    });
    const avatar = create({ cache });
    await avatar.restore(initial);
    await avatar.equip('top', 'top-002');
    const target = skinned(avatar).find((mesh) => mesh.material === source!.material)!;
    expect(target.geometry).not.toBe(source!.geometry);
    avatar.scene.updateMatrixWorld(true);
    expect(
      target
        .getVertexPosition(0, new Vector3())
        .distanceTo(new Vector3().fromBufferAttribute(target.geometry.getAttribute('position'), 0)),
    ).toBeLessThan(0.0001);
    const disposed = jest.spyOn(target.geometry, 'dispose');
    avatar.unequip('top');
    expect(disposed).toHaveBeenCalledTimes(1);
  });

  it('rejects invalid rest pose and overlapping body masks before replacing existing assets', async () => {
    const malformed = {
      ...getAsset(initial.body)!,
      id: 'bad-body',
      metadata: {
        avatar: {
          ...avatarManifestFromRecord(getAsset(initial.body)!),
          assetId: 'bad-body',
          bodyRegions: {
            ...avatarManifestFromRecord(getAsset(initial.body)!).bodyRegions,
            head: avatarManifestFromRecord(getAsset(initial.body)!).bodyRegions!.neck,
          },
        },
      },
    };
    const cache = new GLTFAssetCache(async (uri) => {
      const gltf = await load(uri);
      if (uri.endsWith('top-002.glb'))
        gltf.scene.traverse((object) => {
          if (object.name === 'chest') object.position.x += 0.1;
        });
      return gltf;
    });
    const avatar = create({
      cache,
      getAsset: (id) => (id === 'bad-body' ? malformed : getAsset(id)),
    });
    await avatar.restore(initial);
    const before = avatar.getState();
    await expect(avatar.equip('top', 'top-002')).rejects.toThrow('rest pose');
    await expect(avatar.setBody('bad-body')).rejects.toThrow('distinct');
    expect(avatar.getState()).toEqual(before);
  });

  it('releases staged ownership when initial animation preparation fails, then recovers', async () => {
    const cache = new GLTFAssetCache(load);
    const avatar = create({ cache });
    const add = jest.spyOn(AnimationSystem.prototype, 'addAnimation').mockImplementationOnce(() => {
      throw new Error('clip failure');
    });
    await expect(avatar.restore(initial)).rejects.toThrow('clip failure');
    expect(avatar.getState().body).toBe('');
    expect(skinned(avatar)).toHaveLength(0);
    expect(cache.getReferenceCount(getAsset(initial.body)!.url!)).toBe(0);
    add.mockRestore();
    await avatar.restore(initial);
    expect(avatar.getState()).toEqual(initial);
  });
  it('replaces animated garments on the same skeleton and mixer; masks are reversible', async () => {
    const avatar = create();
    await avatar.restore(initial);
    const original = skinned(avatar);
    const skeleton = original[0]!.skeleton;
    const bodyGroup = avatar.scene.children.find(
      (child) => child.children.filter((c) => c instanceof Mesh).length > 10,
    )!;
    const hidden = () => bodyGroup.children.filter((mesh) => !mesh.visible).length;
    expect(hidden()).toBeGreaterThan(0);
    avatar.playAnimation('walk');
    avatar.update(0.25);
    avatar.scene.updateMatrixWorld(true);
    const before = avatar.getDiagnostics();
    await avatar.equip('top', 'top-002');
    expect(avatar.getDiagnostics().mixerTime).toBe(before.mixerTime);
    expect(avatar.getDiagnostics().animation).toBe('walk');
    expect(skinned(avatar).every((mesh) => mesh.skeleton === skeleton)).toBe(true);
    expect(avatar.getEquipment().top).toBe('top-002');
    const garment = skinned(avatar).find((mesh) => !original.includes(mesh))!;
    const point = garment.getVertexPosition(0, new Vector3());
    avatar.update(0.3);
    avatar.scene.updateMatrixWorld(true);
    expect(avatar.getDiagnostics().mixerTime).toBeGreaterThan(before.mixerTime);
    expect(garment.getVertexPosition(0, new Vector3()).toArray().every(Number.isFinite)).toBe(true);
    expect(point.toArray().every(Number.isFinite)).toBe(true);
    avatar.unequip('top');
    avatar.unequip('bottom');
    avatar.unequip('shoes');
    expect(hidden()).toBe(0);
  });

  it('keeps the previous outfit on missing, wrong-slot, incompatible and failed GLB loads', async () => {
    const incompatible = JSON.parse(JSON.stringify(getAsset('top-002'))) as AssetRecord;
    incompatible.id = 'bad-fit';
    incompatible.metadata!['avatar'] = {
      ...avatarManifestFromRecord(getAsset('top-002')!),
      assetId: 'bad-fit',
      bodyArchetypes: ['OTHER'],
    };
    const broken = {
      ...getAsset('top-002')!,
      id: 'broken',
      metadata: {
        avatar: {
          ...avatarManifestFromRecord(getAsset('top-002')!),
          assetId: 'broken',
          source: { uri: '/missing.glb' },
        },
      },
    };
    const avatar = create({
      getAsset: (id) => (id === 'bad-fit' ? incompatible : id === 'broken' ? broken : getAsset(id)),
    });
    await avatar.restore(initial);
    const before = avatar.getState();
    const objects = skinned(avatar);
    for (const id of ['missing', 'hair-001', 'bad-fit', 'broken'])
      await expect(avatar.equip('top', id)).rejects.toThrow();
    expect(avatar.getState()).toEqual(before);
    expect(skinned(avatar)).toEqual(objects);
  });

  it('resolves onepiece conflicts, keeps shared masks, attaches sockets and swaps real LOD without resetting animation', async () => {
    const avatar = create();
    await avatar.restore(initial);
    await avatar.equip('onepiece', 'onepiece-001');
    expect(avatar.getEquipment()).toMatchObject({ onepiece: 'onepiece-001' });
    expect(avatar.getEquipment().top).toBeUndefined();
    expect(avatar.getEquipment().bottom).toBeUndefined();
    await avatar.equip('top', 'top-002');
    expect(avatar.getEquipment().onepiece).toBeUndefined();
    await avatar.equip('bag', 'bag-001');
    await avatar.equip('hand', 'hand-001');
    const d = avatar.getDiagnostics();
    const count = skinned(avatar).reduce(
      (sum, mesh) => sum + mesh.geometry.getAttribute('position').count,
      0,
    );
    await avatar.setLOD(1);
    expect(
      skinned(avatar).reduce((sum, mesh) => sum + mesh.geometry.getAttribute('position').count, 0),
    ).toBeLessThan(count);
    expect(avatar.getDiagnostics().skeletonId).toBe(d.skeletonId);
    expect(avatar.getDiagnostics().mixerTime).toBe(d.mixerTime);
    expect(avatar.getEquipment().bag).toBe('bag-001');
  });

  it('rejects queued and in-flight stale work after unequip or dispose', async () => {
    let complete: (() => void) | undefined;
    let started: (() => void) | undefined;
    const began = new Promise<void>((resolve) => {
      started = resolve;
    });
    const gate = new Promise<void>((resolve) => {
      complete = resolve;
    });
    const avatar = create({
      getAsset: async (id) => {
        if (id === 'top-002') {
          started!();
          await gate;
        }
        return getAsset(id);
      },
    });
    await avatar.restore(initial);
    const pending = avatar.equip('top', 'top-002');
    await began;
    avatar.unequip('top');
    complete!();
    await expect(pending).rejects.toThrow('superseded');
    expect(avatar.getEquipment().top).toBeUndefined();
    const pendingBody = avatar.setBody(initial.body);
    avatar.dispose();
    await expect(pendingBody).rejects.toThrow('disposed');
  });

  it('queues independent operations without losing equipment and protects snapshots', async () => {
    const avatar = create();
    await avatar.restore(initial);
    await Promise.all([avatar.equip('hat', 'hat-001'), avatar.setBody(initial.body)]);
    expect(avatar.getEquipment().hat).toBe('hat-001');
    expect(Object.isFrozen(avatar.getSnapshot().equipment)).toBe(true);
  });

  it('exercises all seven clips with finite deformed vertices and one skeleton', async () => {
    const avatar = create();
    await avatar.restore(initial);
    const id = avatar.getDiagnostics().skeletonId;
    expect(avatar.getAnimationNames()).toEqual([
      'idle',
      'walk',
      'run',
      'jump',
      'sit',
      'armsUp',
      'crouch',
    ]);
    let moved = false;
    for (const pose of avatar.getAnimationNames()) {
      avatar.playAnimation(pose);
      avatar.update(0.5);
      avatar.scene.updateMatrixWorld(true);
      for (const mesh of skinned(avatar)) {
        for (let i = 0; i < mesh.geometry.getAttribute('position').count; i += 7) {
          const vertex = mesh.getVertexPosition(i, new Vector3());
          expect(vertex.toArray().every(Number.isFinite)).toBe(true);
          expect(vertex.length()).toBeLessThan(3);
          if (
            vertex.distanceTo(
              new Vector3().fromBufferAttribute(mesh.geometry.getAttribute('position'), i),
            ) > 0.01
          )
            moved = true;
        }
        expect(mesh.skeleton.uuid).toBe(id);
      }
    }
    expect(moved).toBe(true);
  });
});

describe('shared lifecycle and persistent IDs', () => {
  it('shares downloads/resources across avatars with independent skeletons and disposes on last release', async () => {
    const loader = jest.fn(load);
    const cache = new GLTFAssetCache(loader);
    const a = create({ cache });
    const b = create({ cache });
    await Promise.all([a.restore(initial), b.restore(initial)]);
    expect(loader).toHaveBeenCalledTimes(5);
    expect(skinned(a)[0]!.skeleton).not.toBe(skinned(b)[0]!.skeleton);
    const geometry = skinned(a)[0]!.geometry;
    const dispose = jest.spyOn(geometry, 'dispose');
    expect(skinned(b)[0]!.geometry).toBe(geometry);
    a.dispose();
    expect(dispose).not.toHaveBeenCalled();
    b.dispose();
    expect(dispose).toHaveBeenCalledTimes(1);
    expect(
      cache.getReferenceCount(avatarManifestFromRecord(getAsset(initial.body)!).source.uri),
    ).toBe(0);
  });

  it('saves through SaveSystem and restores actual equipment into a fresh runtime', async () => {
    const a = create();
    await a.restore(initial);
    await a.equip('top', 'top-003');
    const store = createAvatarStore(initial);
    store.getState().setAvatar(a.getState());
    const save = new SaveSystem({ adapter: new LocalStorageAdapter(), defaultSlot: 'avatar-test' });
    const unregister = save.register(createAvatarSaveBinding(store));
    await save.save();
    unregister();
    a.dispose();
    const restored = createAvatarStore(initial);
    save.register(createAvatarSaveBinding(restored));
    expect(await save.load()).toBe(true);
    const b = create();
    await b.restore(restored.getState().avatar);
    expect(b.getEquipment().top).toBe('top-003');
    const wire = JSON.stringify(save.createBlob().domains['avatar']);
    expect(wire).not.toMatch(/uri|\.glb|skeleton|uuid/);
    const before = restored.getState().avatar;
    expect(() =>
      restored.getState().prepareHydrate({ body: initial.body, equipment: { unknown: 'x' } }),
    ).toThrow();
    expect(restored.getState().avatar).toBe(before);
  });
});
