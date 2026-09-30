import * as THREE from 'three';

import { CAMERA_DEFAULTS } from './constants';
import { partAt, SeeThrough, type Fade, type FadeKind } from './seeThrough';
import { sweepSphereBounds, sweepSphereMesh, type SweepContact } from '../utils/sphereSweep';

/** Faces pointing this far up (within about 37° of vertical) are floors and gentle slopes: they push, never fade. */
const GROUND_NORMAL_Y = 0.8;
/** Seconds a fade takes, in and out. */
const FADE_SECONDS = 0.2;
/** Seconds an occluder stays faded after the path last touched it, so a grazing path does not make it flicker. */
const HOLD_SECONDS = 0.15;
/** Restored fades kept for reuse; their copies also keep the faded shader variants compiled for the next fade. */
const IDLE_LIMIT = 32;

const contactPoint = new THREE.Vector3();

function attached(object: THREE.Object3D, scene: THREE.Scene): boolean {
  for (let current: THREE.Object3D | null = object; current; current = current.parent) if (current === scene) return true;
  return false;
}

function smooth(amount: number): number {
  return amount * amount * (3 - 2 * amount);
}

function indexOf(fades: readonly Fade[], mesh: THREE.Mesh, part: number): number {
  for (let i = 0; i < fades.length; i++) if (fades[i]!.mesh === mesh && fades[i]!.part === part) return i;
  return -1;
}

/**
 * Fades what hides the camera's subject (`collisionMode: 'fade'`). One per scene, since materials and batches are shared
 * scene state. A sweep collects contacts (`begin`, `collect`, `finish`); `update` animates each fade and restores what
 * stopped occluding. How an occluder turns see-through is `SeeThrough`'s part.
 */
export class CameraOcclusion {
  /** Distance to the nearest contact of the current sweep that pushes the camera instead of fading. */
  solid = Infinity;
  private readonly scene: THREE.Scene;
  private readonly looks = new SeeThrough();
  private readonly active: Fade[] = [];
  private readonly idle: Fade[] = [];
  private readonly hitMeshes: THREE.Mesh[] = [];
  private readonly hitParts: number[] = [];
  private readonly hitDistances: number[] = [];
  private hits = 0;
  private ray = new THREE.Ray();
  private radius = 0;
  private limit = 0;
  private mesh: THREE.Mesh | null = null;
  private kind: FadeKind = 'whole';
  private explicit = false;
  private fadeMode = false;
  private flush = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  /** Starts collecting the contacts of a sweep along `ray` up to `limit`. */
  begin(ray: THREE.Ray, radius: number, limit: number): this {
    this.ray = ray;
    this.radius = radius;
    this.limit = limit;
    this.hits = 0;
    this.solid = Infinity;
    return this;
  }

