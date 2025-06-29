import * as THREE from 'three';
export interface WorldObject {
    id: string;
    position: THREE.Vector3;
    rotation: THREE.Euler;
    scale: THREE.Vector3;
    type: 'active' | 'passive' | 'rideable' | 'static';
    metadata?: Record<string, any>;
    boundingBox?: THREE.Box3;
    isActive?: boolean;
    canInteract?: boolean;
}
export interface RideableObject extends WorldObject {
    type: 'rideable';
    maxSpeed: number;
    acceleration: number;
    isOccupied: boolean;
    occupant?: string;
    controls: {
        forward: boolean;
        backward: boolean;
        left: boolean;
        right: boolean;
    };
}
export interface InteractionEvent {
    type: 'collision' | 'proximity' | 'custom';
    object1Id: string;
    object2Id?: string;
    timestamp: number;
    data?: any;
}
export declare class WorldEngine {
    private objects;
    private interactionEvents;
    private spatial;
    addObject(object: WorldObject): void;
    removeObject(id: string): boolean;
    getObject(id: string): WorldObject | undefined;
    getAllObjects(): WorldObject[];
    getObjectsByType(type: WorldObject['type']): WorldObject[];
    updateObject(id: string, updates: Partial<WorldObject>): boolean;
    getObjectsInRadius(center: THREE.Vector3, radius: number): WorldObject[];
    checkCollisions(objectId: string): WorldObject[];
    processInteraction(event: InteractionEvent): void;
    getRecentEvents(timeWindow?: number): InteractionEvent[];
    raycast(origin: THREE.Vector3, direction: THREE.Vector3, maxDistance?: number): {
        object: WorldObject;
        distance: number;
        point: THREE.Vector3;
    } | null;
    cleanup(): void;
}
