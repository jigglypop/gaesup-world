import * as THREE from 'three';
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
export declare const useInteractablesStore: import("zustand").UseBoundStore<import("zustand").StoreApi<State>>;
export {};
