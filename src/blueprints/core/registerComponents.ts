import {
  toCharacterAnimationProps,
  toCharacterMovementProps,
  toGravityForceProperties,
} from './componentProps';
import { ComponentRegistry } from './ComponentRegistry';
import { CharacterAnimationComponent } from './components/CharacterAnimationComponent';
import { CharacterMovementComponent } from './components/CharacterMovementComponent';
import { GravityForceComponent } from './components/GravityForceComponent';
import type { ComponentFactory } from './types';

export function registerDefaultComponents(): void {
  const registry = ComponentRegistry.getInstance();
  const registerDefault = (type: string, factory: ComponentFactory) => {
    if (!registry.getFactory(type)) registry.register(type, factory);
  };

  // Force Components
  registerDefault(
    'GravityForce',
    (props) => new GravityForceComponent(toGravityForceProperties(props)),
  );

  // Character Components
  registerDefault(
    'CharacterMovement',
    (props) => new CharacterMovementComponent(toCharacterMovementProps(props)),
  );
  registerDefault(
    'CharacterAnimation',
    (props) => new CharacterAnimationComponent(toCharacterAnimationProps(props)),
  );
  for (const type of [
    'CharacterPhysics',
    'CharacterStats',
    'CharacterBehavior',
    'VehicleMovement',
    'VehiclePhysics',
    'VehicleSeats',
    'VehicleAnimation',
    'AirplaneMovement',
    'AirplanePhysics',
    'AirplaneSeats',
    'AirplaneAnimation',
  ]) {
    registerDefault(type, (props) => ({
      ...props,
      type,
      enabled: true,
      initialize: () => {},
      update: () => {},
      dispose: () => {},
    }));
  }
}
