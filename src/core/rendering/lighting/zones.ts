import * as THREE from 'three';

/**
 * How a lighting zone changes the scene's lights while the player stands in it, as multipliers on their levels when no
 * zone applies: indoors most daylight stays outside and the sky fill takes the room's tint.
 */
export type LightingProfile = {
  /** Directional lights (the sun). */
  sun?: number;
  /** Hemisphere and ambient lights, whose colors move toward `sky` and `ground`. */
  fill?: number;
  sky?: THREE.ColorRepresentation;
  ground?: THREE.ColorRepresentation;
  /** The scene environment's intensity: sky reflections on every PBR material. */
  environment?: number;
};

export type LightingZoneState = { blend: number; profile: LightingProfile };

type Base = { light: THREE.Light; intensity: number; color: THREE.Color; ground: THREE.Color | null };
type Lit = THREE.Light & { isDirectionalLight?: boolean; isHemisphereLight?: boolean; isAmbientLight?: boolean; groundColor?: THREE.Color };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * A scene's lighting zones. The zone blended in furthest sets the lights; the levels it scales are read when the first
 * zone starts to blend in and put back when the last one has blended out.
 */
export class SceneLighting {
  readonly zones = new Map<object, LightingZoneState>();
  private bases: Base[] | null = null;
  private environment = 1;
  private readonly sky = new THREE.Color();
  private readonly ground = new THREE.Color();

  constructor(private readonly scene: THREE.Scene) {}

  /** How far indoors the player is: the strongest zone's blend, 0 outside every zone. */
  blend(): number {
    let blend = 0;
    for (const zone of this.zones.values()) blend = Math.max(blend, zone.blend);
    return blend;
  }

  apply(): void {
    let strongest: LightingZoneState | undefined;
    for (const zone of this.zones.values()) if (!strongest || zone.blend > strongest.blend) strongest = zone;
    if (!strongest || strongest.blend <= 0) {
      this.restore();
      return;
    }
    const bases = this.bases ?? this.capture();
    const { blend, profile } = strongest;
    for (const { light, intensity, color, ground } of bases) {
      const lit = light as Lit;
      if (lit.isDirectionalLight) {
        lit.intensity = intensity * mix(1, profile.sun ?? 1, blend);
        continue;
      }
      lit.intensity = intensity * mix(1, profile.fill ?? 1, blend);
      lit.color.copy(color);
      if (profile.sky !== undefined) lit.color.lerp(this.sky.set(profile.sky), blend);
      if (lit.groundColor && ground) {
        lit.groundColor.copy(ground);
        if (profile.ground !== undefined) lit.groundColor.lerp(this.ground.set(profile.ground), blend);
      }
    }
    this.scene.environmentIntensity = this.environment * mix(1, profile.environment ?? 1, blend);
  }

  private restore(): void {
    if (!this.bases) return;
    for (const { light, intensity, color, ground } of this.bases) {
      light.intensity = intensity;
      light.color.copy(color);
      if (ground) (light as Lit).groundColor?.copy(ground);
    }
    this.scene.environmentIntensity = this.environment;
    this.bases = null;
  }

  private capture(): Base[] {
    const bases: Base[] = [];
    this.scene.traverse((object) => {
      const light = object as Lit;
      if (!(light.isDirectionalLight || light.isHemisphereLight || light.isAmbientLight)) return;
      bases.push({ light, intensity: light.intensity, color: light.color.clone(), ground: light.groundColor?.clone() ?? null });
    });
    this.environment = this.scene.environmentIntensity;
    this.bases = bases;
    return bases;
  }
}

const lightings = new WeakMap<THREE.Scene, SceneLighting>();

export function sceneLighting(scene: THREE.Scene): SceneLighting {
  let lighting = lightings.get(scene);
  if (!lighting) {
    lighting = new SceneLighting(scene);
    lightings.set(scene, lighting);
  }
  return lighting;
}
