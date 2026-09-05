import { resolveGrassTextureSources } from '../assets';

describe('grass texture sources', () => {
  it('uses packaged blade textures by default', () => {
    const sources = resolveGrassTextureSources();

    expect(sources.bladeDiffuseUrl).toMatch(/^data:image\/svg\+xml,/);
    expect(sources.bladeAlphaUrl).toMatch(/^data:image\/svg\+xml,/);
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
