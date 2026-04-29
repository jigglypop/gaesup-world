export const DEFAULT_BLADE_ALPHA_URL = '/resources/blade_alpha.jpg';
export const DEFAULT_BLADE_DIFFUSE_URL = '/resources/blade_diffuse.jpg';

export type GrassTextureSources = {
  bladeDiffuseUrl?: string;
  bladeAlphaUrl?: string;
};

export type ResolvedGrassTextureSources = {
  bladeDiffuseUrl: string;
  bladeAlphaUrl: string;
};

export function resolveGrassTextureSources(sources: GrassTextureSources = {}): ResolvedGrassTextureSources {
  return {
    bladeDiffuseUrl: sources.bladeDiffuseUrl ?? DEFAULT_BLADE_DIFFUSE_URL,
    bladeAlphaUrl: sources.bladeAlphaUrl ?? DEFAULT_BLADE_ALPHA_URL,
  };
}

