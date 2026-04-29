import { resolveGrassTextureSources } from '../assets';

describe('grass texture sources', () => {
  it('uses packaged blade textures by default', () => {
    const sources = resolveGrassTextureSources();

    expect(sources.bladeDiffuseUrl).toContain('blade_diffuse');
    expect(sources.bladeAlphaUrl).toContain('blade_alpha');
  });

  it('allows games to override blade textures without replacing the component', () => {
    expect(resolveGrassTextureSources({
      bladeDiffuseUrl: '/custom/grass_diffuse.png',
      bladeAlphaUrl: '/custom/grass_alpha.png',
    })).toEqual({
      bladeDiffuseUrl: '/custom/grass_diffuse.png',
      bladeAlphaUrl: '/custom/grass_alpha.png',
    });
  });
});
