export declare const PHYSICS_CONSTANTS: Readonly<{
    readonly GRAVITY: -9.81;
    readonly MAX_FALL_SPEED: 50;
    readonly DEFAULT_MASS: 70;
    readonly DEFAULT_FRICTION: 0.5;
    readonly DEFAULT_RESTITUTION: 0.2;
}>;
export declare const CAMERA_CONSTANTS: Readonly<{
    readonly DEFAULT_FOV: 60;
    readonly MIN_FOV: 30;
    readonly MAX_FOV: 90;
    readonly DEFAULT_DISTANCE: 10;
    readonly MIN_DISTANCE: 2;
    readonly MAX_DISTANCE: 50;
    readonly TRANSITION_SPEED: 0.1;
}>;
export declare const UI_CONSTANTS: Readonly<{
    readonly PANEL_MIN_WIDTH: 200;
    readonly PANEL_MIN_HEIGHT: 100;
    readonly PANEL_DEFAULT_WIDTH: 300;
    readonly PANEL_DEFAULT_HEIGHT: 400;
    readonly ANIMATION_DURATION: 300;
    readonly DEBOUNCE_DELAY: 300;
}>;
export declare const GAME_CONSTANTS: Readonly<{
    readonly MAX_PLAYERS: 100;
    readonly MAX_OBJECTS: 10000;
    readonly UPDATE_INTERVAL: number;
    readonly SAVE_INTERVAL: 60000;
    readonly INTERACTION_DISTANCE: 5;
}>;
export declare const STORAGE_KEYS: Readonly<{
    readonly USER_PREFERENCES: "user_preferences";
    readonly GAME_STATE: "game_state";
    readonly CAMERA_SETTINGS: "camera_settings";
    readonly EDITOR_LAYOUT: "editor_layout";
}>;
