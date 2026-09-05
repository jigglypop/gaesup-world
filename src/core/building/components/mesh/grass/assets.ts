const BLADE_ALPHA_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="128" viewBox="0 0 32 128">',
  '<rect width="32" height="128" fill="black"/>',
  '<path d="M16 2 C8 36 6 82 15 126 C23 82 24 36 16 2 Z" fill="white"/>',
  '</svg>',
].join('');

const BLADE_DIFFUSE_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="128" viewBox="0 0 32 128">',
  '<defs><linearGradient id="g" x1="0" y1="1" x2="0" y2="0">',
  '<stop offset="0" stop-color="#2f5f2b"/>',
  '<stop offset="0.55" stop-color="#66a846"/>',
  '<stop offset="1" stop-color="#b8dc69"/>',
  '</linearGradient></defs>',
  '<rect width="32" height="128" fill="#4f8d39"/>',
  '<path d="M16 2 C8 36 6 82 15 126 C23 82 24 36 16 2 Z" fill="url(#g)"/>',
  '</svg>',
].join('');

export const DEFAULT_BLADE_ALPHA_URL = `data:image/svg+xml,${encodeURIComponent(BLADE_ALPHA_SVG)}`;
export const DEFAULT_BLADE_DIFFUSE_URL = `data:image/svg+xml,${encodeURIComponent(BLADE_DIFFUSE_SVG)}`;

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

