import { BlueprintFactory } from '../BlueprintFactory';
import { ComponentRegistry } from '../../core/ComponentRegistry';
import { CharacterMovementComponent } from '../../core/components/CharacterMovementComponent';
import { registerDefaultComponents } from '../../core/registerComponents';
import type { ComponentFactory } from '../../core/types';

test('behavior properties cannot replace the registered component identity', () => {
  const registry = ComponentRegistry.getInstance();
  registerDefaultComponents();
  try {
    const component = registry.create({
      type: 'CharacterBehavior',
      enabled: true,
      properties: { type: 'aggressive', data: { detectionRange: 10 } },
    });
    expect(component?.type).toBe('CharacterBehavior');
  } finally {
    registry.clear();
  }
});

test('factory initialization retains installed implementations and explicit overrides still work', () => {
  const registry = ComponentRegistry.getInstance();
  const customVehicle: ComponentFactory = () => ({
    type: 'VehicleMovement',
    enabled: true,
    initialize: jest.fn(),
    update: jest.fn(),
    dispose: jest.fn(),
  });
  registry.register('VehicleMovement', customVehicle);
  const factory = BlueprintFactory.getInstance();
  const movement = registry.getFactory('CharacterMovement');
  registerDefaultComponents();
  expect(registry.getFactory('CharacterMovement')).toBe(movement);
  expect(registry.getFactory('VehicleMovement')).toBe(customVehicle);
  const component = registry.create({ type: 'CharacterMovement', enabled: true, properties: {} });
  expect(component).toBeInstanceOf(CharacterMovementComponent);
  component?.dispose();
  factory.registerComponentFactory('CharacterMovement', customVehicle);
  registerDefaultComponents();
  expect(registry.getFactory('CharacterMovement')).toBe(customVehicle);
  expect(registry.getFactory('VehicleMovement')).toBe(customVehicle);
  registry.clear();
});
