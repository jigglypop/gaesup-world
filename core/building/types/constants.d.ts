export declare const TILE_CONSTANTS: Readonly<{
    readonly GRID_CELL_SIZE: 4;
    readonly SNAP_GRID_SIZE: 4;
    readonly HEIGHT_STEP: 1;
    readonly TILE_MULTIPLIERS: Readonly<{
        SMALL: 1;
        MEDIUM: 2;
        LARGE: 3;
        HUGE: 4;
    }>;
    readonly WALL_SIZES: Readonly<{
        WIDTH: 4;
        HEIGHT: 4;
        THICKNESS: 0.5;
        MIN_LENGTH: 0.5;
        MAX_LENGTH: 10;
    }>;
    readonly GRID_DIVISIONS: 25;
    readonly DEFAULT_GRID_SIZE: 100;
}>;
export declare const MATERIAL_PRESETS: Readonly<{
    readonly FLOOR: Readonly<{
        wood: Readonly<{
            roughness: 0.6;
            metalness: 0;
        }>;
        marble: Readonly<{
            roughness: 0.2;
            metalness: 0.1;
        }>;
        concrete: Readonly<{
            roughness: 0.8;
            metalness: 0;
        }>;
        tile: Readonly<{
            roughness: 0.3;
            metalness: 0.05;
        }>;
    }>;
    readonly WALL: Readonly<{
        brick: Readonly<{
            roughness: 0.8;
            metalness: 0;
        }>;
        plaster: Readonly<{
            roughness: 0.7;
            metalness: 0;
        }>;
        glass: Readonly<{
            roughness: 0.1;
            metalness: 0.1;
            opacity: 0.3;
        }>;
        metal: Readonly<{
            roughness: 0.3;
            metalness: 0.8;
        }>;
    }>;
}>;
