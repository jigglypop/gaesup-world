export declare const DEFAULT_BLADE_ALPHA_URL: string;
export declare const DEFAULT_BLADE_DIFFUSE_URL: string;
export type GrassTextureSources = {
    bladeDiffuseUrl?: string;
    bladeAlphaUrl?: string;
};
export type ResolvedGrassTextureSources = {
    bladeDiffuseUrl: string;
    bladeAlphaUrl: string;
};
export declare function resolveGrassTextureSources(sources?: GrassTextureSources): ResolvedGrassTextureSources;
