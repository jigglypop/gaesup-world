import { ComponentRegistry } from './ComponentRegistry';
import { GravityForceComponent } from './components/GravityForceComponent';
import { CharacterMovementComponent } from './components/CharacterMovementComponent';
import { CharacterAnimationComponent } from './components/CharacterAnimationComponent';

export function registerDefaultComponents(): void {
  const registry = ComponentRegistry.getInstance();
  
  // Force Components
  registry.register('GravityForce', (props) => new GravityForceComponent(props as any));
  
  // Character Components
  registry.register('CharacterMovement', (props) => new CharacterMovementComponent(props as any));
  registry.register('CharacterAnimation', (props) => new CharacterAnimationComponent(props as any));
  registry.register('CharacterPhysics', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('CharacterStats', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('CharacterBehavior', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  
  // Vehicle Components
  registry.register('VehicleMovement', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehiclePhysics', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehicleSeats', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehicleAnimation', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  
  // Airplane Components
  registry.register('AirplaneMovement', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplanePhysics', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplaneSeats', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplaneAnimation', (props) => ({
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
} 