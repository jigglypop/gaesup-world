import * as THREE from 'three';

import type { AnimatorClipBinding, AnimatorLayerDefinition } from './types';

type BindingEntry = {
  action: THREE.AnimationAction;
  owned: boolean;
  frame: number;
  weight: number;
  bestClipWeight: number;
  time: number;
  active: boolean;
};

export type AnimatorActionResolver = (clip: string) => THREE.AnimationAction | null;

const MAX_OVERRIDE_LAYER_WEIGHT = 0.999;
const LAYER_BASE_WEIGHT = 1;

function collectMaskNodeNames(root: THREE.Object3D, layer: AnimatorLayerDefinition): Set<string> | null {
  const mask = layer.mask;
  if (!mask) return null;
  const names = new Set<string>();
  mask.bones.forEach((bone) => {
    names.add(bone);
    if (!mask.includeDescendants) return;
    root.getObjectByName(bone)?.traverse((child) => {
      if (child.name) names.add(child.name);
    });
  });
  return names;
}

function filterClip(clip: THREE.AnimationClip, allowed: Set<string> | null): THREE.AnimationClip {
  if (!allowed) return clip.clone();
  const tracks = clip.tracks.filter((track) => {
    const nodeName = THREE.PropertyBinding.parseTrackName(track.name).nodeName;
    return nodeName !== undefined && allowed.has(nodeName);
  });
  return new THREE.AnimationClip(clip.name, clip.duration, tracks.map((track) => track.clone()));
}

function overrideScale(layerWeight: number): number {
  const clamped = Math.min(MAX_OVERRIDE_LAYER_WEIGHT, Math.max(0, layerWeight));
  return (clamped * LAYER_BASE_WEIGHT) / (1 - clamped);
}

export class ThreeAnimatorBinding implements AnimatorClipBinding {
  private readonly resolve: AnimatorActionResolver;
  private readonly layers: readonly AnimatorLayerDefinition[];
  private readonly entries: Map<string, BindingEntry | null>[];
  private readonly maskNames: (Set<string> | null | undefined)[];
  private readonly resolvedEntries: BindingEntry[] = [];
  private frame = 0;

  constructor(resolve: AnimatorActionResolver, layers: readonly AnimatorLayerDefinition[]) {
    this.resolve = resolve;
    this.layers = layers;
    this.entries = layers.map(() => new Map());
    this.maskNames = layers.map(() => undefined);
  }

  hasClip(layerIndex: number, clip: string): boolean {
    return this.getEntry(layerIndex, clip) !== null;
  }

  getClipDuration(layerIndex: number, clip: string): number {
    return this.getEntry(layerIndex, clip)?.action.getClip().duration ?? 0;
  }

  beginFrame(): void {
    this.frame++;
  }

  writeClip(layerIndex: number, clip: string, time: number, clipWeight: number, layerWeight: number): void {
    const entry = this.getEntry(layerIndex, clip);
    if (!entry) return;
    const layer = this.layers[layerIndex];
    const additive = layer?.blending === 'additive';
    const scale = layerIndex === 0 || additive ? layerWeight : overrideScale(layerWeight);
    if (entry.frame !== this.frame) {
      entry.frame = this.frame;
      entry.weight = 0;
      entry.bestClipWeight = -1;
    }
    entry.weight += clipWeight * scale;
    if (clipWeight > entry.bestClipWeight) {
      entry.bestClipWeight = clipWeight;
      entry.time = time;
    }
  }

  endFrame(): void {
    for (let i = 0; i < this.resolvedEntries.length; i++) {
      const entry = this.resolvedEntries[i]!;
      if (entry.frame === this.frame && entry.weight > 0) {
        this.applyEntry(entry);
        continue;
      }
      if (entry.active) {
        entry.action.stop();
        entry.active = false;
      }
    }
  }

  private applyEntry(entry: BindingEntry): void {
    const action = entry.action;
    if (!entry.active || !action.isScheduled()) {
      action.enabled = true;
      action.play();
      entry.active = true;
    }
    action.setEffectiveTimeScale(0);
    action.time = entry.time;
    action.setEffectiveWeight(entry.weight);
  }

  private getEntry(layerIndex: number, clip: string): BindingEntry | null {
    const cache = this.entries[layerIndex];
    if (!cache) return null;
    const cached = cache.get(clip);
    if (cached !== undefined) return cached;
    const entry = this.createEntry(layerIndex, clip);
    cache.set(clip, entry);
    if (entry) this.resolvedEntries.push(entry);
    return entry;
  }

  private createEntry(layerIndex: number, clip: string): BindingEntry | null {
    const base = this.resolve(clip);
    if (!base) return null;
    if (layerIndex === 0) {
      return { action: base, owned: false, frame: -1, weight: 0, bestClipWeight: -1, time: 0, active: false };
    }
    const layer = this.layers[layerIndex];
    if (!layer) return null;
    const root = base.getRoot();
    let names = this.maskNames[layerIndex];
    if (names === undefined) {
      names = collectMaskNodeNames(root, layer);
      this.maskNames[layerIndex] = names;
    }
    const layerClip = filterClip(base.getClip(), names);
    const additive = layer.blending === 'additive';
    if (additive) THREE.AnimationUtils.makeClipAdditive(layerClip);
    const action = base.getMixer().clipAction(layerClip, root);
    action.blendMode = additive ? THREE.AdditiveAnimationBlendMode : THREE.NormalAnimationBlendMode;
    return { action, owned: true, frame: -1, weight: 0, bestClipWeight: -1, time: 0, active: false };
  }

  invalidate(): void {
    this.resolvedEntries.forEach((entry) => {
      const action = entry.action;
      if (entry.owned) {
        action.stop();
        const mixer = action.getMixer();
        mixer.uncacheAction(action.getClip(), action.getRoot());
        mixer.uncacheClip(action.getClip());
        return;
      }
      if (entry.active) action.stop();
      action.setEffectiveTimeScale(1);
      action.setEffectiveWeight(1);
    });
    this.resolvedEntries.length = 0;
    this.entries.forEach((cache) => cache.clear());
    this.maskNames.fill(undefined);
  }

  dispose(): void {
    this.invalidate();
  }
}
