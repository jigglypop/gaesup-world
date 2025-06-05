import * as THREE from 'three';

/**
 * 리소스 정리 함수 타입
 */
type CleanupFunction = () => void;

/**
 * 리소스 정보
 */
interface ResourceInfo {
  id: string;
  type: string;
  cleanupFns: CleanupFunction[];
  createdAt: number;
  lastAccessed: number;
}

/**
 * 메모리 관리를 위한 리소스 매니저
 * WeakMap을 사용하여 메모리 누수를 방지하고, 자동 가비지 컬렉션을 지원합니다.
 */
export class ResourceManager {
  private static instance: ResourceManager;
  
  // WeakMap을 사용하여 자동 가비지 컬렉션 지원
  private resources = new WeakMap<object, ResourceInfo>();
  
  // 이름으로 참조할 수 있는 리소스들 (WeakRef 사용)
  private namedResources = new Map<string, WeakRef<object>>();
  
  // Three.js 관련 리소스 추적
  private geometries = new Set<THREE.BufferGeometry>();
  private materials = new Set<THREE.Material>();
  private textures = new Set<THREE.Texture>();
  private meshes = new Set<THREE.Mesh>();
  
  // 정리 스케줄링
  private cleanupScheduled = false;
  private cleanupInterval: number | null = null;
  
  // 통계
  private stats = {
    totalRegistered: 0,
    totalCleaned: 0,
    lastCleanupTime: 0,
    geometriesDisposed: 0,
    materialsDisposed: 0,
    texturesDisposed: 0,
  };

  static getInstance(): ResourceManager {
    if (!this.instance) {
      this.instance = new ResourceManager();
    }
    return this.instance;
  }

