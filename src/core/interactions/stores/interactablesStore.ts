import * as THREE from 'three';
import { create } from 'zustand';

import type { RuntimeRecord } from '../../boilerplate/types';
import { useGaesupRuntime } from '../../runtime/runtimeContext';
import { lazyScopedStore } from '../../stores/scopedStore';

export type InteractableKind = 'pickup' | 'npc' | 'door' | 'shop' | 'storage' | 'tool-target' | 'misc';

export type InteractableEntry = {
  id: string;
  kind: InteractableKind;
  label: string;
  position: THREE.Vector3;
  /** Live world position, evaluated during tracking rather than on every React render. */
  getPosition?: () => THREE.Vector3;
  range: number;
  key: string;
  data?: RuntimeRecord;
  onActivate: () => void;
};

export type CurrentTarget = {
  id: string;
  label: string;
  key: string;
  distance: number;
} | null;

export type InteractablesState = {
  entries: Map<string, InteractableEntry>;
  current: CurrentTarget;
  register: (e: InteractableEntry) => () => void;
  unregister: (id: string) => void;
  updatePosition: (id: string, position: THREE.Vector3) => void;
  getAll: () => InteractableEntry[];
  setCurrent: (t: CurrentTarget) => void;
  activateCurrent: () => boolean;
  track: (position: THREE.Vector3, elapsedMs: number, throttleMs?: number) => void;
  suspend: () => void;
  resume: () => void;
  getStats: () => { active: boolean; scans: number; visited: number };
};

export function createInteractablesStore(active = true) {
  let enabled = active; let lastScan = -Infinity; let scans = 0; let visited = 0;
  let trackedPosition: THREE.Vector3 | undefined;
  return create<InteractablesState>((set, get) => ({
  entries: new Map<string, InteractableEntry>(),
  current: null,
  register: (e) => {
    const entry = { ...e, position: e.position.clone() };
    const next = new Map(get().entries);
    next.set(e.id, entry); lastScan = -Infinity;
    const current = get().current;
    set({ entries: next, ...(current?.id === e.id ? { current: { ...current, label: e.label, key: e.key } } : {}) });
    return () => { if (get().entries.get(e.id) === entry) get().unregister(e.id); };
  },
  unregister: (id) => {
    const cur = get().entries;
    if (!cur.has(id)) return;
    const next = new Map(cur);
    next.delete(id);
    lastScan = -Infinity;
    set({ entries: next, ...(get().current?.id === id ? { current: null } : {}) });
  },
  updatePosition: (id, position) => {
    const cur = get().entries.get(id);
    if (!cur) return;
    cur.position.copy(position);
  },
  getAll: () => Array.from(get().entries.values()),
  setCurrent: (t) => {
    if (!enabled || (t && !get().entries.has(t.id))) t = null;
    const cur = get().current;
    if (cur === t) return;
    // Prompts show one decimal; skip updates that would render the same text.
    if (cur && t && cur.id === t.id && cur.label === t.label && cur.key === t.key && Math.round(cur.distance * 10) === Math.round(t.distance * 10)) return;
    set({ current: t });
  },
  activateCurrent: () => {
    if (!enabled) return false;
    const cur = get().current;
    if (!cur) return false;
    const e = get().entries.get(cur.id);
    if (!e) return false;
    const distance = trackedPosition ? (e.getPosition?.() ?? e.position).distanceTo(trackedPosition) : cur.distance;
    if (!Number.isFinite(distance) || distance > e.range || e.range < 0) { get().setCurrent(null); return false; }
    e.onActivate(); return true;
  },
  track: (position, elapsedMs, throttleMs = 80) => {
    if (!enabled || !Number.isFinite(elapsedMs)) return;
    (trackedPosition ??= new THREE.Vector3()).copy(position);
    if (elapsedMs >= lastScan && elapsedMs - lastScan < Math.max(0.001, throttleMs)) return;
    lastScan = elapsedMs; scans++;
    let nearest: InteractableEntry | undefined; let distanceSquared = Infinity;
    for (const entry of get().entries.values()) {
      visited++;
      const target = entry.getPosition?.() ?? entry.position;
      const distance = target.distanceToSquared(position);
      if (Number.isFinite(distance) && entry.range >= 0 && distance <= entry.range * entry.range && distance < distanceSquared) {
        nearest = entry; distanceSquared = distance;
      }
    }
    get().setCurrent(nearest ? { id: nearest.id, label: nearest.label, key: nearest.key, distance: Math.sqrt(distanceSquared) } : null);
  },
  suspend: () => { enabled = false; lastScan = -Infinity; trackedPosition = undefined; if (get().current) set({ current: null }); },
  resume: () => { if (!enabled) { enabled = true; lastScan = -Infinity; } },
  getStats: () => ({ active: enabled, scans, visited }),
  }));
}
export type InteractablesStore = ReturnType<typeof createInteractablesStore>;
/** Hook calls follow the provider; static methods retain the legacy default. */
export const { useStore: useInteractablesStore, useStoreApi: useInteractablesStoreApi } = lazyScopedStore(
  'useInteractablesStore', () => createInteractablesStore(), () => useGaesupRuntime()?.interactablesStore,
);
