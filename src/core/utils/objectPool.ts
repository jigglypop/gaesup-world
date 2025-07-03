import * as THREE from 'three';

interface PoolConfig {
  initialSize: number;
  maxSize: number;
  growthRate: number;
}

class ObjectPool<T> {
  private available: T[] = [];
  private inUse = new Set<T>();
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private config: PoolConfig;

  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    config: Partial<PoolConfig> = {}
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.config = {
      initialSize: 10,
      maxSize: 100,
      growthRate: 2,
      ...config
    };
    
    this.initialize();
  }

  private initialize(): void {
    for (let i = 0; i < this.config.initialSize; i++) {
      this.available.push(this.createFn());
    }
  }

  acquire(): T {
    if (this.available.length === 0) {
      const currentSize = this.available.length + this.inUse.size;
      if (currentSize >= this.config.maxSize) {
        throw new Error(`ObjectPool: Maximum size ${this.config.maxSize} reached`);
      }
      
      this.grow();
      if (this.available.length === 0) {
        const obj = this.createFn();
        this.inUse.add(obj);
        return obj;
      }
    }
    
    const obj = this.available.pop()!;
    this.inUse.add(obj);
    return obj;
  }

  release(obj: T): void {
    if (!this.inUse.has(obj)) return;
    
    this.resetFn(obj);
    this.inUse.delete(obj);
    this.available.push(obj);
  }

  private grow(): void {
    const currentSize = this.available.length + this.inUse.size;
    if (currentSize >= this.config.maxSize) return;
    
    const growthAmount = Math.min(
      Math.ceil(currentSize * (this.config.growthRate - 1)),
      this.config.maxSize - currentSize
    );
    
    for (let i = 0; i < growthAmount; i++) {
      this.available.push(this.createFn());
    }
  }

  clear(): void {
    this.available = [];
    this.inUse.clear();
  }

  get stats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size
    };
  }
}

export class ThreeObjectPool {
  private static instance: ThreeObjectPool;
  
  private vector3Pool: ObjectPool<THREE.Vector3>;
  private quaternionPool: ObjectPool<THREE.Quaternion>;
  private eulerPool: ObjectPool<THREE.Euler>;
  private matrix4Pool: ObjectPool<THREE.Matrix4>;
  
  private constructor() {
    this.vector3Pool = new ObjectPool(
      () => new THREE.Vector3(),
      (v) => v.set(0, 0, 0),
      { initialSize: 20, maxSize: 200 }
    );
    
    this.quaternionPool = new ObjectPool(
      () => new THREE.Quaternion(),
      (q) => q.set(0, 0, 0, 1),
      { initialSize: 10, maxSize: 100 }
    );
    
    this.eulerPool = new ObjectPool(
      () => new THREE.Euler(),
      (e) => e.set(0, 0, 0),
      { initialSize: 10, maxSize: 100 }
    );
    
    this.matrix4Pool = new ObjectPool(
      () => new THREE.Matrix4(),
      (m) => m.identity(),
      { initialSize: 5, maxSize: 50 }
    );
  }
  
  static getInstance(): ThreeObjectPool {
    if (!ThreeObjectPool.instance) {
      ThreeObjectPool.instance = new ThreeObjectPool();
    }
    return ThreeObjectPool.instance;
  }
  
  acquireVector3(): THREE.Vector3 {
    return this.vector3Pool.acquire();
  }
  
  releaseVector3(v: THREE.Vector3): void {
    this.vector3Pool.release(v);
  }
  
  acquireQuaternion(): THREE.Quaternion {
    return this.quaternionPool.acquire();
  }
  
  releaseQuaternion(q: THREE.Quaternion): void {
    this.quaternionPool.release(q);
  }
  
  acquireEuler(): THREE.Euler {
    return this.eulerPool.acquire();
  }
  
  releaseEuler(e: THREE.Euler): void {
    this.eulerPool.release(e);
  }
  
  acquireMatrix4(): THREE.Matrix4 {
    return this.matrix4Pool.acquire();
  }
  
  releaseMatrix4(m: THREE.Matrix4): void {
    this.matrix4Pool.release(m);
  }
  
  withVector3<T>(fn: (v: THREE.Vector3) => T): T {
    const v = this.acquireVector3();
    try {
      return fn(v);
    } finally {
      this.releaseVector3(v);
    }
  }
  
  withQuaternion<T>(fn: (q: THREE.Quaternion) => T): T {
    const q = this.acquireQuaternion();
    try {
      return fn(q);
    } finally {
      this.releaseQuaternion(q);
    }
  }
  
  withEuler<T>(fn: (e: THREE.Euler) => T): T {
    const e = this.acquireEuler();
    try {
      return fn(e);
    } finally {
      this.releaseEuler(e);
    }
  }
  
  withMatrix4<T>(fn: (m: THREE.Matrix4) => T): T {
    const m = this.acquireMatrix4();
    try {
      return fn(m);
    } finally {
      this.releaseMatrix4(m);
    }
  }
  
  getStats() {
    return {
      vector3: this.vector3Pool.stats,
      quaternion: this.quaternionPool.stats,
      euler: this.eulerPool.stats,
      matrix4: this.matrix4Pool.stats
    };
  }
  
  clear(): void {
    this.vector3Pool.clear();
    this.quaternionPool.clear();
    this.eulerPool.clear();
    this.matrix4Pool.clear();
  }
}

export const threeObjectPool = ThreeObjectPool.getInstance(); 