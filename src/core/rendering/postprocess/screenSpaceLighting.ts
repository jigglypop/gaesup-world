import { UnsignedByteType, type Camera, type Material, type PerspectiveCamera } from 'three';
import type { Node, PassNode, TextureNode } from 'three/webgpu';

type Tsl = typeof import('three/tsl');
type GiModule = typeof import('three/addons/tsl/display/SSGINode.js');
type ReflectionModule = typeof import('three/addons/tsl/display/SSRNode.js');
type DenoiseModule = typeof import('three/addons/tsl/display/DenoiseNode.js');

/** Uniform-only controls: changing them never rebuilds a shader or the pipeline. */
export type ScreenSpaceLightingSettings = {
  giRadius: number;
  giSteps: number;
  giIntensity: number;
  giResolutionScale: number;
  reflectionDistance: number;
  reflectionQuality: number;
  reflectionIntensity: number;
  reflectionResolutionScale: number;
  reflectionMaxRoughness: number;
};

export type ScreenSpaceLightingModules = {
  gi: GiModule | null;
  reflections: ReflectionModule | null;
  denoise: DenoiseModule | null;
};

export type ScreenSpaceLighting = {
  /** The scene colour with bounced light, its occlusion and reflections, drawn once per frame. */
  color: TextureNode;
  update(settings: ScreenSpaceLightingSettings): void;
  dispose(): void;
};

type Disposable = { dispose(): void };
type SceneTextures = { color: TextureNode; depth: TextureNode; normal: TextureNode; surface: TextureNode };
/** One effect: how it changes the lit colour, and the uniforms its settings move. */
type Stage = { apply(lit: Node<'vec3'>): Node<'vec3'>; update(settings: ScreenSpaceLightingSettings): void };

/** Slices per pixel, three's preset for temporally accumulated SSGI; `giSteps` sets the samples along each. */
const GI_SLICES = 2;
/** World units a GI sample may sit off the filtered pixel's plane and still be averaged with it. */
const GI_DEPTH_PHI = 0.5;
/** Brightest luminance a surface bounces: specular highlights above it would scatter as fireflies. */
const GI_SOURCE_LUMINANCE = 4;
/** World units a reflected ray may pass behind a surface and still count as hitting it. */
const REFLECTION_THICKNESS = 0.35;
const UNLIT_FLAGS = ['isMeshBasicMaterial', 'isLineBasicMaterial', 'isPointsMaterial', 'isSpriteMaterial'];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const flag = (material: Material | null, name: string) => (material as unknown as Record<string, unknown> | null)?.[name] === true;
const isPbr = (material: Material | null) => flag(material, 'isMeshStandardMaterial');
const isUnlit = (material: Material | null) =>
  !material || UNLIT_FLAGS.some((name) => flag(material, name)) || (flag(material, 'isNodeMaterial') && !flag(material, 'lights'));

/** Disposes every resource even when one throws, then rethrows the first failure. */
export function disposeAll(resources: readonly (Disposable | null | undefined)[]): void {
  let failure: unknown = null;
  for (const resource of resources) {
    try {
      resource?.dispose();
    } catch (error) {
      failure ??= error;
    }
  }
  if (failure !== null) throw failure;
}

/** Loads the addons the enabled effects need; GI comes with the filter that smooths it. */
export function loadScreenSpaceLighting(gi: boolean, reflections: boolean): Promise<ScreenSpaceLightingModules> {
  return Promise.all([
    gi ? import('three/addons/tsl/display/SSGINode.js') : null,
    reflections ? import('three/addons/tsl/display/SSRNode.js') : null,
    gi ? import('three/addons/tsl/display/DenoiseNode.js') : null,
  ]).then(([giModule, reflectionModule, denoiseModule]) => ({ gi: giModule, reflections: reflectionModule, denoise: denoiseModule }));
}

/**
 * Scene-pass outputs the GI and reflection passes read, picked per material when its shader builds: `normal` holds the
 * view normal and roughness, `surface` the base colour and metalness. Only standard and physical materials reflect
 * (others write roughness 1), and unlit materials write black, so they receive no bounced light.
 */
