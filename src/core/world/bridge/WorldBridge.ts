import { WorldSystem, WorldObject, InteractionEvent } from '../core/WorldSystem';
import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { ValidateCommand, LogSnapshot, CacheSnapshot } from '@core/boilerplate/decorators';
import { WorldCommand, WorldSnapshot, WorldBridgeState } from './types';
import * as THREE from 'three';

interface WorldSystemEntity {
  system: WorldSystem;
  state: WorldBridgeState;
  dispose: () => void;
}

@DomainBridge('world')
@EnableEventLog()
export class WorldBridge extends CoreBridge<WorldSystemEntity, WorldSnapshot, WorldCommand> {
  
  protected buildEngine(id: string, initialState?: Partial<WorldBridgeState>): WorldSystemEntity | null {
    const system = new WorldSystem();
    const state: WorldBridgeState = {
      selectedObjectId: initialState?.selectedObjectId,
      interactionMode: initialState?.interactionMode || 'view',
      showDebugInfo: initialState?.showDebugInfo || false,
    };
    
    return {
      system,
      state,
      dispose: () => system.dispose()
    };
  }

  @ValidateCommand()
  protected executeCommand(entity: WorldSystemEntity, command: WorldCommand, id: string): void {
    const { system, state } = entity;
    
    switch (command.type) {
      case 'addObject':
        const objectId = this.generateId();
        const worldObject: WorldObject = { ...command.data, id: objectId };
        system.addObject(worldObject);
        break;
        
      case 'removeObject':
        system.removeObject(command.data.id);
        if (state.selectedObjectId === command.data.id) {
          state.selectedObjectId = undefined;
        }
        break;
        
      case 'updateObject':
        system.updateObject(command.data.id, command.data.updates);
        break;
        
      case 'selectObject':
        state.selectedObjectId = command.data.id;
        break;
        
      case 'setInteractionMode':
        state.interactionMode = command.data.mode;
        break;
        
      case 'toggleDebugInfo':
        state.showDebugInfo = !state.showDebugInfo;
        break;
        
      case 'interact':
        const object = system.getObject(command.data.objectId);
        if (object && object.canInteract) {
          const event: InteractionEvent = {
            type: 'custom',
            object1Id: command.data.objectId,
            timestamp: Date.now(),
            data: { action: command.data.action }
          };
          system.processInteraction(event);
        }
        break;
        
      case 'cleanup':
        system.cleanup();
        state.selectedObjectId = undefined;
        state.interactionMode = 'view';
        state.showDebugInfo = false;
        break;
    }
  }

  @LogSnapshot()
  @CacheSnapshot(16) // 60fps 캐싱
  protected createSnapshot(entity: WorldSystemEntity, id: string): WorldSnapshot {
    const { system, state } = entity;
    
    return {
      objects: system.getAllObjects(),
      selectedObjectId: state.selectedObjectId,
      interactionMode: state.interactionMode,
      showDebugInfo: state.showDebugInfo,
      events: system.getRecentEvents(),
      // 추가 조회 기능들을 함수로 제공
      objectsInRadius: (center: THREE.Vector3, radius: number) => 
        system.getObjectsInRadius(center, radius),
      objectsByType: (type: WorldObject['type']) => 
        system.getObjectsByType(type),
      raycast: (origin: THREE.Vector3, direction: THREE.Vector3) => {
        const result = system.raycast(origin, direction);
        return result?.object || null;
      }
    };
  }

  // 편의 메서드들 (기존 API 호환성 유지)
  addObject(id: string, object: Omit<WorldObject, 'id'>): void {
    this.execute(id, { type: 'addObject', data: object });
  }

  removeObject(id: string, objectId: string): void {
    this.execute(id, { type: 'removeObject', data: { id: objectId } });
  }

  updateObject(id: string, objectId: string, updates: Partial<WorldObject>): void {
    this.execute(id, { type: 'updateObject', data: { id: objectId, updates } });
  }

  selectObject(id: string, objectId?: string): void {
    this.execute(id, { type: 'selectObject', data: { id: objectId } });
  }

  setInteractionMode(id: string, mode: 'view' | 'edit' | 'interact'): void {
    this.execute(id, { type: 'setInteractionMode', data: { mode } });
  }

  toggleDebugInfo(id: string): void {
    this.execute(id, { type: 'toggleDebugInfo' });
  }

  interact(id: string, objectId: string, action: string): void {
    this.execute(id, { type: 'interact', data: { objectId, action } });
  }

  cleanup(id: string): void {
    this.execute(id, { type: 'cleanup' });
  }

  // 조회 메서드들
  getObjectsInRadius(id: string, center: THREE.Vector3, radius: number): WorldObject[] {
    const entity = this.getEngine(id);
    if (!entity) return [];
    return entity.system.getObjectsInRadius(center, radius);
  }

  getObjectsByType(id: string, type: WorldObject['type']): WorldObject[] {
    const entity = this.getEngine(id);
    if (!entity) return [];
    return entity.system.getObjectsByType(type);
  }

  raycast(id: string, origin: THREE.Vector3, direction: THREE.Vector3): WorldObject | null {
    const entity = this.getEngine(id);
    if (!entity) return null;
    const result = entity.system.raycast(origin, direction);
    return result?.object || null;
  }

  private generateId(): string {
    return `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
