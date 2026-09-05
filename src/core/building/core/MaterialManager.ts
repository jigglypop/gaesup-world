import * as THREE from 'three';

import { Profile, HandleError, MonitorMemory } from '@/core/boilerplate/decorators';
import { getDefaultToonMode, getToonGradient } from '@/core/rendering/toon';

import { MeshConfig } from '../types';

export class MaterialManager {
  private materials: Map<string, THREE.Material> = new Map();
  private textures: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  @HandleError()
  @Profile()
  getMaterial(meshConfig: MeshConfig): THREE.Material {
    const key = this.createMaterialKey(meshConfig);
    const cached = this.materials.get(key);
    if (cached) return cached;

    const material = this.createMaterial(meshConfig);
    this.materials.set(key, material);
    return material;
  }

  private createMaterialKey(meshConfig: MeshConfig): string {
    return [
      meshConfig.id,
      meshConfig.assetId ?? '',
      meshConfig.color ?? meshConfig.materialParams?.color ?? '',
      meshConfig.material ?? '',
      meshConfig.textureUrl ?? '',
      meshConfig.mapTextureUrl ?? meshConfig.materialParams?.mapTextureUrl ?? '',
      meshConfig.normalTextureUrl ?? meshConfig.materialParams?.normalTextureUrl ?? '',
      meshConfig.roughness ?? meshConfig.materialParams?.roughness ?? '',
      meshConfig.metalness ?? meshConfig.materialParams?.metalness ?? '',
      meshConfig.opacity ?? meshConfig.materialParams?.opacity ?? '',
      meshConfig.transparent ?? meshConfig.materialParams?.transparent ?? '',
    ].join('|');
  }

  @HandleError()
  @Profile()
  private createMaterial(meshConfig: MeshConfig): THREE.Material {
    const color = meshConfig.color ?? meshConfig.materialParams?.color ?? '#ffffff';
    const roughness = meshConfig.roughness ?? meshConfig.materialParams?.roughness ?? 0.5;
    const metalness = meshConfig.metalness ?? meshConfig.materialParams?.metalness ?? 0;
    const opacity = meshConfig.opacity ?? meshConfig.materialParams?.opacity ?? 1;
    const transparent = meshConfig.transparent ?? meshConfig.materialParams?.transparent ?? false;
    const mapTextureUrl = meshConfig.mapTextureUrl ?? meshConfig.textureUrl ?? meshConfig.materialParams?.mapTextureUrl;
    const normalTextureUrl = meshConfig.normalTextureUrl ?? meshConfig.materialParams?.normalTextureUrl;
    const baseOptions: THREE.MeshStandardMaterialParameters = {
      color,
      roughness,
      metalness,
      opacity,
      transparent,
    };

    if (getDefaultToonMode()) {
      const isGlass = meshConfig.material === 'GLASS';
      const toon = new THREE.MeshToonMaterial({
        color,
        opacity: isGlass ? 0.45 : opacity,
        transparent: isGlass ? true : transparent,
        gradientMap: getToonGradient(isGlass ? 2 : 4),
      });
      if (mapTextureUrl) {
        toon.map = this.loadTexture(mapTextureUrl);
      }
      if (normalTextureUrl) {
        toon.normalMap = this.loadTexture(normalTextureUrl);
      }
      return toon;
    }

    if (meshConfig.material === 'GLASS') {
      return new THREE.MeshPhysicalMaterial({
        ...baseOptions,
        transmission: 0.98,
        roughness: 0.1,
        envMapIntensity: 1,
      });
    }

    if (mapTextureUrl) {
      baseOptions.map = this.loadTexture(mapTextureUrl);
    }

    if (normalTextureUrl) {
      baseOptions.normalMap = this.loadTexture(normalTextureUrl);
    }

    return new THREE.MeshStandardMaterial(baseOptions);
  }

  @HandleError()
  @MonitorMemory(20) // 텍스처는 메모리를 많이 사용할 수 있음
  private loadTexture(url: string): THREE.Texture {
    const cached = this.textures.get(url);
    if (cached) return cached;

    const texture = this.textureLoader.load(url);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    this.textures.set(url, texture);
    return texture;
  }

  @HandleError()
  @Profile()
  updateMaterial(meshId: string, updates: Partial<MeshConfig>): void {
    const material = this.materials.get(meshId);
    if (!material) return;
    if (material instanceof THREE.MeshStandardMaterial) {
      if (updates.color) material.color.set(updates.color);
      if (updates.roughness !== undefined) material.roughness = updates.roughness;
      if (updates.metalness !== undefined) material.metalness = updates.metalness;
      if (updates.opacity !== undefined) material.opacity = updates.opacity;
      material.needsUpdate = true;
    } else if (material instanceof THREE.MeshToonMaterial) {
      if (updates.color) material.color.set(updates.color);
      if (updates.opacity !== undefined) material.opacity = updates.opacity;
      material.needsUpdate = true;
    }
  }

  @HandleError()
  dispose(): void {
    this.materials.forEach(material => material.dispose());
    this.materials.clear();
    this.textures.forEach(texture => texture.dispose());
    this.textures.clear();
  }
} 