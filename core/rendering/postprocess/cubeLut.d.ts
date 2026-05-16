import * as THREE from 'three';
/**
 * Adobe Cube LUT (.cube) parser.
 *
 * Supports `LUT_3D_SIZE N` and `LUT_1D_SIZE N` headers, optional
 * `DOMAIN_MIN` / `DOMAIN_MAX`, and `TITLE`. Lines starting with `#` are
 * treated as comments. RGB triplets (separated by whitespace) make up the
 * payload, ordered with the red index varying fastest, then green, then
 * blue, exactly like the Adobe specification.
 *
 * Returned data is a `Float32Array` of length `size * size * size * 4`
 * (RGBA, alpha set to 1) packed in the layout expected by
 * `THREE.Data3DTexture` so it can be uploaded directly to the GPU.
 */
export type CubeLutData = {
    size: number;
    data: Float32Array;
    domainMin: [number, number, number];
    domainMax: [number, number, number];
    title?: string;
};
export declare function parseCubeLut(text: string): CubeLutData;
export declare function createLutTexture(lut: CubeLutData): THREE.Data3DTexture;
export declare function loadCubeLut(url: string): Promise<CubeLutData>;
export declare function loadCubeLutTexture(url: string): Promise<THREE.Data3DTexture>;
