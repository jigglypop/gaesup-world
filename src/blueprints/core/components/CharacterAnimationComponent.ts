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
  enabled: boolean = true;
  private props: CharacterAnimationProps;
  private currentAnimation: string;
  private animationMixer?: THREE.AnimationMixer;
  private actions: Map<string, THREE.AnimationAction> = new Map();

  constructor(props: CharacterAnimationProps) {
    this.props = props;
    this.currentAnimation = props.defaultAnimation;
  }

  initialize(context: ComponentContext): void {
    if (context.innerGroupRef?.current) {
      this.animationMixer = new THREE.AnimationMixer(context.innerGroupRef.current);
      this.setupAnimations(context);
    }
  }

  private setupAnimations(context: ComponentContext): void {
    const animations = (window as any).__loadedAnimations || {};
    
    Object.entries(this.props.animations).forEach(([key, value]) => {
      if (typeof value === 'string' && animations[value]) {
        const action = this.animationMixer!.clipAction(animations[value]);
        this.actions.set(key, action);
      }
    });
    
    this.playAnimation(this.currentAnimation);
  }

  private playAnimation(name: string): void {
    this.actions.forEach((action) => action.stop());
    
    const action = this.actions.get(name);
    if (action) {
      action.reset().play();
      this.currentAnimation = name;
    }
  }

  update(context: ComponentContext): void {
    if (!this.animationMixer) return;
    
    this.animationMixer.update(context.deltaTime);
    
    const keyboard = (window as any).__keyboardState || {};
    const rigidBody = context.rigidBodyRef.current;
    
    if (!rigidBody) return;
    
    const velocity = rigidBody.linvel();
    const speed = Math.sqrt(velocity.x ** 2 + velocity.z ** 2);
    
    let targetAnimation = 'idle';
    
    if (velocity.y > 0.1) {
      targetAnimation = 'jump';
    } else if (speed > 6) {
      targetAnimation = 'run';
    } else if (speed > 0.5) {
      targetAnimation = 'walk';
    }
    
    if (targetAnimation !== this.currentAnimation) {
      this.playAnimation(targetAnimation);
    }
  }

  dispose(): void {
    this.actions.forEach((action) => action.stop());
    this.actions.clear();
    this.animationMixer?.stopAllAction();
  }
} 