  /**
   * Collects the mesh's contacts: fades, or pushes for ground-like faces unless `explicit` (the mesh asked to fade).
   * False when the mesh cannot fade and must push (see `SeeThrough.kindOf`).
   */
  collect(mesh: THREE.Mesh, explicit: boolean): boolean {
    const kind = this.looks.kindOf(mesh);
    if (!kind) return false;
    this.mesh = mesh;
    this.kind = kind;
    this.explicit = explicit;
    if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
      const distance = sweepSphereBounds(mesh, this.ray, this.radius, this.limit, contactPoint);
      if (distance <= this.limit) this.addHit(mesh, -1, distance);
    } else sweepSphereMesh(mesh, this.ray, this.radius, this.limit, contactPoint, this.onContact);
    if (kind === 'instance') this.collectProxies(mesh);
    this.mesh = null;
    return true;
  }

  /** Fades what the sweep touched nearer than `distance`, where the camera ends up after pushing. */
  finish(distance: number): void {
    for (let i = 0; i < this.hits; i++) {
      if (this.hitDistances[i]! < distance) this.touch(this.hitMeshes[i]!, this.hitParts[i]!);
    }
    this.hits = 0;
  }

  /**
   * Moves every fade toward `opacity` while it occludes and back after, and restores what stopped occluding. Once the
   * camera leaves fade mode (`fadeMode` false) and everything faded back, the kept copies are freed.
   */
  update(deltaTime: number, opacity: number = CAMERA_DEFAULTS.COLLISION_FADE_OPACITY, fadeMode = true): void {
    if (this.fadeMode && !fadeMode) this.flush = true;
    this.fadeMode = fadeMode;
    const target = Number.isFinite(opacity) ? THREE.MathUtils.clamp(opacity, 0, 1) : CAMERA_DEFAULTS.COLLISION_FADE_OPACITY;
    const step = Math.max(0, deltaTime) / FADE_SECONDS;
    for (let i = this.active.length - 1; i >= 0; i--) {
      const fade = this.active[i]!;
      const occluding = fade.hold > 0;
      fade.hold -= deltaTime;
      fade.amount = THREE.MathUtils.clamp(fade.amount + (occluding ? step : -step), 0, 1);
      const owned = attached(fade.mesh, this.scene) && this.looks.owns(fade);
      if (owned && (occluding || fade.amount > 0)) {
        const alpha = 1 - smooth(fade.amount) * (1 - target);
        for (let k = 0; k < fade.copies.length; k++) fade.copies[k]!.opacity = fade.opacities[k]! * alpha;
        continue;
      }
      this.active[i] = this.active[this.active.length - 1]!;
      this.active.pop();
      if (owned) this.park(fade);
      else this.looks.release(fade);
    }
    if (this.flush && this.active.length === 0) {
      this.flush = false;
      this.clearIdle();
    }
  }

  /** Restores every faded occluder at once and frees every copy and proxy. */
  dispose(): void {
    for (let i = 0; i < this.active.length; i++) this.looks.release(this.active[i]!);
    this.active.length = 0;
    this.clearIdle();
  }

  private readonly onContact: SweepContact = (instance, offset, distance, normal) => {
    const mesh = this.mesh!;
    const part = this.kind === 'instance' ? instance : this.kind === 'part' ? partAt(mesh.geometry, offset) : -1;
    if ((!this.explicit && normal.y > GROUND_NORMAL_Y) || (this.kind === 'part' && part < 0)) {
      if (distance < this.solid) this.solid = distance;
      return;
    }
    this.addHit(mesh, part, distance);
  };

  /**
   * The batch holds its faded instances at zero scale and their proxies are intangible, so the sweep tests the proxies
   * as the batch's own instances. A batch no longer collected (the camera went back to pushing) lets them fade back.
   */
  private collectProxies(batch: THREE.Mesh): void {
    for (let i = 0; i < this.active.length; i++) {
      const fade = this.active[i]!;
      const proxy = fade.proxy;
      if (fade.mesh !== batch || !proxy?.parent) continue;
      proxy.updateWorldMatrix(true, false);
      const distance = sweepSphereMesh(proxy, this.ray, this.radius, this.limit, contactPoint);
      if (distance <= this.limit) this.addHit(batch, fade.part, distance);
    }
  }

  private addHit(mesh: THREE.Mesh, part: number, distance: number): void {
    for (let i = 0; i < this.hits; i++) {
      if (this.hitMeshes[i] !== mesh || this.hitParts[i] !== part) continue;
      if (distance < this.hitDistances[i]!) this.hitDistances[i] = distance;
      return;
    }
    this.hitMeshes[this.hits] = mesh;
    this.hitParts[this.hits] = part;
    this.hitDistances[this.hits] = distance;
    this.hits++;
  }

  private touch(mesh: THREE.Mesh, part: number): void {
    const index = indexOf(this.active, mesh, part);
    let fade = index < 0 ? null : this.active[index]!;
    if (!fade) {
      fade = this.reuse(mesh, part) ?? this.looks.create(mesh, part);
      if (!fade) return;
      this.active.push(fade);
      this.looks.show(fade);
    }
    fade.hold = HOLD_SECONDS;
  }

  /** The kept fade of this mesh and part, brought up to date, unless the mesh draws with other materials by now. */
  private reuse(mesh: THREE.Mesh, part: number): Fade | null {
    const index = indexOf(this.idle, mesh, part);
    if (index < 0) return null;
    const fade = this.idle[index]!;
    this.idle.splice(index, 1);
    if (this.looks.refresh(fade)) return fade;
    this.looks.release(fade);
    return null;
  }

  private park(fade: Fade): void {
    this.looks.hide(fade);
    fade.amount = 0;
    fade.hold = 0;
    this.idle.push(fade);
    if (this.idle.length > IDLE_LIMIT) this.looks.release(this.idle.shift()!);
  }

  private clearIdle(): void {
    for (const fade of this.idle) this.looks.release(fade);
    this.idle.length = 0;
  }
}

const occlusions = new WeakMap<THREE.Scene, CameraOcclusion>();

export function getCameraOcclusion(scene: THREE.Scene): CameraOcclusion {
  let occlusion = occlusions.get(scene);
  if (!occlusion) {
    occlusion = new CameraOcclusion(scene);
    occlusions.set(scene, occlusion);
  }
  return occlusion;
}

/** The scene's occlusion fader if a fade has ever been collected there; never creates one. */
export function peekCameraOcclusion(scene: THREE.Scene): CameraOcclusion | undefined {
  return occlusions.get(scene);
}

/** Restores the scene's faded occluders and frees the fader. */
export function disposeCameraOcclusion(scene: THREE.Scene): void {
  occlusions.get(scene)?.dispose();
  occlusions.delete(scene);
}
