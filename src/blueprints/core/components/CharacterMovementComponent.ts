import * as THREE from 'three';

import { IComponent, ComponentContext } from '../types';

const UP_AXIS = new THREE.Vector3(0, 1, 0);
const REFERENCE_FPS = 60;
const BRAKING_RETAINED_SPEED = 0.9;

export type CharacterMovementProps = {
  walkSpeed: number;
  runSpeed: number;
  jumpHeight: number;
  /** Fraction of airborne steering applied per 1/60 second, clamped to 0..1. */
  airControl: number;
};

export class CharacterMovementComponent implements IComponent {
  type: string = 'CharacterMovement';
  enabled: boolean = true;
  private props: CharacterMovementProps;
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private jumpHeld = false;

  constructor(props: CharacterMovementProps) {
    this.props = props;
  }

  initialize(context: ComponentContext): void {
    if (context.rigidBodyRef.current) {
      context.rigidBodyRef.current.setEnabledRotations(false, false, false, false);
    }
  }

  update(context: ComponentContext): void {
    const input = context.movementInput;
    if (!context.rigidBodyRef.current || !input) {
      this.jumpHeld = false;
      return;
    }

    const rigidBody = context.rigidBodyRef.current;
    const currentVelocity = rigidBody.linvel();

    const moveX = (input.rightward ? 1 : 0) - (input.leftward ? 1 : 0);
    const moveZ = (input.backward ? 1 : 0) - (input.forward ? 1 : 0);

    const speed = input.run ? this.props.runSpeed : this.props.walkSpeed;
    const elapsed = Number.isFinite(context.deltaTime) ? Math.max(0, context.deltaTime) : 0;

    if (moveX !== 0 || moveZ !== 0) {
      this.velocity.set(moveX, 0, moveZ).normalize().multiplyScalar(speed);

      if (input.cameraYaw !== undefined) {
        this.velocity.applyAxisAngle(UP_AXIS, input.cameraYaw);
      }
      if (!input.isGrounded) {
        const control = THREE.MathUtils.clamp(this.props.airControl, 0, 1);
        const blend = elapsed === 0 ? 0 : 1 - Math.pow(1 - control, elapsed * REFERENCE_FPS);
        this.velocity.x = THREE.MathUtils.lerp(currentVelocity.x, this.velocity.x, blend);
        this.velocity.z = THREE.MathUtils.lerp(currentVelocity.z, this.velocity.z, blend);
      }
    } else if (!input.isGrounded) {
      this.velocity.x = currentVelocity.x;
      this.velocity.z = currentVelocity.z;
    } else {
      const damping = Math.pow(BRAKING_RETAINED_SPEED, elapsed * REFERENCE_FPS);
      this.velocity.x *= damping;
      this.velocity.z *= damping;
    }

    if (input.jump && !this.jumpHeld && input.isGrounded) {
      this.velocity.y = Math.sqrt(2 * 9.81 * this.props.jumpHeight);
    } else {
      this.velocity.y = currentVelocity.y;
    }
    this.jumpHeld = input.jump === true;

    rigidBody.setLinvel(this.velocity, true);
  }

  dispose(): void {
    this.jumpHeld = false;
    this.velocity.set(0, 0, 0);
  }
}
