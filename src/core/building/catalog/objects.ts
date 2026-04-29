import type { BuildingModelFallbackKind } from '../types';

export type BuildingObjectCatalogItem = {
  id: string;
  label: string;
  category: 'structure' | 'furniture' | 'utility' | 'shop' | 'decor';
  fallbackKind: BuildingModelFallbackKind;
  defaultScale: number;
  defaultColor: string;
  modelUrl?: string;
};

export const DEFAULT_BUILDING_OBJECT_CATALOG: BuildingObjectCatalogItem[] = [
  { id: 'door-basic', label: 'Door', category: 'structure', fallbackKind: 'door', defaultScale: 1, defaultColor: '#8b5a2b', modelUrl: 'gltf/props/door.glb' },
  { id: 'window-basic', label: 'Window', category: 'structure', fallbackKind: 'window', defaultScale: 1, defaultColor: '#9fd3ff', modelUrl: 'gltf/props/window.glb' },
  { id: 'fence-basic', label: 'Fence', category: 'structure', fallbackKind: 'fence', defaultScale: 1, defaultColor: '#8f6a3d', modelUrl: 'gltf/props/fence.glb' },
  { id: 'lamp-basic', label: 'Lamp', category: 'utility', fallbackKind: 'lamp', defaultScale: 1, defaultColor: '#ffd166', modelUrl: 'gltf/props/lamp.glb' },
  { id: 'chair-basic', label: 'Chair', category: 'furniture', fallbackKind: 'chair', defaultScale: 1, defaultColor: '#a6784f', modelUrl: 'gltf/props/chair.glb' },
  { id: 'table-basic', label: 'Table', category: 'furniture', fallbackKind: 'table', defaultScale: 1, defaultColor: '#9b6b43', modelUrl: 'gltf/props/table.glb' },
  { id: 'bed-basic', label: 'Bed', category: 'furniture', fallbackKind: 'bed', defaultScale: 1, defaultColor: '#7aa2ff', modelUrl: 'gltf/props/bed.glb' },
  { id: 'storage-basic', label: 'Storage', category: 'furniture', fallbackKind: 'storage', defaultScale: 1, defaultColor: '#7c5c3e', modelUrl: 'gltf/props/storage.glb' },
  { id: 'mailbox-basic', label: 'Mailbox', category: 'utility', fallbackKind: 'mailbox', defaultScale: 1, defaultColor: '#d04f45', modelUrl: 'gltf/props/mailbox.glb' },
  { id: 'crafting-basic', label: 'Crafting Station', category: 'utility', fallbackKind: 'crafting', defaultScale: 1, defaultColor: '#b68553', modelUrl: 'gltf/props/crafting.glb' },
  { id: 'shop-stall-basic', label: 'Shop Stall', category: 'shop', fallbackKind: 'shop', defaultScale: 1, defaultColor: '#d88f45', modelUrl: 'gltf/props/shop-stall.glb' },
];

export function getDefaultBuildingObject(id: string): BuildingObjectCatalogItem | undefined {
  return DEFAULT_BUILDING_OBJECT_CATALOG.find((item) => item.id === id);
}
