export * from './types';
export * from './registry';
export * from './factory';
export * from './hooks';
export * from './components/BlueprintEditor';
export * from './characters';
export * from './vehicles';
export { blueprintRegistry } from './registry';
export { WARRIOR_BLUEPRINT } from './characters/warrior';
export { FIRE_MAGE_BLUEPRINT } from './characters/mage';
export { BASIC_KART_BLUEPRINT } from './vehicles/kart';
export { BlueprintFactory } from './factory/BlueprintFactory';
export { BlueprintConverter } from './factory/BlueprintConverter';
export { BlueprintSpawner } from './components/BlueprintSpawner';
export { useBlueprint, useCharacterBlueprint, useVehicleBlueprint, useAirplaneBlueprint, useBlueprintsByType } from './hooks/useBlueprint';
export { useSpawnFromBlueprint } from './hooks/useSpawnFromBlueprint';

// Core exports
export * from './core';
export { BlueprintEntity, BlueprintLoader, ComponentRegistry, registerDefaultComponents } from './core';
export type { BlueprintDefinition, ComponentDefinition, IComponent, ComponentContext } from './core/types'; 