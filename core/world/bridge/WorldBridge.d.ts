import * as THREE from 'three';
import { CoreBridge } from '@core/boilerplate';
import { WorldCommand, WorldSnapshot, WorldBridgeState } from './types';
import { WorldSystem, WorldObject } from '../core/WorldSystem';
interface WorldSystemEntity {
    system: WorldSystem;
    state: WorldBridgeState;
    dispose: () => void;
}
export declare class WorldBridge extends CoreBridge<WorldSystemEntity, WorldSnapshot, WorldCommand> {
    protected buildEngine(id: string, initialState?: Partial<WorldBridgeState>): WorldSystemEntity | null;
    protected executeCommand(entity: WorldSystemEntity, command: WorldCommand, id: string): void;
    protected createSnapshot(entity: WorldSystemEntity, id: string): WorldSnapshot;
    addObject(id: string, object: Omit<WorldObject, 'id'> & {
        id?: string;
    }): string;
    removeObject(id: string, objectId: string): void;
    updateObject(id: string, objectId: string, updates: Partial<WorldObject>): void;
    selectObject(id: string, objectId?: string): void;
    setInteractionMode(id: string, mode: 'view' | 'edit' | 'interact'): void;
    toggleDebugInfo(id: string): void;
    interact(id: string, objectId: string, action: string): void;
    cleanup(id: string): void;
    getObjectsInRadius(id: string, center: THREE.Vector3, radius: number): WorldObject[];
    getObjectsByType(id: string, type: WorldObject['type']): WorldObject[];
    raycast(id: string, origin: THREE.Vector3, direction: THREE.Vector3): WorldObject | null;
    private generateId;
}
export {};
