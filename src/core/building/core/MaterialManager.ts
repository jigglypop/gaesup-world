import * as THREE from 'three';
import { MeshConfig } from '../types';

export class MaterialManager {
  private materials: Map<string, THREE.Material> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  getMaterial(meshConfig: MeshConfig): THREE.Material {
    const cached = this.materials.get(meshConfig.id);
    if (cached) return cached;

    const material = this.createMaterial(meshConfig);
    this.materials.set(meshConfig.id, material);
    return material;
  }

  private createMaterial(meshConfig: MeshConfig): THREE.Material {
    const baseOptions: THREE.MeshStandardMaterialParameters = {
      color: meshConfig.color || '#ffffff',
      roughness: meshConfig.roughness || 0.5,
      metalness: meshConfig.metalness || 0,
      opacity: meshConfig.opacity || 1,
      transparent: meshConfig.transparent || false,
    };

    if (meshConfig.material === 'GLASS') {
      return new THREE.MeshPhysicalMaterial({
        ...baseOptions,
        transmission: 0.98,
        roughness: 0.1,
        envMapIntensity: 1,
      });
    }

    if (meshConfig.mapTextureUrl) {
      baseOptions.map = this.loadTexture(meshConfig.mapTextureUrl);
    }

    if (meshConfig.normalTextureUrl) {
      baseOptions.normalMap = this.loadTexture(meshConfig.normalTextureUrl);
    }

    return new THREE.MeshStandardMaterial(baseOptions);
  }

  private loadTexture(url: string): THREE.Texture {
    const texture = this.textureLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  updateMaterial(meshId: string, updates: Partial<MeshConfig>): void {
    const material = this.materials.get(meshId);
    if (material && material instanceof THREE.MeshStandardMaterial) {
      if (updates.color) {
        material.color.set(updates.color);
      }
      if (updates.roughness !== undefined) {
        material.roughness = updates.roughness;
      }
      if (updates.metalness !== undefined) {
        material.metalness = updates.metalness;
      }
      if (updates.opacity !== undefined) {
        material.opacity = updates.opacity;
      }
      material.needsUpdate = true;
    }
  }

  dispose(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
  }
} 