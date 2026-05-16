import { BlueprintDefinition } from './types';
export declare class BlueprintLoader {
    private static blueprints;
    static load(path: string): Promise<BlueprintDefinition>;
    static loadFromJSON(json: string | object): BlueprintDefinition;
    static get(id: string): BlueprintDefinition | undefined;
    static getAll(): BlueprintDefinition[];
    static clear(): void;
}
