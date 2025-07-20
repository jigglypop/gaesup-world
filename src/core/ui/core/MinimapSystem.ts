import * as THREE from 'three';
import { MinimapMarker } from './types';
import { AbstractSystem } from '@/core/boilerplate/entity/AbstractSystem';
import { BaseState, BaseMetrics } from '@/core/boilerplate/types';
import { SystemContext } from '@/core/boilerplate/entity/BaseSystem';
import { RegisterSystem, ManageRuntime } from '@/core/boilerplate/decorators';

interface MinimapSystemState extends BaseState {
  markers: Map<string, MinimapMarker>;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  isDirty: boolean;
  lastPosition: { x: number; z: number } | null;
  lastRotation: number | null;
  gradientCache: {
    background: CanvasGradient | null;
    avatar: CanvasGradient | null;
  };
}

interface MinimapSystemMetrics extends BaseMetrics {
  markerCount: number;
  renderTime: number;
}

interface MinimapRenderOptions {
  size: number;
  scale: number;
  position: THREE.Vector3;
  rotation: number;
  blockRotate?: boolean;
  tileGroups?: Map<string, any>;
  sceneObjects?: Map<string, { position: THREE.Vector3; size: THREE.Vector3 }>;
}

@RegisterSystem('minimap')
@ManageRuntime({ autoStart: false })
export class MinimapSystem extends AbstractSystem<MinimapSystemState, MinimapSystemMetrics> {
  private static instance: MinimapSystem | null = null;
  private listeners: Set<(markers: Map<string, MinimapMarker>) => void>;

  constructor() {
    const defaultState: MinimapSystemState = {
      markers: new Map(),
      canvas: null,
      ctx: null,
      isDirty: true,
      lastPosition: null,
      lastRotation: null,
      gradientCache: {
        background: null,
        avatar: null
      },
      lastUpdate: Date.now()
    };

    const defaultMetrics: MinimapSystemMetrics = {
      markerCount: 0,
      renderTime: 0,
      frameTime: 0
    };

    super(defaultState, defaultMetrics);
    this.listeners = new Set();
  }

  static getInstance(): MinimapSystem {
    if (!MinimapSystem.instance || MinimapSystem.instance.isDisposed) {
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

  setCanvas(canvas: HTMLCanvasElement | null): void {
    this.state.canvas = canvas;
    this.state.ctx = canvas ? canvas.getContext('2d') : null;
    this.state.isDirty = true;
    this.state.gradientCache = {
      background: null,
      avatar: null
    };
  }

  checkForUpdates(position: THREE.Vector3, rotation: number, threshold = 0.1, rotationThreshold = 0.01): void {
    const lastPos = this.state.lastPosition;
    const lastRotation = this.state.lastRotation;

    if (!lastPos || lastRotation === null) {
      this.state.isDirty = true;
      this.state.lastPosition = { x: position.x, z: position.z };
      this.state.lastRotation = rotation;
      return;
    }

    const positionChanged =
      Math.abs(position.x - lastPos.x) > threshold ||
      Math.abs(position.z - lastPos.z) > threshold;

    const rotationChanged = Math.abs(rotation - lastRotation) > rotationThreshold;

    if (positionChanged || rotationChanged) {
      this.state.isDirty = true;
      this.state.lastPosition = { x: position.x, z: position.z };
      this.state.lastRotation = rotation;
    }
  }

  render(options: MinimapRenderOptions): void {
    if (!this.state.canvas || !this.state.ctx || !this.state.isDirty) return;

    const startTime = performance.now();
    const { size, scale, position, rotation, blockRotate, tileGroups, sceneObjects } = options;
    const ctx = this.state.ctx;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Clip to circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();

    // Background gradient
    if (!this.state.gradientCache.background) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(20, 30, 40, 0.9)');
      gradient.addColorStop(1, 'rgba(10, 20, 30, 0.95)');
      this.state.gradientCache.background = gradient;
    }
    ctx.fillStyle = this.state.gradientCache.background;
    ctx.fillRect(0, 0, size, size);

    // Rotation
    const displayRotation = (rotation * 180) / Math.PI;
    ctx.translate(size / 2, size / 2);
    ctx.rotate((-displayRotation * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);

    // Grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < size; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
    ctx.restore();

    // Compass directions
    this.renderCompass(ctx, size, displayRotation);

    // Render tiles
    if (tileGroups && tileGroups.size > 0) {
      this.renderTiles(ctx, size, scale, position, tileGroups);
    }

    // Render scene objects
    if (sceneObjects && sceneObjects.size > 0) {
      this.renderSceneObjects(ctx, size, scale, position, sceneObjects);
    }

    // Render minimap markers
    this.renderMarkers(ctx, size, scale, position, displayRotation, blockRotate);

    // Render player avatar
    this.renderAvatar(ctx, size);

    ctx.restore();

    this.state.isDirty = false;
    this.metrics.renderTime = performance.now() - startTime;
  }

  private renderCompass(ctx: CanvasRenderingContext2D, size: number, displayRotation: number): void {
    ctx.save();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 16px sans-serif';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 3;

    const dirs = [
      { text: 'N', x: size / 2, y: 25, color: '#ff6b6b' },
      { text: 'S', x: size / 2, y: size - 25, color: '#4ecdc4' },
      { text: 'E', x: size - 25, y: size / 2, color: '#45b7d1' },
      { text: 'W', x: 25, y: size / 2, color: '#f9ca24' },
    ];

    dirs.forEach(({ text, x, y, color }) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.translate(x, y);
      ctx.rotate((displayRotation * Math.PI) / 180);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 0, 0);
      ctx.restore();
    });
    ctx.restore();
  }

