import type { BufferGeometry, Camera, Material, Object3D, Scene } from 'three';

import { isGpuBatchRevision } from './gpuBatchRevision';

/**
 * Compiling content ahead of its first draw: for the target the scene is drawn into, for the shadow cascades that draw
 * it one render deeper, and the count of gates still compiling, which load progress waits for.
 */

type AsyncCompiler = { compileAsync: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Promise<unknown> };
type TargetedRenderer = {
  getRenderTarget(): unknown;
  setRenderTarget(target: unknown): void;
  getMRT(): unknown;
  setMRT(mrt: unknown): void;
};
/** Where a pass draws the scene (postprocessing): its render target and MRT outputs select the scene's pipelines. */
export type SceneRenderTarget = { renderTarget: unknown; mrt: unknown };

/** The target each renderer draws the scene into; a gate compiles again when it changes. */
export const sceneTargets = new WeakMap<object, SceneRenderTarget>();

/** Registers the target a renderer draws the scene into, or clears it, so gates compile for that target. */
export function setSceneRenderTarget(renderer: TargetedRenderer, target: SceneRenderTarget | null): void {
  if (target) sceneTargets.set(renderer, target);
  else sceneTargets.delete(renderer);
}

export function canCompileAsync(renderer: unknown): renderer is AsyncCompiler {
  // Verified against the revisions whose compileAsync collects render objects synchronously before its first await.
  return isGpuBatchRevision() && typeof (renderer as Partial<AsyncCompiler> | null)?.compileAsync === 'function';
}

const canSwitchTargets = (renderer: object): renderer is TargetedRenderer =>
  typeof (renderer as Partial<TargetedRenderer>).setRenderTarget === 'function'
  && typeof (renderer as Partial<TargetedRenderer>).setMRT === 'function';

/** Runs `compile` with `target` and `mrt` on the renderer; compileAsync reads them before its first await. */
function withTarget<T>(renderer: TargetedRenderer, target: unknown, mrt: unknown, compile: () => T): T {
  const previousTarget = renderer.getRenderTarget();
  const previousMRT = renderer.getMRT();
  renderer.setRenderTarget(target);
  renderer.setMRT(mrt);
  try {
    return compile();
  } finally {
    renderer.setRenderTarget(previousTarget);
    renderer.setMRT(previousMRT);
  }
}

type RenderContexts = { get(target?: unknown, mrt?: unknown, depth?: number): unknown };
type NodeBuilds = { getForRender(renderObject: object): unknown; getForRenderAsync(renderObject: object): Promise<unknown> };
type PassRenderer = TargetedRenderer & { _renderContexts?: Partial<RenderContexts>; _nodes?: Partial<NodeBuilds> };

/** Render contexts of passes with extra outputs, and the target and outputs their objects' shaders are built for. */
const passContexts = new WeakMap<object, SceneRenderTarget>();
const buildingForPasses = new WeakSet<object>();

/**
 * three builds a compiled object's shaders on later tasks, reading the render target and MRT from the renderer, which
 * by then draws to the canvas: a pass with extra outputs would get, and keep, shaders without them. Objects compiled for
 * such a pass build at once instead, with the renderer set to the pass. False where the renderer's internals differ.
 */
function buildsForPasses(renderer: object): renderer is PassRenderer {
  if (!canSwitchTargets(renderer)) return false;
  const { _renderContexts: contexts, _nodes: nodes } = renderer as PassRenderer;
  if (typeof contexts?.get !== 'function' || typeof nodes?.getForRender !== 'function' || typeof nodes.getForRenderAsync !== 'function')
    return false;
  if (buildingForPasses.has(nodes)) return true;
  buildingForPasses.add(nodes);
  const build = nodes.getForRender;
  const buildLater = nodes.getForRenderAsync;
  nodes.getForRenderAsync = function (this: NodeBuilds, renderObject: object) {
    const pass = passContexts.get((renderObject as { context: object }).context);
    return pass
      ? Promise.resolve(withTarget(renderer, pass.renderTarget, pass.mrt, () => build.call(this, renderObject)))
      : buildLater.call(this, renderObject);
  };
  return true;
}

/** Marks the render context `target` draws the scene with, so objects compiled for it build for its outputs. */
function registerPass(renderer: PassRenderer, target: SceneRenderTarget): void {
  const context = renderer._renderContexts?.get?.(target.renderTarget, target.mrt);
  if (typeof context === 'object' && context !== null) passContexts.set(context, target);
}

/** Whether content can compile ahead for where the scene is drawn: a pass with extra outputs needs `buildsForPasses`. */
const compilesAhead = (renderer: object) => !sceneTargets.get(renderer)?.mrt || buildsForPasses(renderer);

/** Targets drawn with one render context at every nesting depth; see `drawAtAnyDepth`. */
const anyDepth = new WeakSet<object>();
const keyingByTarget = new WeakSet<object>();