export function surfaceOutputs(tsl: Tsl): { normal: Node; surface: Node } {
  return {
    normal: tsl.Fn(({ material }) => tsl.vec4(tsl.normalView, isPbr(material) ? tsl.roughness : tsl.float(1)))(),
    surface: tsl.Fn(({ material }) =>
      isPbr(material)
        ? tsl.vec4(tsl.diffuseColor.rgb, tsl.metalness)
        : tsl.vec4(isUnlit(material) ? tsl.vec3(0) : tsl.diffuseColor.rgb, 0),
    )(),
  };
}

/**
 * Depth between texels, interpolated from the four around it. Screen-space depth is linear across a plane, so this is
 * exact there, and GI below full resolution does not band where its pixel centres fall between depth texels.
 */
function planarDepth(tsl: Tsl, depth: TextureNode) {
  return tsl.sample((uv) => {
    const size = tsl.vec2(depth.size(tsl.int(0)) as Node<'ivec2'>);
    const position = uv.mul(size).sub(0.5);
    const corner = position.floor();
    const weight = position.sub(corner);
    // Gather at the corner the four texels share, so the footprint always matches the weights.
    const texels = depth.gather().sample(corner.add(1).div(size));
    return tsl.vec4(tsl.mix(tsl.mix(texels.w, texels.z, weight.x), tsl.mix(texels.x, texels.y, weight.x), weight.y));
  });
}

/**
 * SSGI: one bounce of indirect diffuse light and its occlusion, filtered at GI resolution (depth and normal aware) and
 * upsampled. Unfiltered, GI below full resolution leaves blocky noise that temporal AA cannot average away: its
 * neighbourhood clamp keeps the blocks as detail.
 */
function globalIllumination(
  tsl: Tsl,
  { ssgi }: GiModule,
  { denoise }: DenoiseModule,
  { color, depth, normal, surface }: SceneTextures,
  camera: Camera,
  temporal: boolean,
  owned: Disposable[],
): Stage {
  const smoothDepth = planarDepth(tsl, depth);
  // Bright specular highlights would scatter as fireflies; bounced light is capped at GI_SOURCE_LUMINANCE.
  const source = tsl.sample((uv) => {
    const radiance = color.sample(uv);
    return tsl.vec4(radiance.rgb.mul(tsl.float(GI_SOURCE_LUMINANCE).div(tsl.luminance(radiance.rgb).max(GI_SOURCE_LUMINANCE))), radiance.a);
  });
  const gi = ssgi(source, smoothDepth, normal, camera as PerspectiveCamera);
  owned.push(gi);
  gi.sliceCount.value = GI_SLICES;
  gi.useScreenSpaceSampling.value = false;
  gi.useTemporalFiltering = temporal;
  // r186 SSGINode has no resolution scale; it sizes its target from the drawing buffer through setSize every frame.
  let scale = 1;
  const sized = gi as unknown as { setSize(width: number, height: number): void };
  const setSize = sized.setSize.bind(gi);
  sized.setSize = (width, height) => setSize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
  const filter = (node: Node) => {
    const filtered = denoise(node, smoothDepth, normal, camera);
    filtered.depthPhi.value = GI_DEPTH_PHI;
    owned.push(filtered);
    // DenoiseNode outputs a vec4; its typings leave the output type open.
    return filtered as unknown as Node<'vec4'>;
  };
  const smoothed = tsl.rtt(tsl.vec4(filter(gi.getGINode()).rgb, filter(gi.getAONode()).r));
  owned.push(smoothed);
  return {
    // Metals scatter no diffuse light, so bounced light reaches the base colour by (1 - metalness).
    apply: (lit) => lit.mul(smoothed.a).add(surface.rgb.mul(surface.a.oneMinus()).mul(smoothed.rgb)),
    update(settings) {
      gi.radius.value = Math.max(0.01, settings.giRadius);
      gi.stepCount.value = clamp(Math.round(settings.giSteps), 1, 32);
      gi.giIntensity.value = Math.max(0, settings.giIntensity);
      scale = clamp(settings.giResolutionScale, 0.25, 1);
      smoothed.setResolutionScale(scale);
    },
  };
}

