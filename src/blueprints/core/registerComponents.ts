import { ComponentRegistry } from './ComponentRegistry';
import { CharacterAnimationComponent } from './components/CharacterAnimationComponent';
import { CharacterMovementComponent } from './components/CharacterMovementComponent';
import { GravityForceComponent } from './components/GravityForceComponent';

export function registerDefaultComponents(): void {
  const registry = ComponentRegistry.getInstance();
  
  // Force Components
  registry.register('GravityForce', (props) => new GravityForceComponent(props as any));
  
  // Character Components
  registry.register('CharacterMovement', (props) => new CharacterMovementComponent(props as any));
  registry.register('CharacterAnimation', (props) => new CharacterAnimationComponent(props as any));
  registry.register('CharacterPhysics', (props) => ({
    type: 'CharacterPhysics',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('CharacterStats', (props) => ({
    type: 'CharacterStats',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('CharacterBehavior', (props) => ({
    type: 'CharacterBehavior',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  
  // Vehicle Components
  registry.register('VehicleMovement', (props) => ({
    type: 'VehicleMovement',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehiclePhysics', (props) => ({
    type: 'VehiclePhysics',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehicleSeats', (props) => ({
    type: 'VehicleSeats',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('VehicleAnimation', (props) => ({
    type: 'VehicleAnimation',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  
  // Airplane Components
  registry.register('AirplaneMovement', (props) => ({
    type: 'AirplaneMovement',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplanePhysics', (props) => ({
    type: 'AirplanePhysics',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplaneSeats', (props) => ({
    type: 'AirplaneSeats',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
  registry.register('AirplaneAnimation', (props) => ({
    type: 'AirplaneAnimation',
    enabled: true,
    initialize: () => {},
    update: () => {},
    dispose: () => {},
    ...props
  }));
} 