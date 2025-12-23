import { useCallback, useState } from 'react';

import * as THREE from 'three';

import { BridgeFactory } from '../../core/boilerplate';
import { useGaesupStore } from '../../core/stores/gaesupStore';
import { WorldBridge } from '../../core/world/bridge/WorldBridge';
import { blueprintRegistry } from '../registry';
import { AnyBlueprint } from '../types';


export type SpawnOptions = {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  metadata?: Record<string, unknown>;
};

export type SpawnedEntity = {
  id: string;
  blueprintId: string;
  type: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  metadata?: Record<string, unknown>;
};

const DEFAULT_WORLD_ID = 'default';

export function useSpawnFromBlueprint() {
  const [isSpawning, setIsSpawning] = useState(false);
  const [lastSpawnedEntity, setLastSpawnedEntity] = useState<SpawnedEntity | null>(null);
  const setMode = useGaesupStore((state) => state.setMode);

  const spawnEntity = useCallback(async (
    blueprintId: string,
    options: SpawnOptions = {}
  ): Promise<SpawnedEntity | null> => {
    setIsSpawning(true);
    
    try {
      const blueprint = blueprintRegistry.get(blueprintId);
      if (!blueprint) {
        console.error(`Blueprint not found: ${blueprintId}`);
        return null;
      }

      const entityId = `${blueprint.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const position = options.position || [0, 0, 0];
      const rotation = options.rotation || [0, 0, 0];
      const scale = options.scale || [1, 1, 1];

      const worldObject = createWorldObject(entityId, blueprint, position, rotation, scale, options.metadata);
      
      // BridgeFactory를 통해 WorldBridge 인스턴스 가져오기
      const worldBridge = BridgeFactory.get<WorldBridge>('world');
      if (!worldBridge) {
        console.error('WorldBridge not found. Make sure it is properly initialized.');
        return null;
      }

      worldBridge.addObject(DEFAULT_WORLD_ID, worldObject);
      
      if (blueprint.type === 'character') {
        setMode({ type: 'character', characterUrl: blueprint.metadata?.['modelUrl'] as string || '' });
      } else if (blueprint.type === 'vehicle') {
        setMode({ type: 'vehicle', vehicleUrl: blueprint.metadata?.['modelUrl'] as string || '' });
      } else if (blueprint.type === 'airplane') {
        setMode({ type: 'airplane', airplaneUrl: blueprint.metadata?.['modelUrl'] as string || '' });
      }

      const spawnedEntity: SpawnedEntity = {
        id: entityId,
        blueprintId: blueprint.id,
        type: blueprint.type,
        position,
        rotation,
        scale,
        metadata: options.metadata || {}
      };

      setLastSpawnedEntity(spawnedEntity);
      return spawnedEntity;
    } catch (error) {
      console.error('Failed to spawn entity:', error);
      return null;
    } finally {
      setIsSpawning(false);
    }
  }, [setMode]);

  const spawnAtCursor = useCallback(async (blueprintId: string): Promise<SpawnedEntity | null> => {
    const camera = (window as any).__camera;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(0, 0);
    
    raycaster.setFromCamera(mouse, camera);
    const scene = (window as any).__scene;
    const intersects = scene ? raycaster.intersectObjects(scene.children, true) : [];
    
    let position: [number, number, number] = [0, 0, 0];
    if (intersects.length > 0 && intersects[0].point) {
      const point = intersects[0].point;
      position = [point.x, point.y, point.z];
    }
    
    return spawnEntity(blueprintId, { position });
  }, [spawnEntity]);

  const spawnMultiple = useCallback(async (
    blueprintId: string,
    count: number,
    options: SpawnOptions & { spacing?: number } = {}
  ): Promise<SpawnedEntity[]> => {
    const entities: SpawnedEntity[] = [];
    const spacing = options.spacing || 2;
    const basePosition = options.position || [0, 0, 0];
    
    for (let i = 0; i < count; i++) {
      const position: [number, number, number] = [
        basePosition[0] + (i % 5) * spacing,
        basePosition[1],
        basePosition[2] + Math.floor(i / 5) * spacing
      ];
      
      const entity = await spawnEntity(blueprintId, { ...options, position });
      if (entity) {
        entities.push(entity);
      }
    }
    
    return entities;
  }, [spawnEntity]);

  return {
    spawnEntity,
    spawnAtCursor,
    spawnMultiple,
    isSpawning,
    lastSpawnedEntity
  };
}

function createWorldObject(
  id: string,
  blueprint: AnyBlueprint,
  position: [number, number, number],
  rotation: [number, number, number],
  scale: [number, number, number],
  metadata?: Record<string, unknown>
) {
  const baseObject = {
    id,
    name: blueprint.name,
    position: new THREE.Vector3(...position),
    rotation: new THREE.Euler(...rotation),
    scale: new THREE.Vector3(...scale),
    visible: true,
    locked: false,
    metadata: {
      blueprintId: blueprint.id,
      ...blueprint.metadata,
      ...metadata
    }
  };

  const charBlueprint = blueprint as any;
  const vehicleBlueprint = blueprint as any;
  const airplaneBlueprint = blueprint as any;
  
  return {
    ...baseObject,
    type: 'active' as const,
    isActive: true,
    canInteract: true,
    metadata: {
      ...baseObject.metadata,
      blueprintType: blueprint.type,
      characterUrl: charBlueprint.visuals?.model || '',
      vehicleUrl: vehicleBlueprint.visuals?.model || '',
      airplaneUrl: airplaneBlueprint.visuals?.model || '',
      currentAnimation: 'idle',
      stats: charBlueprint.stats,
      seats: vehicleBlueprint.seats || airplaneBlueprint.seats,
      health: charBlueprint.stats?.health || 100,
      maxHealth: charBlueprint.stats?.health || 100,
      energy: charBlueprint.stats?.stamina || 100,
      maxEnergy: charBlueprint.stats?.stamina || 100,
      fuel: 100,
      maxFuel: 100,
      altitude: 0
    }
  };
} 