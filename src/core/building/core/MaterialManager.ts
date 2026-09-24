import * as THREE from 'three';

import { MonitorMemory } from '@/core/boilerplate/decorators';
import { getDefaultToonMode, getToonGradient } from '@/core/rendering/toon';

import { MeshConfig } from '../types';

type MaterialEntry = { material: THREE.Material; config: MeshConfig; key: string };

export class MaterialManager {
  private materials: Map<string, THREE.Material> = new Map();
  private materialsById = new Map<string, Set<MaterialEntry>>();
  private textures: Map<string, THREE.Texture> = new Map();
  private textureLoader: THREE.TextureLoader;

  constructor() {
    this.textureLoader = new THREE.TextureLoader();
  }

  getMaterial(meshConfig: MeshConfig): THREE.Material {
    const key = this.createMaterialKey(meshConfig);
    const cached = this.materials.get(key);
    if (cached) return cached;

    const material = this.createMaterial(meshConfig);
    this.materials.set(key, material);
    let entries = this.materialsById.get(meshConfig.id);
    if (!entries) this.materialsById.set(meshConfig.id, entries = new Set());
    entries.add({ material, key, config: { ...meshConfig, materialParams: { ...meshConfig.materialParams } } });
    return material;
  }

  private createMaterialKey(meshConfig: MeshConfig, toon = getDefaultToonMode()): string {
    return [
      meshConfig.id,
      toon,
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

  updateMaterial(meshId: string, updates: Partial<MeshConfig>): void {
    const entries = this.materialsById.get(meshId);
    if (!entries) return;
    const values = {
      color: updates.color ?? updates.materialParams?.color,
      roughness: updates.roughness ?? updates.materialParams?.roughness,
      metalness: updates.metalness ?? updates.materialParams?.metalness,
      opacity: updates.opacity ?? updates.materialParams?.opacity,
      transparent: updates.transparent ?? updates.materialParams?.transparent,
      mapTextureUrl: updates.mapTextureUrl ?? updates.textureUrl ?? updates.materialParams?.mapTextureUrl,
      normalTextureUrl: updates.normalTextureUrl ?? updates.materialParams?.normalTextureUrl,
    };
    for (const entry of entries) {
      const { material } = entry;
      if (!(material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshToonMaterial)) continue;
      if (values.color !== undefined) material.color.set(values.color);
      if (material instanceof THREE.MeshStandardMaterial) {
        if (values.roughness !== undefined) material.roughness = values.roughness;
        if (values.metalness !== undefined) material.metalness = values.metalness;
      }
      if (values.opacity !== undefined) material.opacity = values.opacity;
      if (values.transparent !== undefined && material.transparent !== values.transparent) {
        material.transparent = values.transparent;
        material.needsUpdate = true;
      }
      const mapUrl = values.mapTextureUrl;
      if (mapUrl !== undefined) {
        const map = this.loadTexture(mapUrl);
        if (material.map !== map) { material.map = map; material.needsUpdate = true; }
      }
      if (values.normalTextureUrl !== undefined) {
        const map = this.loadTexture(values.normalTextureUrl);
        if (material.normalMap !== map) { material.normalMap = map; material.needsUpdate = true; }
      }
      // Never leave a mutated material cached under its previous configuration.
      if (this.materials.get(entry.key) === material) this.materials.delete(entry.key);
      entry.config = { ...entry.config, ...Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined)) };
      entry.key = this.createMaterialKey(entry.config, material instanceof THREE.MeshToonMaterial);
      this.materials.set(entry.key, material);
    }
  }

  dispose(): void {
    for (const entries of this.materialsById.values()) for (const { material } of entries) material.dispose();
    this.materialsById.clear();
    this.materials.clear();
    this.textures.forEach(texture => texture.dispose());
    this.textures.clear();
  }
}
