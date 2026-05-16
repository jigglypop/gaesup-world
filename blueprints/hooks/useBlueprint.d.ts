import { AnyBlueprint, CharacterBlueprint, VehicleBlueprint, AirplaneBlueprint } from '../types';
export declare function useBlueprint(blueprintId: string): AnyBlueprint | undefined;
export declare function useCharacterBlueprint(blueprintId: string): CharacterBlueprint | undefined;
export declare function useVehicleBlueprint(blueprintId: string): VehicleBlueprint | undefined;
export declare function useAirplaneBlueprint(blueprintId: string): AirplaneBlueprint | undefined;
export declare function useBlueprintsByType<T extends AnyBlueprint>(type: T['type']): T[];
