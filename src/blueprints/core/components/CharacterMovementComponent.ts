import { IComponent, ComponentContext } from '../types';
import * as THREE from 'three';

export type CharacterMovementProps = {
  walkSpeed: number;
  runSpeed: number;
  jumpHeight: number;
  airControl: number;
};

export class CharacterMovementComponent implements IComponent {
  enabled: boolean = true;
  private props: CharacterMovementProps;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private isGrounded: boolean = false;

  constructor(props: CharacterMovementProps) {
    this.props = props;
  }

  initialize(context: ComponentContext): void {
    if (context.rigidBodyRef.current) {
      context.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  update(context: ComponentContext): void {
    if (!context.rigidBodyRef.current) return;

    const rigidBody = context.rigidBodyRef.current;
    const currentVelocity = rigidBody.linvel();
    
    const keyboard = (window as any).__keyboardState || {};
    const mouse = (window as any).__mouseState || {};
    
    const moveX = (keyboard.rightward ? 1 : 0) - (keyboard.leftward ? 1 : 0);
    const moveZ = (keyboard.backward ? 1 : 0) - (keyboard.forward ? 1 : 0);
    
    const speed = keyboard.shift ? this.props.runSpeed : this.props.walkSpeed;
    
    if (moveX !== 0 || moveZ !== 0) {
      const moveVector = new THREE.Vector3(moveX, 0, moveZ).normalize();
      moveVector.multiplyScalar(speed);
      
      if (mouse?.angle !== undefined) {
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), mouse.angle);
      }
      
      this.velocity.x = moveVector.x;
      this.velocity.z = moveVector.z;
    } else {
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }
    
    if (keyboard.space && this.isGrounded) {
      this.velocity.y = Math.sqrt(2 * 9.81 * this.props.jumpHeight);
    } else {
      this.velocity.y = currentVelocity.y;
    }
    
    rigidBody.setLinvel(this.velocity, true);
  }

  dispose(): void {
    this.velocity.set(0, 0, 0);
  }
} 