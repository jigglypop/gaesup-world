import * as THREE from 'three';
import { MinimapMarker } from './types';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { RegisterSystem, ManageRuntime } from '@/core/boilerplate/decorators';

interface MinimapSystemState extends BaseState {
  markers: Map<string, MinimapMarker>;
}

interface MinimapSystemMetrics extends BaseMetrics {
  markerCount: number;
}

@RegisterSystem('minimap')
@ManageRuntime({ autoStart: false })
export class MinimapSystem extends AbstractSystem<MinimapSystemState, MinimapSystemMetrics> {
  private static instance: MinimapSystem | null = null;
  private listeners: Set<(markers: Map<string, MinimapMarker>) => void>;

  constructor() {
    const defaultState: MinimapSystemState = {
      markers: new Map(),
      lastUpdate: Date.now()
    };

    const defaultMetrics: MinimapSystemMetrics = {
      markerCount: 0,
      frameTime: 0
    };

    super(defaultState, defaultMetrics);
    this.listeners = new Set();
  }

  static getInstance(): MinimapSystem {
    if (!MinimapSystem.instance) {
      MinimapSystem.instance = new MinimapSystem();
    }
    return MinimapSystem.instance;
  }

  addMarker(id: string, type: 'normal' | 'ground', text: string, center: THREE.Vector3, size: THREE.Vector3): void {
    const marker: MinimapMarker = { id, type, text, center, size };
    this.state.markers.set(id, marker);
    this.updateMetrics(0);
    this.notifyListeners();
  }

  removeMarker(id: string): void {
    this.state.markers.delete(id);
    this.updateMetrics(0);
    this.notifyListeners();
  }

  updateMarker(id: string, updates: Partial<Omit<MinimapMarker, 'id'>>): void {
    const existing = this.state.markers.get(id);
    if (existing) {
      this.state.markers.set(id, { ...existing, ...updates });
      this.updateMetrics(0);
      this.notifyListeners();
    }
  }

  getMarkers(): Map<string, MinimapMarker> {
    return new Map(this.state.markers);
  }

  getMarker(id: string): MinimapMarker | undefined {
    return this.state.markers.get(id);
  }

  clear(): void {
    this.state.markers.clear();
    this.updateMetrics(0);
    this.notifyListeners();
  }

  subscribe(listener: (markers: Map<string, MinimapMarker>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const markers = this.getMarkers();
    this.listeners.forEach(listener => listener(markers));
  }

  // AbstractSystem의 추상 메서드 구현
  protected performUpdate(context: SystemContext): void {
    // 미니맵은 매 프레임 업데이트가 필요없음
  }

  protected override updateMetrics(deltaTime: number): void {
    this.metrics.markerCount = this.state.markers.size;
  }

  protected override onDispose(): void {
    this.clear();
    this.listeners.clear();
    MinimapSystem.instance = null;
  }
} 