/** SSR: mirror reflections blurred by roughness; metals reflect fully and tinted, glossy dielectrics by Fresnel. */
function reflections(
  tsl: Tsl,
  { ssr }: ReflectionModule,
  { color, depth, normal, surface }: SceneTextures,
  camera: Camera,
  owned: Disposable[],
): Stage {
  const maxRoughness = tsl.uniform(1);
  const toCamera = (camera as PerspectiveCamera).isPerspectiveCamera
    ? tsl.getViewPosition(tsl.uv(), tsl.float(0.5), tsl.uniform(camera.projectionMatrixInverse)).normalize().negate()
    : tsl.vec3(0, 0, 1);
  const fresnel = tsl.float(1).sub(tsl.dot(normal.rgb.normalize(), toCamera).saturate()).pow(5).mul(0.96).add(0.04);
  const gloss = tsl.float(1).sub(normal.a.div(maxRoughness)).saturate();
  // A zero weight skips the pixel before any ray is marched.
  const reflectance = tsl.mix(fresnel, tsl.float(1), surface.a).mul(gloss);
  // Metals tint what they reflect; the mask keeps the roughness blur of neighbouring reflections off matte pixels.
  const tint = tsl.mix(tsl.vec3(1), surface.rgb, surface.a).mul(tsl.step(1e-4, gloss));
  // The pass samples the normal texture itself (`.sample()`), so it gets the texture rather than its `.rgb`.
  const normalTexture = normal as unknown as Node<'vec3'>;
  const node = ssr(color, depth, normalTexture, { metalnessNode: reflectance, roughnessNode: normal.a, camera });
  owned.push(node);
  node.thickness.value = REFLECTION_THICKNESS;
  return {
    apply: (lit) => lit.add(node.rgb.mul(tint)),
    update(settings) {
      node.maxDistance.value = Math.max(0.01, settings.reflectionDistance);
      node.quality.value = clamp(settings.reflectionQuality, 0.05, 1);
      node.intensity.value = Math.max(0, settings.reflectionIntensity);
      node.resolutionScale = clamp(settings.reflectionResolutionScale, 0.25, 1);
      maxRoughness.value = clamp(settings.reflectionMaxRoughness, 0.01, 1);
    },
  };
}

/**
 * Lumen-style screen-space lighting over a scene pass that writes `surfaceOutputs`. Both effects land in one texture,
 * so temporal AA accumulates the GI noise and bloom reads the lit colour once.
 */
export function createScreenSpaceLighting(
  tsl: Tsl,
  modules: ScreenSpaceLightingModules,
  scenePass: PassNode,
  camera: Camera,
  temporal: boolean,
): ScreenSpaceLighting {
  scenePass.getTexture('surface').type = UnsignedByteType;
  const textures: SceneTextures = {
    color: scenePass.getTextureNode('output'),
    depth: scenePass.getTextureNode('depth'),
    normal: scenePass.getTextureNode('normal'),
    surface: scenePass.getTextureNode('surface'),
  };
  const owned: Disposable[] = [];
  const stages: Stage[] = [];
  if (modules.gi && modules.denoise) stages.push(globalIllumination(tsl, modules.gi, modules.denoise, textures, camera, temporal, owned));
  if (modules.reflections) stages.push(reflections(tsl, modules.reflections, textures, camera, owned));
  const lit = stages.reduce((color, stage) => stage.apply(color), textures.color.rgb as Node<'vec3'>);
  const composite = tsl.rtt(tsl.vec4(lit, textures.color.a));
  owned.push(composite);
  return {
    color: composite,
    update(settings) {
      for (const stage of stages) stage.update(settings);
    },
    dispose: () => disposeAll(owned),
  };
}
