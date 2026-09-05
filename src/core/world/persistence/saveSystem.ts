import type { CameraSaveData, NPCSaveData, SaveData, SaveMetadata, WorldSaveData } from './types';
import { collectSaveDomains } from '../../platform';
import type { SaveSystem, SerializedDomainValue } from '../../save';

export const DEFAULT_WORLD_SAVE_ENVIRONMENT: WorldSaveData['environment'] = {
  lighting: {
    ambientIntensity: 1,
    directionalIntensity: 1,
    directionalPosition: { x: 0, y: 10, z: 0 },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneSaveValue<T>(value: unknown): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

function cloneArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value.map((item) => cloneSaveValue<T>(item)) : [];
}

function getDomainRecord(
  domains: Record<string, SerializedDomainValue>,
  key: string,
): Record<string, unknown> | undefined {
  const value = domains[key];
  return isRecord(value) ? value : undefined;
}

function toVector3Record(value: unknown): { x: number; y: number; z: number } | undefined {
  if (Array.isArray(value) && value.length >= 3) {
    const [x, y, z] = value;
    if (typeof x === 'number' && typeof y === 'number' && typeof z === 'number') {
      return { x, y, z };
    }
  }

  if (
    isRecord(value) &&
    typeof value['x'] === 'number' &&
    typeof value['y'] === 'number' &&
    typeof value['z'] === 'number'
  ) {
    return { x: value['x'], y: value['y'], z: value['z'] };
  }

  return undefined;
}

function toNpcSaveData(value: unknown): NPCSaveData | null {
  if (!isRecord(value) || typeof value['id'] !== 'string') return null;

  const position = toVector3Record(value['position']) ?? { x: 0, y: 0, z: 0 };
  const rotation = toVector3Record(value['rotation']) ?? { x: 0, y: 0, z: 0 };
  const metadata = isRecord(value['metadata']) ? cloneSaveValue<NPCSaveData['metadata']>(value['metadata']) : undefined;
  const behaviorRecord = isRecord(value['behavior']) ? value['behavior'] : undefined;
  const behavior = behaviorRecord && typeof behaviorRecord['mode'] === 'string'
    ? behaviorRecord['mode']
    : undefined;

  return {
    id: value['id'],
    name: typeof value['name'] === 'string' ? value['name'] : value['id'],
    position,
    rotation,
    ...(typeof value['modelUrl'] === 'string' ? { modelUrl: value['modelUrl'] } : {}),
    ...(behavior ? { behavior } : {}),
    ...(metadata ? { metadata } : {}),
  };
}

function createNpcSaveDataFromDomain(domain: Record<string, unknown> | undefined): NPCSaveData[] {
  const instances = domain?.['instances'];
  if (!Array.isArray(instances)) return [];
  return instances
    .map(toNpcSaveData)
    .filter((npc): npc is NPCSaveData => npc !== null);
}

export function createCameraSaveDataFromDomain(
  domain: Record<string, unknown> | undefined,
): CameraSaveData | undefined {
  if (!domain) return undefined;

  const cameraOption = isRecord(domain['cameraOption']) ? domain['cameraOption'] : domain;
  const position = toVector3Record(cameraOption['position']);
  if (!position) return undefined;

  const rotation = toVector3Record(cameraOption['rotation']) ?? { x: 0, y: 0, z: 0 };
  const modeRecord = isRecord(domain['mode']) ? domain['mode'] : undefined;
  const mode = typeof domain['mode'] === 'string'
    ? domain['mode']
    : modeRecord && typeof modeRecord['control'] === 'string'
      ? modeRecord['control']
      : 'default';
  const settings = isRecord(domain['settings'])
    ? cloneSaveValue<CameraSaveData['settings']>(domain['settings'])
    : isRecord(domain['cameraOption'])
      ? cloneSaveValue<CameraSaveData['settings']>(domain['cameraOption'])
      : undefined;

  return {
    position,
    rotation,
    mode,
    ...(settings ? { settings } : {}),
  };
}

export function createWorldDataFromSaveDomains(
  domains: Record<string, SerializedDomainValue>,
  worldId: string,
  worldName: string,
): WorldSaveData {
  const building = getDomainRecord(domains, 'building');
  const camera = createCameraSaveDataFromDomain(getDomainRecord(domains, 'camera'));

  return {
    id: worldId,
    name: worldName,
    buildings: {
      wallGroups: cloneArray<WorldSaveData['buildings']['wallGroups'][number]>(building?.['wallGroups']),
      tileGroups: cloneArray<WorldSaveData['buildings']['tileGroups'][number]>(building?.['tileGroups']),
      blocks: cloneArray<NonNullable<WorldSaveData['buildings']['blocks']>[number]>(building?.['blocks']),
      meshes: cloneArray<WorldSaveData['buildings']['meshes'][number]>(building?.['meshes']),
    },
    npcs: createNpcSaveDataFromDomain(getDomainRecord(domains, 'npc')),
    environment: DEFAULT_WORLD_SAVE_ENVIRONMENT,
    ...(camera ? { camera } : {}),
  };
}

export function parseWorldSaveTimestamp(saveId: string): number {
  const rawTimestamp = saveId.slice(saveId.lastIndexOf('_') + 1);
  const timestamp = Number(rawTimestamp);
  return Number.isFinite(timestamp) ? timestamp : Date.now();
}

export function parseWorldSaveId(saveId: string): string {
  const separatorIndex = saveId.lastIndexOf('_');
  return separatorIndex > 0 ? saveId.slice(0, separatorIndex) : saveId;
}

export function normalizeSaveMetadata(
  metadata: Partial<SaveMetadata> | undefined,
  timestamp: number,
): SaveMetadata | undefined {
  if (!metadata) return undefined;
  return {
    ...metadata,
    createdAt: metadata.createdAt ?? timestamp,
    updatedAt: metadata.updatedAt ?? timestamp,
  };
}

export function createSaveDataFromSaveSystem(
  saveSystem: SaveSystem,
  saveId: string,
  worldName?: string,
  metadata?: Partial<SaveMetadata>,
): SaveData {
  const timestamp = parseWorldSaveTimestamp(saveId);
  const worldId = parseWorldSaveId(saveId);
  const saveData: SaveData = {
    version: '1.0.0',
    timestamp,
    world: createWorldDataFromSaveDomains(
      collectSaveDomains(saveSystem),
      worldId,
      worldName ?? worldId,
    ),
  };

  const normalizedMetadata = normalizeSaveMetadata(metadata, timestamp);
  return normalizedMetadata ? { ...saveData, metadata: normalizedMetadata } : saveData;
}
