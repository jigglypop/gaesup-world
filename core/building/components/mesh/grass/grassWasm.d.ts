export type GrassOrientationData = {
    orientations: Float32Array;
    stretches: Float32Array;
    halfRootAngleSin: Float32Array;
    halfRootAngleCos: Float32Array;
};
type GrassWasmExports = {
    readonly memory: WebAssembly.Memory;
    readonly alloc_f32: (len: number) => number;
    readonly dealloc_f32: (ptr: number, len: number) => void;
    readonly fill_orientation_data: (instances: number, seed: number, orientationsPtr: number, stretchesPtr: number, halfRootAngleSinPtr: number, halfRootAngleCosPtr: number) => void;
};
export declare function loadGrassWasm(): Promise<GrassWasmExports | null>;
export declare function generateGrassOrientationDataWasm(instances: number, seed: number): Promise<GrassOrientationData | null>;
export {};