  private constructor() {
    // 5분마다 자동 정리 실행
    this.schedulePeriodicCleanup();
    
    // 페이지 언로드 시 모든 리소스 정리
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.disposeAll());
    }
  }

  /**
   * 리소스 등록
   */
  register(
    object: object, 
    cleanupFn: CleanupFunction, 
    name?: string, 
    type: string = 'generic'
  ): void {
    const info: ResourceInfo = {
      id: this.generateId(),
      type,
      cleanupFns: [cleanupFn],
      createdAt: Date.now(),
      lastAccessed: Date.now(),
    };

    if (!this.resources.has(object)) {
      this.resources.set(object, info);
      this.stats.totalRegistered++;
    } else {
      // 기존 리소스에 정리 함수 추가
      const existingInfo = this.resources.get(object)!;
      existingInfo.cleanupFns.push(cleanupFn);
    }
    
    // 이름이 있으면 이름으로도 등록
    if (name) {
      this.namedResources.set(name, new WeakRef(object));
    }
    
    // Three.js 객체별 자동 등록
    this.autoRegisterThreeJsObject(object);
  }

  /**
   * Three.js 객체 자동 등록
   */
  private autoRegisterThreeJsObject(object: any): void {
    if (object instanceof THREE.BufferGeometry) {
      this.geometries.add(object);
    } else if (object instanceof THREE.Material) {
      this.materials.add(object);
    } else if (object instanceof THREE.Texture) {
      this.textures.add(object);
    } else if (object instanceof THREE.Mesh) {
      this.meshes.add(object);
      
      // Mesh의 geometry와 material도 자동 등록
      if (object.geometry && !this.geometries.has(object.geometry)) {
        this.geometries.add(object.geometry);
      }
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(mat => {
            if (!this.materials.has(mat)) {
              this.materials.add(mat);
            }
          });
        } else if (!this.materials.has(object.material)) {
          this.materials.add(object.material);
        }
      }
    }
  }

  /**
   * 리소스 정리
   */
  dispose(object: object): boolean {
    const info = this.resources.get(object);
    if (!info) return false;

    info.cleanupFns.forEach(cleanup => {
      try {
        cleanup();
      } catch (error) {
        console.error('Resource cleanup error:', error);
      }
    });

    this.resources.delete(object);
    this.stats.totalCleaned++;
    
    return true;
  }

  /**
   * 이름으로 리소스 정리
   */
  disposeByName(name: string): boolean {
    const ref = this.namedResources.get(name);
    if (!ref) return false;
    
    const object = ref.deref();
    if (!object) {
      this.namedResources.delete(name);
      return false;
    }
    
    const result = this.dispose(object);
    this.namedResources.delete(name);
    return result;
  }

  /**
   * Three.js 리소스 자동 정리
   */
  disposeThreeJsResources(): void {
    // Geometry 정리
    this.geometries.forEach(geometry => {
      if (geometry.dispose) {
        geometry.dispose();
        this.stats.geometriesDisposed++;
      }
    });
    this.geometries.clear();

    // Material 정리
    this.materials.forEach(material => {
      if (material.dispose) {
        material.dispose();
        this.stats.materialsDisposed++;
      }
    });
    this.materials.clear();

    // Texture 정리
    this.textures.forEach(texture => {
      if (texture.dispose) {
        texture.dispose();
        this.stats.texturesDisposed++;
      }
    });
    this.textures.clear();

    // Mesh는 dispose 메서드가 없으므로 geometry와 material만 정리
    this.meshes.clear();
  }

  /**
   * 모든 리소스 정리
   */
  disposeAll(): void {
    // Three.js 리소스 먼저 정리
    this.disposeThreeJsResources();
    
    // 기타 리소스 정리는 WeakMap의 특성상 자동으로 처리됨
    this.namedResources.clear();
    
    // 정리 타이머 중지
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.stats.lastCleanupTime = Date.now();
  }

  /**
   * 가비지 컬렉션된 객체들 정리
   */
  cleanup(): void {
    const beforeSize = this.namedResources.size;
    const toDelete: string[] = [];
    
    this.namedResources.forEach((ref, name) => {
      if (!ref.deref()) {
        toDelete.push(name);
      }
    });
    
    toDelete.forEach(name => this.namedResources.delete(name));
    
    const cleaned = beforeSize - this.namedResources.size;
    if (cleaned > 0) {
      console.log(`ResourceManager: Cleaned ${cleaned} orphaned references`);
    }
    
    this.stats.lastCleanupTime = Date.now();
  }

  /**
   * 주기적 정리 스케줄링
   */
  private schedulePeriodicCleanup(): void {
    if (typeof window !== 'undefined') {
      this.cleanupInterval = window.setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000); // 5분마다
    }
  }

  /**
   * ID 생성
   */
  private generateId(): string {
    return `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 통계 정보 반환
   */
  getStats() {
    return {
      ...this.stats,
      namedResourcesCount: this.namedResources.size,
      geometriesCount: this.geometries.size,
      materialsCount: this.materials.size,
      texturesCount: this.textures.size,
      meshesCount: this.meshes.size,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * 메모리 사용량 추정
   */
  private estimateMemoryUsage(): { estimated: string; breakdown: any } {
    let totalBytes = 0;
    const breakdown = {
      geometries: 0,
      textures: 0,
      materials: 0,
      other: 0,
    };

    // Geometry 메모리 추정
    this.geometries.forEach(geometry => {
      if (geometry.attributes) {
        Object.values(geometry.attributes).forEach((attr: any) => {
          if (attr.array) {
            const bytes = attr.array.byteLength || attr.array.length * 4;
            breakdown.geometries += bytes;
          }
        });
      }
    });

    // Texture 메모리 추정
    this.textures.forEach(texture => {
      if (texture.image) {
        const width = texture.image.width || 256;
        const height = texture.image.height || 256;
        // RGB: 3 bytes per pixel, RGBA: 4 bytes per pixel
        const bytesPerPixel = 4;
        breakdown.textures += width * height * bytesPerPixel;
      }
    });

    totalBytes = breakdown.geometries + breakdown.textures + breakdown.materials + breakdown.other;

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      estimated: formatBytes(totalBytes),
      breakdown: {
        geometries: formatBytes(breakdown.geometries),
        textures: formatBytes(breakdown.textures),
        materials: formatBytes(breakdown.materials),
        other: formatBytes(breakdown.other),
      },
    };
  }

  /**
   * 리소스 매니저 리셋
   */
  reset(): void {
    this.disposeAll();
    this.stats = {
      totalRegistered: 0,
      totalCleaned: 0,
      lastCleanupTime: 0,
      geometriesDisposed: 0,
      materialsDisposed: 0,
      texturesDisposed: 0,
    };
  }
}

// 전역 인스턴스
export const globalResourceManager = ResourceManager.getInstance(); 