/**
 * three keys a render context by how deep in nested renders it draws, and how deep a pass or a shadow map draws depends
 * on what draws it: a postprocessing pass sits inside the passes that read it, and a shadow map inside whatever draws
 * the scene. Content compiled ahead for such a target would get pipelines for a context it never draws with. The targets
 * compiled for here use one context at every depth instead; none is ever drawn inside a render into itself.
 */
function drawAtAnyDepth(renderer: object, target: unknown): void {
  const contexts = (renderer as { _renderContexts?: Partial<RenderContexts> })._renderContexts;
  if (typeof contexts?.get !== 'function' || typeof target !== 'object' || target === null) return;
  anyDepth.add(target);
  if (keyingByTarget.has(contexts)) return;
  keyingByTarget.add(contexts);
  const get = contexts.get;
  contexts.get = function (this: RenderContexts, renderTarget?: unknown, mrt?: unknown, depth?: number) {
    return get.call(this, renderTarget, mrt, anyDepth.has(renderTarget as object) ? 0 : depth);
  };
}

/** One cascade of a cascaded sun: its node draws casters with the light's shadow material into its map. */
type ShadowCascade = { shadowMap: object; shadow: { camera: Camera }; getShadowMaterial: () => Material };

/** The cascades, with a map already, of the scene's shadow-casting directional lights (three's CSMShadowNode). */
function shadowCascades(scene: Scene): ShadowCascade[] {
  const cascades: ShadowCascade[] = [];
  scene.traverseVisible((object) => {
    const light = object as Object3D & { isDirectionalLight?: boolean; shadow?: { shadowNode?: { _shadowNodes?: Partial<ShadowCascade>[] } } };
    if (!light.isDirectionalLight || !light.castShadow) return;
    for (const cascade of light.shadow?.shadowNode?._shadowNodes ?? []) {
      if (cascade.shadowMap && cascade.shadow && cascade.getShadowMaterial) cascades.push(cascade as ShadowCascade);
    }
  });
  return cascades;
}

const isDrawable = (object: Object3D) => {
  const drawable = object as { isMesh?: boolean; isPoints?: boolean; isLine?: boolean; isSprite?: boolean };
  return Boolean(drawable.isMesh || drawable.isPoints || drawable.isLine || drawable.isSprite);
};

/**
 * Compiles the shadow pipelines of `root` as each cascade draws it: into the cascade's map, without MRT, with the light's
 * shadow material overriding the object's. Drawables that cast no shadow sit the call out.
 */
function compileShadowsAsync(renderer: AsyncCompiler & TargetedRenderer, root: Object3D, scene: Scene): Promise<unknown>[] {
  const cascades = shadowCascades(scene);
  if (cascades.length === 0) return [];
  const idle: Object3D[] = [];
  root.traverse((object) => {
    if (!isDrawable(object) || object.castShadow || !object.visible) return;
    object.visible = false;
    idle.push(object);
  });
  const override = scene.overrideMaterial;
  try {
    return cascades.map((cascade) => {
      scene.overrideMaterial = cascade.getShadowMaterial();
      drawAtAnyDepth(renderer, cascade.shadowMap);
      return withTarget(renderer, cascade.shadowMap, null, () => renderer.compileAsync(root, cascade.shadow.camera, scene));
    });
  } finally {
    scene.overrideMaterial = override;
    for (const object of idle) object.visible = true;
  }
}

/** Gate roots hidden until their content compiles: the lights under them still light what compiles meanwhile. */
const hiddenGates = new Set<Object3D>();

/** Hides `root` until the returned function shows it again. */
export function hideUntilCompiled(root: Object3D): () => void {
  root.visible = false;
  hiddenGates.add(root);
  return () => {
    hiddenGates.delete(root);
    root.visible = true;
  };
}

/** Runs `read` with every hidden gate shown: three collects the scene's lights and cascades from what is visible. */
function withGatesShown<T>(read: () => T): T {
  const shown = [...hiddenGates].filter((gate) => !gate.visible);
  for (const gate of shown) gate.visible = true;
  try {
    return read();
  } finally {
    for (const gate of shown) gate.visible = false;
  }
}

/**
 * Starts an async compile of `root` with `scene`'s lights while it is visible and unculled for that one call: for the
 * target the scene is drawn into and for the shadow cascades.
 */
