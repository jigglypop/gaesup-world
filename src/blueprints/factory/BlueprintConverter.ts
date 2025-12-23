import { BlueprintDefinition, ComponentDefinition } from '../core/types';
import { AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../types';

export class BlueprintConverter {
  convert(blueprint: AnyBlueprint): BlueprintDefinition {
    const baseDefinition: BlueprintDefinition = {
      id: blueprint.id,
      name: blueprint.name,
      type: blueprint.type as 'character' | 'vehicle' | 'airplane' | 'object',
      components: [],
      metadata: blueprint.metadata
    };

    switch (blueprint.type) {
      case 'character':
        return this.convertCharacter(blueprint as CharacterBlueprint, baseDefinition);
      case 'vehicle':
        return this.convertVehicle(blueprint as VehicleBlueprint, baseDefinition);
      case 'airplane':
        return this.convertAirplane(blueprint as AirplaneBlueprint, baseDefinition);
      default:
        return baseDefinition;
    }
  }

  private convertCharacter(blueprint: CharacterBlueprint, base: BlueprintDefinition): BlueprintDefinition {
    const components: ComponentDefinition[] = [];

    components.push({
      type: 'CharacterPhysics',
      enabled: true,
      properties: {
        mass: blueprint.physics.mass,
        height: blueprint.physics.height,
        radius: blueprint.physics.radius,
        jumpForce: blueprint.physics.jumpForce,
        moveSpeed: blueprint.physics.moveSpeed,
        runSpeed: blueprint.physics.runSpeed,
        airControl: blueprint.physics.airControl
      }
    });

    components.push({
      type: 'CharacterMovement',
      enabled: true,
      properties: {
        walkSpeed: blueprint.physics.moveSpeed,
        runSpeed: blueprint.physics.runSpeed,
        jumpHeight: blueprint.physics.jumpForce / blueprint.physics.mass,
        airControl: blueprint.physics.airControl
      }
    });

    components.push({
      type: 'CharacterAnimation',
      enabled: true,
      properties: {
        animations: blueprint.animations,
        defaultAnimation: 'idle'
      }
    });

    if (blueprint.stats) {
      components.push({
        type: 'CharacterStats',
        enabled: true,
        properties: blueprint.stats
      });
    }

    if (blueprint.behaviors) {
      components.push({
        type: 'CharacterBehavior',
        enabled: true,
        properties: {
          type: blueprint.behaviors.type,
          data: blueprint.behaviors.data
        }
      });
    }

    return {
      ...base,
      components,
      physics: {
        mass: blueprint.physics.mass,
        friction: 0.5,
        restitution: 0,
        linearDamping: 4,
        angularDamping: 10
      }
    };
  }

  private convertVehicle(blueprint: VehicleBlueprint, base: BlueprintDefinition): BlueprintDefinition {
    const components: ComponentDefinition[] = [];

    components.push({
      type: 'VehiclePhysics',
      enabled: true,
      properties: {
        mass: blueprint.physics.mass,
        maxSpeed: blueprint.physics.maxSpeed,
        acceleration: blueprint.physics.acceleration,
        braking: blueprint.physics.braking,
        turning: blueprint.physics.turning,
        suspension: blueprint.physics.suspension
      }
    });

    components.push({
      type: 'VehicleMovement',
      enabled: true,
      properties: {
        maxSpeed: blueprint.physics.maxSpeed,
        acceleration: blueprint.physics.acceleration,
        braking: blueprint.physics.braking,
        turning: blueprint.physics.turning
      }
    });

    if (blueprint.seats) {
      components.push({
        type: 'VehicleSeats',
        enabled: true,
        properties: {
          seats: blueprint.seats
        }
      });
    }

    if (blueprint.animations) {
      components.push({
        type: 'VehicleAnimation',
        enabled: true,
        properties: {
          animations: blueprint.animations
        }
      });
    }

    return {
      ...base,
      components,
      physics: {
        mass: blueprint.physics.mass,
        friction: 0.8,
        restitution: 0.2,
        linearDamping: 0.5,
        angularDamping: 1
      }
    };
  }

  private convertAirplane(blueprint: AirplaneBlueprint, base: BlueprintDefinition): BlueprintDefinition {
    const components: ComponentDefinition[] = [];

    components.push({
      type: 'AirplanePhysics',
      enabled: true,
      properties: {
        mass: blueprint.physics.mass,
        maxSpeed: blueprint.physics.maxSpeed,
        acceleration: blueprint.physics.acceleration,
        turning: blueprint.physics.turning,
        lift: blueprint.physics.lift,
        drag: blueprint.physics.drag
      }
    });

    components.push({
      type: 'AirplaneMovement',
      enabled: true,
      properties: {
        maxSpeed: blueprint.physics.maxSpeed,
        acceleration: blueprint.physics.acceleration,
        turning: blueprint.physics.turning,
        lift: blueprint.physics.lift,
        drag: blueprint.physics.drag
      }
    });

    if (blueprint.seats) {
      components.push({
        type: 'AirplaneSeats',
        enabled: true,
        properties: {
          seats: blueprint.seats
        }
      });
    }

    if (blueprint.animations) {
      components.push({
        type: 'AirplaneAnimation',
        enabled: true,
        properties: {
          animations: blueprint.animations
        }
      });
    }

    return {
      ...base,
      components,
      physics: {
        mass: blueprint.physics.mass,
        friction: 0.1,
        restitution: 0.1,
        linearDamping: 0.2,
        angularDamping: 0.5
      }
    };
  }

  convertToJSON(blueprint: AnyBlueprint): string {
    const definition = this.convert(blueprint);
    return JSON.stringify(definition, null, 2);
  }

  validateBlueprint(blueprint: AnyBlueprint): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!blueprint.id) errors.push('Blueprint must have an id');
    if (!blueprint.name) errors.push('Blueprint must have a name');
    if (!blueprint.type) errors.push('Blueprint must have a type');
    if (!blueprint.version) errors.push('Blueprint must have a version');

    switch (blueprint.type) {
      case 'character':
        const charBlueprint = blueprint as CharacterBlueprint;
        if (!charBlueprint.physics) errors.push('Character blueprint must have physics');
        if (!charBlueprint.animations) errors.push('Character blueprint must have animations');
        if (!charBlueprint.stats) errors.push('Character blueprint must have stats');
        break;
      case 'vehicle':
        const vehicleBlueprint = blueprint as VehicleBlueprint;
        if (!vehicleBlueprint.physics) errors.push('Vehicle blueprint must have physics');
        if (!vehicleBlueprint.seats) errors.push('Vehicle blueprint must have seats');
        break;
      case 'airplane':
        const airplaneBlueprint = blueprint as AirplaneBlueprint;
        if (!airplaneBlueprint.physics) errors.push('Airplane blueprint must have physics');
        if (!airplaneBlueprint.seats) errors.push('Airplane blueprint must have seats');
        break;
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
} 