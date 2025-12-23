import { useMemo } from 'react';

import { blueprintRegistry } from '../registry';
import { AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../types';

export function useBlueprint(blueprintId: string): AnyBlueprint | undefined {
  return useMemo(() => {
    return blueprintRegistry.get(blueprintId);
  }, [blueprintId]);
}

export function useCharacterBlueprint(blueprintId: string): CharacterBlueprint | undefined {
  const blueprint = useBlueprint(blueprintId);
  if (blueprint?.type === 'character') {
    return blueprint as CharacterBlueprint;
  }
  return undefined;
}

export function useVehicleBlueprint(blueprintId: string): VehicleBlueprint | undefined {
  const blueprint = useBlueprint(blueprintId);
  if (blueprint?.type === 'vehicle') {
    return blueprint as VehicleBlueprint;
  }
  return undefined;
}

export function useAirplaneBlueprint(blueprintId: string): AirplaneBlueprint | undefined {
  const blueprint = useBlueprint(blueprintId);
  if (blueprint?.type === 'airplane') {
    return blueprint as AirplaneBlueprint;
  }
  return undefined;
}

export function useBlueprintsByType<T extends AnyBlueprint>(type: T['type']): T[] {
  return useMemo(() => {
    return blueprintRegistry.getByType<T>(type);
  }, [type]);
} 