  private renderTiles(ctx: CanvasRenderingContext2D, size: number, scale: number, position: THREE.Vector3, tileGroups: Map<string, any>): void {
    const tileGroupsArray = Array.from(tileGroups.values());
    tileGroupsArray.forEach((tileGroup) => {
      if (tileGroup && tileGroup.tiles && Array.isArray(tileGroup.tiles)) {
        tileGroup.tiles.forEach((tile: any) => {
          if (!tile || !tile.position) return;
          
          const posX = (tile.position.x - position.x) * scale;
          const posZ = (tile.position.z - position.z) * scale;
          const tileSize = (tile.size || 1) * 4 * scale;
          
          ctx.save();
          const x = size / 2 - posX - tileSize / 2;
          const y = size / 2 - posZ - tileSize / 2;
          
          if (tile.objectType === 'water') {
            ctx.fillStyle = 'rgba(0, 150, 255, 0.6)';
          } else if (tile.objectType === 'grass') {
            ctx.fillStyle = 'rgba(50, 200, 50, 0.4)';
          } else {
            ctx.fillStyle = 'rgba(150, 150, 150, 0.3)';
          }
          
          ctx.fillRect(x, y, tileSize, tileSize);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(x, y, tileSize, tileSize);
          ctx.restore();
        });
      }
    });
  }

  private renderSceneObjects(ctx: CanvasRenderingContext2D, size: number, scale: number, position: THREE.Vector3, sceneObjects: Map<string, { position: THREE.Vector3; size: THREE.Vector3 }>): void {
    sceneObjects.forEach((obj) => {
      if (!obj?.position || !obj?.size) return;
      const posX = (obj.position.x - position.x) * scale;
      const posZ = (obj.position.z - position.z) * scale;
      const objWidth = obj.size.x * scale;
      const objHeight = obj.size.z * scale;
      ctx.save();
      const x = size / 2 - posX - objWidth / 2;
      const y = size / 2 - posZ - objHeight / 2;
      ctx.fillStyle = 'rgba(100, 150, 200, 0.4)';
      ctx.fillRect(x, y, objWidth, objHeight);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, objWidth, objHeight);
      ctx.restore();
    });
  }

  private renderMarkers(ctx: CanvasRenderingContext2D, size: number, scale: number, position: THREE.Vector3, displayRotation: number, blockRotate?: boolean): void {
    if (this.state.markers.size === 0) return;

    this.state.markers.forEach((marker) => {
      if (!marker?.center || !marker?.size) return;
      const { center, size: markerSize, text } = marker;
      const posX = (center.x - position.x) * scale;
      const posZ = (center.z - position.z) * scale;
      ctx.save();
      const width = markerSize.x * scale;
      const height = markerSize.z * scale;
      const x = size / 2 - posX - width / 2;
      const y = size / 2 - posZ - height / 2;

      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(x, y, width, height);
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      
      if (text) {
        ctx.save();
        ctx.fillStyle = 'white';
        ctx.font = 'bold 12px sans-serif';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 2;
        ctx.translate(x + width / 2, y + height / 2);
        if (!blockRotate) {
          ctx.rotate((-displayRotation * Math.PI) / 180);
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 0, 0);
        ctx.restore();
      }
      ctx.restore();
    });
  }

  private renderAvatar(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.save();
    
    if (!this.state.gradientCache.avatar) {
      const avatarGradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, 12);
      avatarGradient.addColorStop(0, '#01fff7');
      avatarGradient.addColorStop(0.7, '#01fff7');
      avatarGradient.addColorStop(1, 'transparent');
      this.state.gradientCache.avatar = avatarGradient;
    }

    ctx.fillStyle = this.state.gradientCache.avatar;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#01fff7';
    ctx.shadowColor = '0 0 10px rgba(1,255,247,0.7)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 6, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(size / 2, size / 2);
    ctx.lineTo(size / 2, size / 2 - 12);
    ctx.stroke();
    ctx.restore();
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
    this.state.canvas = null;
    this.state.ctx = null;
    MinimapSystem.instance = null;
  }
} 