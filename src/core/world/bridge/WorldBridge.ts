import * as THREE from 'three';

import { CoreBridge, DomainBridge, EnableEventLog } from '@core/boilerplate';
import { ValidateCommand, LogSnapshot } from '@core/boilerplate/decorators';

import { WorldCommand, WorldSnapshot, WorldBridgeState } from './types';
import { WorldSystem, WorldObject, InteractionEvent } from '../core/WorldSystem';


interface WorldSystemEntity {
  system: WorldSystem;
  state: WorldBridgeState;
  revision: number;
  dispose: () => void;
}

@DomainBridge('world')
@EnableEventLog()
export class WorldBridge extends CoreBridge<WorldSystemEntity, WorldSnapshot, WorldCommand> {
  private enabled = true;
  private snapshotCache = new WeakMap<WorldSystemEntity, { revision: number; systemRevision: number; expires: number; value: WorldSnapshot }>();

  suspend(): void { this.enabled = false; }
  resume(): void { this.enabled = true; }
  override execute(id: string, command: WorldCommand): void {
    if (this.enabled) super.execute(id, command);
  }
  
  protected buildEngine(id: string, initialState?: Partial<WorldBridgeState>): WorldSystemEntity | null {
    if (!this.enabled) return null;
    void id;
    const system = new WorldSystem();
    const state: WorldBridgeState = {
      ...(initialState?.selectedObjectId !== undefined
        ? { selectedObjectId: initialState.selectedObjectId }
        : {}),
      interactionMode: initialState?.interactionMode ?? 'view',
      showDebugInfo: initialState?.showDebugInfo ?? false,
    };
    
    return {
      system,
      state,
      revision: 0,
      dispose: () => system.dispose()
    };
  }

  @ValidateCommand()
  protected executeCommand(entity: WorldSystemEntity, command: WorldCommand, id: string): void {
    if (!this.enabled) return;
    entity.revision++;
    void id;
    const { system, state } = entity;
    
    switch (command.type) {
      case 'clearEvents':
        system.clearEvents();
        break;
      case 'addObject':
        // Allow callers to supply an id (so state-layer APIs can return the real id).
        const { id: providedId, ...rest } = command.data;
        const objectId = typeof providedId === 'string' && providedId.length > 0 ? providedId : this.generateId();
        const worldObject: WorldObject = { ...rest, id: objectId };
        system.addObject(worldObject);
        break;
        
      case 'removeObject':
        system.removeObject(command.data.id);
        if (state.selectedObjectId === command.data.id) {
          delete state.selectedObjectId;
        }
        break;
        
      case 'updateObject':
        system.updateObject(command.data.id, command.data.updates);
        break;
        
      case 'selectObject':
        if (command.data.id !== undefined) {
          state.selectedObjectId = command.data.id;
        } else {
          delete state.selectedObjectId;
        }
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
        delete state.selectedObjectId;
        state.interactionMode = 'view';
        state.showDebugInfo = false;
        break;
    }
  }

  @LogSnapshot()
  protected createSnapshot(entity: WorldSystemEntity, id: string): WorldSnapshot {
    void id;
    const { system, state } = entity;
    const systemRevision = system.getRevision();
    const revision = entity.revision + systemRevision;
    const cached = this.snapshotCache.get(entity);
    const unexpired = cached && Date.now() < cached.expires;
    if (cached?.revision === revision && unexpired) return cached.value;
    const sameSystem = cached?.systemRevision === systemRevision;
    const events = sameSystem && unexpired ? cached.value.events : system.getRecentEvents();
    
    const value: WorldSnapshot = {
      objects: sameSystem ? cached.value.objects : system.getAllObjects(),
      ...(state.selectedObjectId !== undefined ? { selectedObjectId: state.selectedObjectId } : {}),
      interactionMode: state.interactionMode,
      showDebugInfo: state.showDebugInfo,
      events,
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
    const expires = events.reduce((time, event) => Math.min(time, event.timestamp + 1001), Infinity);
    this.snapshotCache.set(entity, { revision, systemRevision, expires, value });
    return value;
  }

  // 편의 메서드들 (기존 API 호환성 유지)
  addObject(id: string, object: Omit<WorldObject, 'id'> & { id?: string }): string {
    if (!this.enabled || !this.getEngine(id)) return '';
    const providedId = object.id;
    const objectId = typeof providedId === 'string' && providedId.length > 0 ? providedId : this.generateId();
    this.execute(id, { type: 'addObject', data: { ...object, id: objectId } });
    return objectId;
  }

  removeObject(id: string, objectId: string): void {
    this.execute(id, { type: 'removeObject', data: { id: objectId } });
  }

  updateObject(id: string, objectId: string, updates: Partial<WorldObject>): void {
    this.execute(id, { type: 'updateObject', data: { id: objectId, updates } });
  }

  selectObject(id: string, objectId?: string): void {
    this.execute(
      id,
      { type: 'selectObject', data: objectId !== undefined ? { id: objectId } : {} },
    );
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

  clearEvents(id: string): void { this.execute(id, { type: 'clearEvents' }); }

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
