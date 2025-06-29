export declare const CAMERA_CONSTANTS: {
    readonly THROTTLE_MS: 16;
    readonly POSITION_THRESHOLD: 0.001;
    readonly TARGET_THRESHOLD: 0.001;
    readonly DEFAULT_LERP_SPEED: 0.1;
    readonly DEFAULT_FOV_LERP: 0.05;
    readonly MIN_FOV: 10;
    readonly MAX_FOV: 120;
    readonly FRAME_RATE_LERP_SPEED: 8;
};
export declare const CAMERA_DEFAULTS: {
    readonly OFFSET: import("three").Vector3;
    readonly MAX_DISTANCE: -7;
    readonly DISTANCE: -1;
    readonly X_DISTANCE: 15;
    readonly Y_DISTANCE: 8;
    readonly Z_DISTANCE: 15;
    readonly ZOOM: 1;
    readonly TARGET: import("three").Vector3;
    readonly POSITION: import("three").Vector3;
    readonly FOCUS: false;
    readonly ENABLE_COLLISION: true;
    readonly COLLISION_MARGIN: 0.1;
    readonly SMOOTHING: {
        readonly POSITION: 0.08;
        readonly ROTATION: 0.1;
        readonly FOV: 0.1;
    };
    readonly FOV: 75;
    readonly MIN_FOV: 10;
    readonly MAX_FOV: 120;
    readonly BOUNDS: {
        readonly MIN_Y: 2;
        readonly MAX_Y: 50;
    };
};
