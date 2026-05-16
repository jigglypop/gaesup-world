import * as THREE from 'three';
import { MeshConfig } from '../types';
export declare class MaterialManager {
    private materials;
    private textures;
    private textureLoader;
    constructor();
    getMaterial(meshConfig: MeshConfig): THREE.Material;
    private createMaterialKey;
    private createMaterial;
    private loadTexture;
    updateMaterial(meshId: string, updates: Partial<MeshConfig>): void;
    dispose(): void;
}
