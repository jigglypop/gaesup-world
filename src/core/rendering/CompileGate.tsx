import { useLayoutEffect, useRef, type ReactNode } from 'react';

import { useThree } from '@react-three/fiber';
import type { Camera, Group, Material, Object3D, Scene } from 'three';

import { isGpuBatchRevision } from './gpuBatchRevision';

type AsyncCompiler = { compileAsync: (scene: Object3D, camera: Camera, targetScene?: Scene | null) => Promise<unknown> };
type TargetedRenderer = {
  getRenderTarget(): unknown;
  setRenderTarget(target: unknown): void;
  getMRT(): unknown;
  setMRT(mrt: unknown): void;
};
/**
 * Where a pass draws the scene (postprocessing): its render target and MRT outputs, and how deep in nested renders it
 * draws (a pass inside the output render draws at depth 1). Together they select the pipelines the scene is drawn with.
 */
export type SceneRenderTarget = { renderTarget: unknown; mrt: unknown; depth: number };

const sceneTargets = new WeakMap<object, SceneRenderTarget>();

/** Registers the target a renderer draws the scene into, or clears it, so gates compile for that target. */
export function setSceneRenderTarget(renderer: TargetedRenderer, target: SceneRenderTarget | null): void {
  if (target) sceneTargets.set(renderer, target);
  else sceneTargets.delete(renderer);
}

function canCompileAsync(renderer: unknown): renderer is AsyncCompiler {
  // Verified against the revisions whose compileAsync collects render objects synchronously before its first await.
  return isGpuBatchRevision() && typeof (renderer as Partial<AsyncCompiler> | null)?.compileAsync === 'function';
}

/**
 * Whether content can compile ahead for where the scene is drawn. three builds the shaders on later tasks, reading the
 * render target and MRT from the renderer, which by then shows the canvas: a pass with extra outputs would get, and keep,
 * shaders without them, so its content compiles as it first draws.
 */
const compilesAhead = (renderer: object) => !sceneTargets.get(renderer)?.mrt;

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

/**
 * Runs `compile` with render contexts looked up at `depth`. three keys a context by how deep in nested renders it draws
 * and compileAsync always asks for depth 0, so a pass or shadow map drawn inside another render would get pipelines
 * built for a context it never uses.
 */
function atDepth<T>(renderer: object, depth: number, compile: () => T): T {
  const contexts = (renderer as { _renderContexts?: RenderContexts })._renderContexts;
  if (!contexts || depth === 0) return compile();
  const get = contexts.get;
  contexts.get = function (this: RenderContexts, target?: unknown, mrt?: unknown) {
    return get.call(this, target, mrt, depth);
  };
  try {
    return compile();
  } finally {
    contexts.get = get;
  }
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
 * Compiles the shadow pipelines of `root` as each cascade draws it: into the cascade's map at `depth`, without MRT, with
 * the light's shadow material overriding the object's. Drawables that cast no shadow sit the call out.
 */
function compileShadowsAsync(renderer: AsyncCompiler & TargetedRenderer, root: Object3D, scene: Scene, depth: number): Promise<unknown>[] {
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
      return withTarget(renderer, cascade.shadowMap, null, () => atDepth(renderer, depth, () => renderer.compileAsync(root, cascade.shadow.camera, scene)));
    });
  } finally {
    scene.overrideMaterial = override;
    for (const object of idle) object.visible = true;
  }
}

/**
 * Starts an async compile of `root` with `scene`'s lights while it is visible and unculled for that one call: for the
 * target the scene is drawn into and for the shadow cascades, which draw it one render deeper.
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
    const target = sceneTargets.get(renderer);
    const depth = target?.depth ?? 0;
    const switchable = canSwitchTargets(renderer) ? renderer : null;
    const main = target && switchable
      ? withTarget(switchable, target.renderTarget, target.mrt, () => atDepth(renderer, depth, () => renderer.compileAsync(root, camera, scene)))
      : renderer.compileAsync(root, camera, scene);
    const shadows = switchable ? compileShadowsAsync(switchable, root, scene, depth + 1) : [];
    return shadows.length > 0 ? Promise.all([main, ...shadows]) : main;
  } finally {
    root.visible = visible;
    for (const object of culled) object.frustumCulled = true;
  }
}

/** Compiles the whole scene for where it is drawn and its shadows; null when it cannot compile ahead. */
export function compileSceneAsync(renderer: unknown, scene: Scene, camera: Camera): Promise<unknown> | null {
  return canCompileAsync(renderer) && compilesAhead(renderer) ? compileSubtreeAsync(renderer, scene, camera, scene) : null;
}

let compiling = 0;
const compileListeners = new Set<() => void>();

function countCompile(delta: number): void {
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

/**
 * Keeps first-time content hidden until its pipelines are built asynchronously, instead of stalling the frame that
 * first draws it on synchronous shader and pipeline creation. Place it inside the Suspense boundary of the content,
 * so the gate commits together with what it compiles.
 */
export function CompileGate({ children }: { children: ReactNode }) {
  const gl = useThree((state) => state.gl);
  const scene = useThree((state) => state.scene);
  const camera = useThree((state) => state.camera);
  const group = useRef<Group>(null);
  useLayoutEffect(() => {
    const root = group.current;
    if (!root || !canCompileAsync(gl)) return undefined;
    let active = true;
    root.visible = false;
    // Postprocessing loads after the first content mounts; content still hidden when its scene target appears is
    // compiled again for that target, since the first compile built pipelines for a target the scene never uses.
    const compile = (): Promise<unknown> => {
      const target = sceneTargets.get(gl);
      return compileSubtreeAsync(gl, root, camera, scene)
        .then(() => (active && sceneTargets.get(gl) !== target ? compile() : undefined));
    };
    let counted = true;
    const settle = () => {
      if (!counted) return;
      counted = false;
      countCompile(-1);
    };
    countCompile(1);
    compile()
      .catch(() => undefined)
      .finally(() => {
        if (active) root.visible = true;
        settle();
      });
    return () => {
      active = false;
      root.visible = true;
      settle();
    };
    // Compiles once per mount (camera swaps do not re-hide content); later edits reuse these pipelines.
  }, [gl, scene]);
  return <group ref={group}>{children}</group>;
}
