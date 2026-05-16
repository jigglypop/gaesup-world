import { BlueprintDefinition } from '../core/types';
import { AnyBlueprint } from '../types';
export declare class BlueprintConverter {
    convert(blueprint: AnyBlueprint): BlueprintDefinition;
    private convertCharacter;
    private convertVehicle;
    private convertAirplane;
    convertToJSON(blueprint: AnyBlueprint): string;
    validateBlueprint(blueprint: AnyBlueprint): {
        valid: boolean;
        errors: string[];
    };
}