export function compileSubtreeAsync(renderer: AsyncCompiler, root: Object3D, camera: Camera, scene: Scene): Promise<unknown> {
  if (!compilesAhead(renderer)) return Promise.resolve();
  const culled: Object3D[] = [];
  root.traverse((object) => {
    if (!object.frustumCulled) return;
    object.frustumCulled = false;
    culled.push(object);
  });
  const visible = root.visible;
  root.visible = true;
  try {
    return withGatesShown(() => {
      const target = sceneTargets.get(renderer);
      const switchable = canSwitchTargets(renderer) ? renderer : null;
      if (target && switchable) {
        drawAtAnyDepth(renderer, target.renderTarget);
        if (target.mrt) registerPass(switchable, target);
      }
      const main = target && switchable
        ? withTarget(switchable, target.renderTarget, target.mrt, () => renderer.compileAsync(root, camera, scene))
        : renderer.compileAsync(root, camera, scene);
      const shadows = switchable ? compileShadowsAsync(switchable, root, scene) : [];
      return shadows.length > 0 ? Promise.all([main, ...shadows]) : main;
    });
  } finally {
    root.visible = visible;
    for (const object of culled) object.frustumCulled = true;
  }
}

/** What three builds a drawable's shaders from, near enough: drawables alike share them, so one compiles for all. */
function shaderKey(object: Object3D): string {
  const { material, geometry } = object as Object3D & { material?: Material | Material[]; geometry?: BufferGeometry };
  const materials = Array.isArray(material) ? material : [material];
  const attributes = geometry ? `${Object.keys(geometry.attributes).sort().join()}/${Object.keys(geometry.morphAttributes).join()}` : '';
  return `${object.type}|${materials.map((entry) => entry?.uuid).join()}|${attributes}|${object.castShadow}|${object.receiveShadow}`;
}

/** Milliseconds of compiling a task takes on before the next compile waits for a later task. */
const COMPILE_SLICE_MS = 12;
const jobs: (() => void)[] = [];
let draining = false;

function drain(): void {
  const began = performance.now();
  while (jobs.length > 0 && performance.now() - began < COMPILE_SLICE_MS) jobs.shift()!();
  if (jobs.length > 0) setTimeout(drain, 0);
  else draining = false;
}

/** Runs `compile` on a later task, sharing each task with other compiles up to `COMPILE_SLICE_MS`. */
function queueCompile(compile: () => Promise<unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    jobs.push(() => {
      try {
        compile().then(resolve, reject);
      } catch (error) {
        reject(error);
      }
    });
    if (draining) return;
    draining = true;
    setTimeout(drain, 0);
  });
}

/** Scans of a subtree at most: content that mounts while it compiles, or cascades its first lit material creates. */
const COMPILE_ROUNDS = 4;

/**
 * Compiles `root` one drawable at a time on later tasks, a slice of `COMPILE_SLICE_MS` each: three builds a new
 * material's shaders on the main thread, so a world compiled, or first drawn, at once is one long task. Drawables alike
 * (material, geometry layout, kind, shadows) compile once. Once they are done `root` is scanned again, for content that
 * mounted meanwhile and for shadow cascades the first lit materials created, until a scan finds nothing new. Stops early
 * once `alive` turns false.
 */
export async function compileInSlices(
  renderer: AsyncCompiler,
  root: Object3D,
  camera: Camera,
  scene: Scene,
  alive: () => boolean = () => true,
): Promise<void> {
  if (!compilesAhead(renderer)) return;
  const compiled = new Set<string>();
  for (let round = 0; round < COMPILE_ROUNDS && alive(); round++) {
    const cascades = withGatesShown(() => shadowCascades(scene).length);
    const drawables: Object3D[] = [];
    const visit = (object: Object3D) => {
      if (isDrawable(object)) drawables.push(object);
      for (const child of object.children) if (child.visible) visit(child);
    };
    visit(root);
    let fresh = 0;
    // Keys are read as each compile runs: a material swapped in after mounting compiles as it will draw.
    await Promise.all(drawables.map((drawable) => queueCompile(() => {
      const key = `${shaderKey(drawable)}|${cascades}`;
      if (!alive() || compiled.has(key)) return Promise.resolve();
      compiled.add(key);
      fresh++;
      return compileSubtreeAsync(renderer, drawable, camera, scene);
    })));
    if (fresh === 0) return;
  }
}

/**
 * Compiles the whole scene for where it is drawn and its shadows, a drawable at a time so their pipelines build side
 * by side; null when it cannot compile ahead.
 */
export function compileSceneAsync(renderer: unknown, scene: Scene, camera: Camera): Promise<unknown> | null {
  return canCompileAsync(renderer) && compilesAhead(renderer) ? compileInSlices(renderer, scene, camera, scene) : null;
}

let compiling = 0;
const compileListeners = new Set<() => void>();

export function countCompile(delta: number): void {
  compiling += delta;
  for (const listener of compileListeners) listener();
}

/** Gates still compiling their content ahead of its first draw, on every canvas; load progress waits for them. */
export function pendingCompiles(): number {
  return compiling;
}

export function subscribeCompiles(listener: () => void): () => void {
  compileListeners.add(listener);
  return () => {
    compileListeners.delete(listener);
  };
}
