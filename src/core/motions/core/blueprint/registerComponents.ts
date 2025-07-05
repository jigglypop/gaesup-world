import { ComponentRegistry } from './ComponentRegistry';
import { GravityForceComponent } from './components/GravityForceComponent';

export function registerDefaultComponents(): void {
  const registry = ComponentRegistry.getInstance();
  
  // Force Components
  registry.register('GravityForce', (props) => new GravityForceComponent(props as any));
  
  // Movement Components (추후 추가)
  // registry.register('CharacterMovement', (props) => new CharacterMovementComponent(props));
  // registry.register('VehicleMovement', (props) => new VehicleMovementComponent(props));
  // registry.register('AirplaneMovement', (props) => new AirplaneMovementComponent(props));
  
  // Direction Components (추후 추가)
  // registry.register('MouseDirection', (props) => new MouseDirectionComponent(props));
  // registry.register('KeyboardDirection', (props) => new KeyboardDirectionComponent(props));
} 