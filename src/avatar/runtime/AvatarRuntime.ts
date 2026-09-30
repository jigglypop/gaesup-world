import { Group, type Mesh } from 'three';

import { bindAvatarAnimationClips } from './animation';
import { assembleAvatarAsset, avatarMeshKey, type AssembledAvatarAsset } from './assembler';
import { createAvatarSkeleton } from './skeleton';
import { AnimationSystem } from '../../core/animation/core/AnimationSystem';
import {
  GLTFAssetCache,
  gltfAssetCache,
  type GLTFAssetLease,
} from '../../core/assets/GLTFAssetCache';
import type { AssetRecord } from '../../core/assets/types';
import { logger } from '../../core/utils/logger';
import {
  avatarManifestFromRecord,
  parseAvatarState,
  resolveAvatarEquipment,
} from '../core/manifest';
import {
  AvatarCompatibilityError,
  type AvatarState,
  type AvatarManifest,
  type AvatarSlot,
  type HumanoidBone,
  type EquipmentSlot,
  type BodyRegion,
} from '../core/types';

type Loaded = AssembledAvatarAsset & {
  manifest: AvatarManifest;
  lease: GLTFAssetLease;
  level: number;
};
export type AvatarRuntimeOptions = {
  avatarId?: string;
  getAsset: (id: string) => AssetRecord | undefined | Promise<AssetRecord | undefined>;
  cache?: GLTFAssetCache;
};

export class AvatarRuntime {
  readonly avatarId: string;
  readonly rig = 'gaesup-humanoid-v1' as const;
  private readonly root = new Group();
  private readonly master = createAvatarSkeleton(this.root);
  private readonly animation: AnimationSystem;
  private readonly cache: GLTFAssetCache;
  private loaded = new Map<AvatarSlot, Loaded>();
  private state: AvatarState = Object.freeze({ body: '', equipment: Object.freeze({}) });
  private listeners = new Set<() => void>();
  private tail: Promise<void> = Promise.resolve();
  private generation = 0;
  private disposed = false;
  private level = 0;

  constructor(private readonly options: AvatarRuntimeOptions) {
    this.avatarId = options.avatarId ?? 'avatar';
    this.root.name = this.avatarId;
    this.cache = options.cache ?? gltfAssetCache;
    this.animation = new AnimationSystem(`avatar:${this.avatarId}`);
    this.animation.initializeMixer(this.root);
  }

  /** Advanced integration boundary; resource ownership stays with this runtime. */
  get scene(): Group {
    return this.root;
  }
  getEquipment = () => ({ ...this.state.equipment });
  getState = (): AvatarState => ({ body: this.state.body, equipment: this.getEquipment() });
  getSnapshot = (): AvatarState => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  getAnimationNames = (): string[] => [...this.animation.getAnimationList()];
  getDiagnostics() {
    return {
      skeletonId: this.master.skeleton.uuid,
      boneCount: this.master.skeleton.bones.length,
      mixerTime: this.animation.getState().animationMixer?.time ?? 0,
      animation: this.animation.getCurrentAnimation(),
      parts: this.loaded.size,
      lod: this.level,
    };
  }
  playAnimation(name: string): void {
    this.assertActive();
    if (!this.animation.getAnimationList().includes(name))
      throw new AvatarCompatibilityError(`Unknown avatar animation: ${name}`);
    if (this.animation.getCurrentAnimation() === name && this.animation.getState().isPlaying)
      return;
    this.animation.playAnimation(name);
  }
  update(deltaSeconds: number): void {
    if (!this.disposed) this.animation.updateAnimation(deltaSeconds);
  }

  equip(slot: AvatarSlot, assetId: string): Promise<void> {
    if (slot === 'body') return this.setBody(assetId);
    const generation = this.generation;
    return this.enqueue(async () => {
      const manifest = await this.resolve(assetId);
      if (generation !== this.generation) throw new Error('Avatar operation superseded');
      if (manifest.kind !== 'avatar-part' || manifest.slot !== slot)
        throw new AvatarCompatibilityError('Equipment slot mismatch');
      await this.apply({
        body: this.state.body,
        equipment: resolveAvatarEquipment(this.state.equipment, manifest),
      });
    });
  }

