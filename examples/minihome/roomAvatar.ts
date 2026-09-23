import type { Group } from 'three';

import type { AssetRecord } from 'gaesup-world/assets';
import { AvatarRuntime, avatarManifestFromRecord, type AvatarState } from 'gaesup-world/avatar';

import type { RoomAvatarStyle } from './roomTypes';

const OUTFITS: Record<Exclude<RoomAvatarStyle, 'classic'>, AvatarState> = {
  coral: { body: 'body-sd-neutral-v1', equipment: { hair: 'hair-001', top: 'top-001', bottom: 'bottom-001', shoes: 'shoes-001' } },
  blue: { body: 'body-sd-neutral-v1', equipment: { hair: 'hair-002', top: 'top-002', bottom: 'bottom-002', shoes: 'shoes-002', hat: 'hat-001' } },
  mint: { body: 'body-sd-neutral-v1', equipment: { hair: 'hair-003', onepiece: 'onepiece-001', shoes: 'shoes-001', bag: 'bag-001' } },
};

/** The room owns instances; AvatarRuntime owns skeletons and shared GLTF leases. */
export function createRoomAvatar(parent: Group, signal: AbortSignal, invalidate: () => void) {
  const fallback = [...parent.children];
  let current: AvatarRuntime | null = null;
  let style: RoomAvatarStyle = 'classic';
  let generation = 0;
  let disposed = false;
  let catalog: Promise<Map<string, AssetRecord>> | undefined;
  const pending = new Set<AvatarRuntime>();
  const poses = new WeakMap<AvatarRuntime, string>();
  const assetUrl = (uri: string) => `${import.meta.env.BASE_URL}${uri.replace(/^\//, '')}`;
  function records() {
    return catalog ??= fetch(assetUrl('/gltf/avatars/manual-v1/catalog.json'), { signal }).then(async response => {
      if (!response.ok) throw new Error(`아바타 목록을 불러오지 못했습니다 (${response.status}).`);
      const rows: AssetRecord[] = await response.json();
      return new Map(rows.map(record => {
        const manifest = avatarManifestFromRecord(record);
        manifest.source.uri = assetUrl(manifest.source.uri);
        for (const lod of manifest.lods ?? []) lod.source.uri = assetUrl(lod.source.uri);
        return [record.id, { ...record, metadata: { ...record.metadata, avatar: manifest } }];
      }));
    }).catch(error => { catalog = undefined; throw error; });
  }
  function pose(runtime: AvatarRuntime, moving: boolean, delta: number) {
    const name = moving ? 'walk' : 'idle';
    if (poses.get(runtime) !== name) {
      runtime.playAnimation(name);
      poses.set(runtime, name);
      // Settle the transition once when idle, then let the room's demand loop sleep.
      if (!moving) runtime.update(0.5);
    }
    runtime.update(delta);
  }
  return {
    async setStyle(next: RoomAvatarStyle) {
      if (disposed || signal.aborted) return;
      const request = ++generation;
      if (next === style) return;
      if (next === 'classic') {
        current?.dispose(); current = null; style = next;
        for (const object of fallback) object.visible = true;
        invalidate(); return;
      }
      const assets = await records();
      if (disposed || signal.aborted || request !== generation) return;
      const candidate = new AvatarRuntime({ avatarId: 'miniroom-avatar', getAsset: id => assets.get(id) });
      pending.add(candidate);
      try {
        await candidate.restore(OUTFITS[next]);
        if (disposed || signal.aborted || request !== generation) { candidate.dispose(); return; }
        candidate.scene.scale.setScalar(0.9);
        pose(candidate, false, 0);
        parent.add(candidate.scene);
        current?.dispose(); current = candidate; style = next;
        for (const object of fallback) object.visible = false;
        invalidate();
      } catch (error) { candidate.dispose(); throw error; }
      finally { pending.delete(candidate); }
    },
    update(moving: boolean, delta: number) { if (current) pose(current, moving, delta); },
    diagnostics: () => ({ style, status: pending.size ? 'loading' as const : 'ready' as const, ...(current ? current.getDiagnostics() : {}) }),
    dispose() {
      if (disposed) return;
      disposed = true; generation++;
      for (const runtime of pending) runtime.dispose();
      pending.clear(); current?.dispose(); current = null;
    },
  };
}
