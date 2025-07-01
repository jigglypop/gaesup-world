import * as THREE from 'three';

export class PhysicsMemoryPool {
  private static instance: PhysicsMemoryPool;
  private vector3Pool: THREE.Vector3[] = [];
  private eulerPool: THREE.Euler[] = [];
  private keyboardStateBitfield = 0;
  
  private constructor() {
    for (let i = 0; i < 10; i++) {
      this.vector3Pool.push(new THREE.Vector3());
      this.eulerPool.push(new THREE.Euler());
    }
  }
  
  static getInstance(): PhysicsMemoryPool {
    if (!this.instance) {
      this.instance = new PhysicsMemoryPool();
    }
    return this.instance;
  }
  
  getVector3(): THREE.Vector3 {
    return this.vector3Pool.pop() || new THREE.Vector3();
  }
  
  releaseVector3(vec: THREE.Vector3): void {
    vec.set(0, 0, 0);
    if (this.vector3Pool.length < 20) {
      this.vector3Pool.push(vec);
    }
  }
  
  getEuler(): THREE.Euler {
    return this.eulerPool.pop() || new THREE.Euler();
  }
  
  releaseEuler(euler: THREE.Euler): void {
    euler.set(0, 0, 0);
    if (this.eulerPool.length < 10) {
      this.eulerPool.push(euler);
    }
  }
  
  setKeyboardBit(index: number, value: boolean): void {
    if (value) {
      this.keyboardStateBitfield |= (1 << index);
    } else {
      this.keyboardStateBitfield &= ~(1 << index);
    }
  }
  
  getKeyboardBit(index: number): boolean {
    return (this.keyboardStateBitfield & (1 << index)) !== 0;
  }
  
  getKeyboardStateBitfield(): number {
    return this.keyboardStateBitfield;
  }
  
  setKeyboardStateBitfield(value: number): void {
    this.keyboardStateBitfield = value;
  }
} 