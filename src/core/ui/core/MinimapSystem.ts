import * as THREE from 'three';
import { MinimapMarker, MinimapEngineState } from './types';
import { Profile, HandleError, MonitorMemory } from '@/core/boilerplate/decorators';

export class MinimapEngine {
  private static instance: MinimapEngine | null = null;
  private state: MinimapEngineState;
  private listeners: Set<(markers: Map<string, MinimapMarker>) => void>;

  private constructor() {
    this.state = {
      markers: new Map(),
    };
    this.listeners = new Set();
  }

  static getInstance(): MinimapEngine {
    if (!MinimapEngine.instance) {
      MinimapEngine.instance = new MinimapEngine();
    }
    return MinimapEngine.instance;
  }

  @HandleError()
  @Profile()
  addMarker(id: string, type: 'normal' | 'ground', text: string, center: THREE.Vector3, size: THREE.Vector3): void {
    const marker: MinimapMarker = { id, type, text, center, size };
    this.state.markers.set(id, marker);
    this.notifyListeners();
  }

  @HandleError()
  removeMarker(id: string): void {
    this.state.markers.delete(id);
    this.notifyListeners();
  }

  @HandleError()
  @Profile()
  updateMarker(id: string, updates: Partial<Omit<MinimapMarker, 'id'>>): void {
    const existing = this.state.markers.get(id);
    if (existing) {
      this.state.markers.set(id, { ...existing, ...updates });
      this.notifyListeners();
    }
  }

  @MonitorMemory(5)
  getMarkers(): Map<string, MinimapMarker> {
    return new Map(this.state.markers);
  }

  getMarker(id: string): MinimapMarker | undefined {
    return this.state.markers.get(id);
  }

  @HandleError()
  clear(): void {
    this.state.markers.clear();
    this.notifyListeners();
  }

  subscribe(listener: (markers: Map<string, MinimapMarker>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  @Profile()
  private notifyListeners(): void {
    const markers = this.getMarkers();
    this.listeners.forEach(listener => listener(markers));
  }

  @HandleError()
  dispose(): void {
    this.clear();
    this.listeners.clear();
    MinimapEngine.instance = null;
  }
} 