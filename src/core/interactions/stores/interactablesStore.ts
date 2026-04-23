import * as THREE from 'three';
import { create } from 'zustand';

import type { RuntimeRecord } from '../../boilerplate/types';

export type InteractableKind = 'pickup' | 'npc' | 'door' | 'shop' | 'storage' | 'tool-target' | 'misc';

export type InteractableEntry = {
  id: string;
  kind: InteractableKind;
  label: string;
  position: THREE.Vector3;
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

type State = {
  entries: Map<string, InteractableEntry>;
  current: CurrentTarget;
  register: (e: InteractableEntry) => void;
  unregister: (id: string) => void;
  updatePosition: (id: string, position: THREE.Vector3) => void;
  getAll: () => InteractableEntry[];
  setCurrent: (t: CurrentTarget) => void;
  activateCurrent: () => void;
};

export const useInteractablesStore = create<State>((set, get) => ({
  entries: new Map<string, InteractableEntry>(),
  current: null,
  register: (e) => {
    const next = new Map(get().entries);
    next.set(e.id, e);
    set({ entries: next });
  },
  unregister: (id) => {
    const cur = get().entries;
    if (!cur.has(id)) return;
    const next = new Map(cur);
    next.delete(id);
    set({ entries: next });
  },
  updatePosition: (id, position) => {
    const cur = get().entries.get(id);
    if (!cur) return;
    cur.position.copy(position);
  },
  getAll: () => Array.from(get().entries.values()),
  setCurrent: (t) => {
    const cur = get().current;
    if (cur === t) return;
    if (cur && t && cur.id === t.id && Math.abs(cur.distance - t.distance) < 0.05) return;
    set({ current: t });
  },
  activateCurrent: () => {
    const cur = get().current;
    if (!cur) return;
    const e = get().entries.get(cur.id);
    if (e) e.onActivate();
  },
}));