  unequip(slot: AvatarSlot): void {
    this.assertActive();
    if (slot === 'body')
      throw new AvatarCompatibilityError('Use setBody to replace the canonical body');
    for (const part of this.loaded.values())
      if (part.manifest.requires?.includes(slot))
        throw new AvatarCompatibilityError(`Equipped part requires ${slot}`);
    this.generation++;
    const previous = this.loaded.get(slot);
    previous?.dispose();
    previous?.lease.release();
    this.loaded.delete(slot);
    const equipment = this.getEquipment();
    delete equipment[slot];
    this.state = parseAvatarState({ body: this.state.body, equipment });
    this.applyMask();
    this.notify();
  }

  setBody(body: string): Promise<void> {
    return this.enqueue(() => this.apply({ body, equipment: this.getEquipment() }));
  }
  restore(state: AvatarState): Promise<void> {
    const parsed = parseAvatarState(state);
    return this.enqueue(() => this.apply(parsed));
  }
  setLOD(level: number): Promise<void> {
    if (!Number.isInteger(level) || level < 0)
      return Promise.reject(new AvatarCompatibilityError('Invalid LOD level'));
    return this.enqueue(async () => {
      await this.apply(this.getState(), level);
      this.level = level;
    });
  }

  private enqueue(work: () => Promise<void>): Promise<void> {
    const generation = this.generation;
    const result = this.tail.then(async () => {
      this.assertActive();
      if (generation !== this.generation) throw new Error('Avatar operation superseded');
      await work();
    });
    this.tail = result.catch(() => undefined);
    return result;
  }
  private async resolve(id: string): Promise<AvatarManifest> {
    const asset = await this.options.getAsset(id);
    if (!asset) throw new AvatarCompatibilityError(`Unknown avatar asset: ${id}`);
    return avatarManifestFromRecord(asset);
  }
  private async apply(input: AvatarState, level = this.level): Promise<void> {
    const state = parseAvatarState(input);
    const generation = this.generation;
    const body = await this.resolve(state.body);
    if (body.kind !== 'avatar-body') throw new AvatarCompatibilityError('Expected avatar body');
    const bodyArchetype = body.bodyArchetypes[0]!;
    const manifests = [
      body,
      ...(await Promise.all(Object.values(state.equipment).map((id) => this.resolve(id)))),
    ];
    const next = new Map<AvatarSlot, Loaded>();
    const created: Loaded[] = [];
    let committed = false;
    try {
      const plans = manifests.map((manifest) => {
        if (manifest.rig !== this.rig || !manifest.bodyArchetypes.includes(bodyArchetype))
          throw new AvatarCompatibilityError('Rig/body archetype mismatch');
        if (
          manifest.kind !== 'avatar-body' &&
          (manifest.kind !== 'avatar-part' ||
            state.equipment[manifest.slot as EquipmentSlot] !== manifest.assetId)
        )
          throw new AvatarCompatibilityError('Saved slot mismatch');
        for (const slot of manifest.requires ?? [])
          if (!state.equipment[slot]) throw new AvatarCompatibilityError(`Part requires ${slot}`);
        for (const slot of manifest.conflictsWith ?? [])
          if (state.equipment[slot])
            throw new AvatarCompatibilityError(`Part conflicts with ${slot}`);
        const lod = manifest.lods
          ?.filter((entry) => entry.level <= level)
          .sort((a, b) => b.level - a.level)[0];
        const selected = lod ? { ...manifest, ...lod } : manifest;
        const current = this.loaded.get(manifest.slot);
        const reused =
          current?.manifest.assetId === manifest.assetId &&
          current.manifest.version === manifest.version &&
          current.level === (lod?.level ?? 0) &&
          JSON.stringify(current.manifest) === JSON.stringify(selected);
        return { manifest, selected, level: lod?.level ?? 0, reused: reused ? current : undefined };
      });
      // New parts download together; only assembly onto the shared skeleton stays sequential.
      const leases = await Promise.allSettled(
        plans.map((plan) => (plan.reused ? null : this.cache.acquire(plan.selected.source.uri))),
      );
      const releaseFrom = (start: number) => {
        for (const result of leases.slice(start)) if (result.status === 'fulfilled') result.value?.release();
      };
      const failed = leases.find((result) => result.status === 'rejected');
      if (failed) {
        releaseFrom(0);
        throw failed.reason;
      }
      for (const [index, plan] of plans.entries()) {
        if (plan.reused) {
          next.set(plan.manifest.slot, plan.reused);
          continue;
        }
        const lease = (leases[index] as PromiseFulfilledResult<Awaited<ReturnType<typeof this.cache.acquire>>>).value;
        let assembled: AssembledAvatarAsset;
        try {
          assembled = await assembleAvatarAsset(
            lease.gltf,
            plan.selected,
            this.master.skeleton,
            this.master.bones,
          );
        } catch (error) {
          releaseFrom(index);
          throw error;
        }
        const loaded = { ...assembled, manifest: plan.selected, lease, level: plan.level };
        created.push(loaded);
        next.set(plan.manifest.slot, loaded);
      }
      if (this.disposed || generation !== this.generation)
        throw new Error('Avatar operation superseded');
      const firstBody = !this.loaded.has('body');
      const mask = this.prepareMask(next);
      if (firstBody) {
        try {
          // Clips belong to the canonical rig for this runtime's lifetime, independent of visual bodies.
          for (const clip of bindAvatarAnimationClips(
            next.get('body')!.lease.gltf,
            next.get('body')!.manifest,
          ))
            this.animation.addAnimation(clip.name, clip);
          const idle = this.getAnimationNames()[0];
          if (idle) this.animation.playAnimation(idle, 0);
        } catch (error) {
          this.animation.clearActions();
          this.animation.getState().animationMixer?.uncacheRoot(this.root);
          throw error;
        }
      }
      for (const loaded of created) {
        const bone = loaded.group.userData['avatarBone'] as HumanoidBone | undefined;
        (bone ? this.master.bones[bone] : this.root).add(loaded.group);
      }
      const previous = this.loaded;
      this.loaded = next;
      this.state = state;
      for (const [mesh, visible] of mask) mesh.visible = visible;
      committed = true;
      for (const [slot, old] of previous) if (next.get(slot) !== old) this.release(old);
      this.notify();
    } catch (error) {
      if (!committed) for (const loaded of created) this.release(loaded);
      throw error;
    }
  }
  private release(loaded: Loaded): void {
    try {
      loaded.dispose();
    } catch (error) {
      logger.error('Avatar instance cleanup failed', String(error));
    } finally {
      try {
        loaded.lease.release();
      } catch (error) {
        logger.error('Avatar asset cleanup failed', String(error));
      }
    }
  }
  private applyMask(): void {
    for (const [mesh, visible] of this.prepareMask(this.loaded)) mesh.visible = visible;
  }
  private prepareMask(loadedAssets: Map<AvatarSlot, Loaded>): [Mesh, boolean][] {
    const changes: [Mesh, boolean][] = [];
    const hidden = new Set<BodyRegion>();
    for (const [slot, loaded] of loadedAssets)
      if (slot !== 'body')
        for (const region of loaded.manifest.hideBodyRegions ?? []) hidden.add(region);
    const body = loadedAssets.get('body');
    if (!body) return changes;
    for (const [region, refs] of Object.entries(body.manifest.bodyRegions ?? {}))
      for (const ref of refs)
        changes.push([body.meshes.get(avatarMeshKey(ref))!, !hidden.has(region as BodyRegion)]);
    return changes;
  }
  private notify(): void {
    for (const listener of this.listeners) {
      try {
        listener();
      } catch (error) {
        logger.error('Avatar subscriber failed', error instanceof Error ? error : String(error));
      }
    }
  }
  private assertActive(): void {
    if (this.disposed) throw new Error('Avatar runtime disposed');
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.generation++;
    const mixer = this.animation.getState().animationMixer;
    this.animation.dispose();
    mixer?.uncacheRoot(this.root);
    for (const loaded of this.loaded.values()) {
      loaded.dispose();
      loaded.lease.release();
    }
    this.loaded.clear();
    this.listeners.clear();
    this.master.skeleton.dispose();
    this.root.clear();
    this.root.removeFromParent();
  }
}
