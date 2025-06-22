import * as THREE from 'three';

class PlayerState {
  public position = new THREE.Vector3(0, 0, 0);
  public velocity = new THREE.Vector3(0, 0, 0);
  public quat = new THREE.Quaternion(0, 0, 0, 1);
  public euler = new THREE.Euler(0, 0, 0);
  public dir = new THREE.Vector3(0, 0, 0);
  public direction = new THREE.Vector3(0, 0, 0);
  public isActive = false;
  public isMoving = false;
  public isJumping = false;
  public isOnGround = true;

  public reset() {
    this.position.set(0, 0, 0);
    this.velocity.set(0, 0, 0);
    this.quat.set(0, 0, 0, 1);
    this.euler.set(0, 0, 0);
    this.dir.set(0, 0, 0);
    this.direction.set(0, 0, 0);
    this.isActive = false;
    this.isMoving = false;
    this.isJumping = false;
    this.isOnGround = true;
  }
  
  public update(values: Partial<{
    position: THREE.Vector3;
    velocity: THREE.Vector3;
    quat: THREE.Quaternion;
    euler: THREE.Euler;
    dir: THREE.Vector3;
    direction: THREE.Vector3;
  }>) {
    if (values.position) this.position.copy(values.position);
    if (values.velocity) this.velocity.copy(values.velocity);
    if (values.quat) this.quat.copy(values.quat);
    if (values.euler) this.euler.copy(values.euler);
    if (values.dir) this.dir.copy(values.dir);
    if (values.direction) this.direction.copy(values.direction);
  }
  
  setPosition(x: number, y: number, z: number) {
    this.position.set(x, y, z);
  }
  
  setVelocity(x: number, y: number, z: number) {
    this.velocity.set(x, y, z);
  }
  
  updateFromRigidBody(rigidBody: any) {
    if (!rigidBody) return;
    
    const translation = rigidBody.translation();
    this.position.set(translation.x, translation.y, translation.z);
    
    const linvel = rigidBody.linvel();
    this.velocity.set(linvel.x, linvel.y, linvel.z);
    
    const rotation = rigidBody.rotation();
    this.quat.set(rotation.x, rotation.y, rotation.z, rotation.w);
    this.euler.setFromQuaternion(this.quat);
  }
  
  // For debugging
  toJSON() {
    return {
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      velocity: { x: this.velocity.x, y: this.velocity.y, z: this.velocity.z },
      rotation: { x: this.euler.x, y: this.euler.y, z: this.euler.z },
      isActive: this.isActive,
      isMoving: this.isMoving,
      isJumping: this.isJumping,
      isOnGround: this.isOnGround,
    };
  }
}
export const playerState = new PlayerState();
if (process.env.NODE_ENV === 'development') {
  (window as any).__GAESUP_PLAYER_STATE__ = playerState;
}
