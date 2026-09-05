import * as THREE from 'three';

import { IComponent, ComponentContext } from '../types';

export type CharacterAnimationProps = {
  animations: {
    idle: string | string[];
    walk: string | string[];
    run: string | string[];
    jump: {
      start: string;
      loop: string;
      land: string;
    };
    combat?: Record<string, string | string[]>;
    special?: Record<string, string | string[]>;
  };
  defaultAnimation: string;
};

export class CharacterAnimationComponent implements IComponent {
  type: string = 'CharacterAnimation';
  enabled: boolean = true;
  private props: CharacterAnimationProps;
  private currentAnimation: string;
  private animationMixer: THREE.AnimationMixer | null = null;
  private actions: Map<string, THREE.AnimationAction> = new Map();
  private wasGrounded = true;

  constructor(props: CharacterAnimationProps) {
    this.props = props;
    this.currentAnimation = props.defaultAnimation;
  }

  initialize(context: ComponentContext): void {
    this.dispose();
    this.currentAnimation = this.props.defaultAnimation;
    if (context.innerGroupRef?.current) {
      this.animationMixer = new THREE.AnimationMixer(context.innerGroupRef.current);
      try {
        this.setupAnimations(context);
      } catch (error) {
        this.dispose();
        throw error;
      }
    }
  }

  private setupAnimations(context: ComponentContext): void {
    const animations = context.animationClips ?? {};

    Object.entries({
      ...this.props.animations,
      'jump.start': this.props.animations.jump.start,
      'jump.loop': this.props.animations.jump.loop,
      'jump.land': this.props.animations.jump.land,
    }).forEach(([key, value]) => {
      const candidates = typeof value === 'string' ? [value] : Array.isArray(value) ? value : [];
      const name = candidates.find(candidate => animations[candidate]);
      const clip = name ? animations[name] : undefined;
      if (clip) {
        const action = this.animationMixer!.clipAction(clip);
        if (key === 'jump.start' || key === 'jump.land') {
          action.setLoop(THREE.LoopOnce, 1);
          action.clampWhenFinished = true;
        }
        this.actions.set(key, action);
      }
    });

    this.playAnimation(this.currentAnimation);
  }

  private playAnimation(name: string): void {
    const action = this.actions.get(name);
    if (!action) return;
    this.actions.forEach((action) => action.stop());
    action.reset().play();
    this.currentAnimation = name;
  }

  update(context: ComponentContext): void {
    if (!this.animationMixer) return;

    this.animationMixer.update(context.deltaTime);

    const rigidBody = context.rigidBodyRef.current;

    if (!rigidBody) return;

    const velocity = rigidBody.linvel();
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    const grounded = context.movementInput?.isGrounded ?? Math.abs(velocity.y) <= 0.1;

    let targetAnimation = 'idle';

    if (!grounded) {
      targetAnimation = this.wasGrounded && velocity.y > 0.1 && this.actions.has('jump.start')
        ? 'jump.start'
        : this.currentAnimation === 'jump.start' && this.actions.get('jump.start')?.isRunning()
          ? 'jump.start'
          : 'jump.loop';
    } else if ((!this.wasGrounded && this.actions.has('jump.land')) ||
      (this.currentAnimation === 'jump.land' && this.actions.get('jump.land')?.isRunning())) {
      targetAnimation = 'jump.land';
    } else if (speed > 0.5) {
      const running = context.movementInput ? context.movementInput.run === true : speed > 6;
      targetAnimation = running ? 'run' : 'walk';
    }
    this.wasGrounded = grounded;

    if (targetAnimation !== this.currentAnimation) {
      this.playAnimation(targetAnimation);
    }
  }

  dispose(): void {
    this.wasGrounded = true;
    const mixer = this.animationMixer;
    this.animationMixer = null;
    this.actions.clear();
    if (!mixer) return;
    mixer.stopAllAction();
    mixer.uncacheRoot(mixer.getRoot());
  }
}
