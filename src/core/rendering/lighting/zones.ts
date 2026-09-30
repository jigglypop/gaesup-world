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

/**
 * What the weather does to the scene's light on top of any zone: multipliers on the sun, the sky fill and the
 * environment, a tint toward `tint`, and a `scene.background` color moved toward `sky`. Lights with
 * `userData.weather === false` (a rig that applies the weather itself) keep their levels.
 */
export type WeatherLight = {
  sun: number;
  fill: number;
  environment: number;
  tint: THREE.Color;
  tintAmount: number;
  sky: THREE.Color;
  skyAmount: number;
};

type Base = {
  light: THREE.Light;
  intensity: number;
  color: THREE.Color;
  ground: THREE.Color | null;
  applied: number;
  appliedColor: THREE.Color;
};
type Lit = THREE.Light & { isDirectionalLight?: boolean; isHemisphereLight?: boolean; isAmbientLight?: boolean; groundColor?: THREE.Color };

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const NO_ZONE: LightingZoneState = { blend: 0, profile: {} };
const isSceneLight = (light: Lit) => !!(light.isDirectionalLight || light.isHemisphereLight || light.isAmbientLight);

/**
 * A scene's lighting zones and weather. The zone blended in furthest and the weather set the lights; the levels they
 * scale are read when the first of them applies and put back when none does. A level written by someone else in
 * between (a prop change) becomes the new base.
 */
export class SceneLighting {
  readonly zones = new Map<object, LightingZoneState>();
  private weather: WeatherLight | null = null;
  private bases: Base[] | null = null;
  private environment = 1;
  private appliedEnvironment = 1;
  private background: THREE.Color | null = null;
  private readonly appliedBackground = new THREE.Color();
  private readonly sky = new THREE.Color();
  private readonly ground = new THREE.Color();

  constructor(private readonly scene: THREE.Scene) {}

  /** How far indoors the player is: the strongest zone's blend, 0 outside every zone. */
  blend(): number {
    let blend = 0;
    for (const zone of this.zones.values()) blend = Math.max(blend, zone.blend);
    return blend;
  }

  /** Sets or clears the weather layer; call `apply` after. */
  setWeather(weather: WeatherLight | null): void {
    this.weather = weather;
  }

  apply(): void {
    let strongest: LightingZoneState | undefined;
    for (const zone of this.zones.values()) if (zone.blend > 0 && (!strongest || zone.blend > strongest.blend)) strongest = zone;
    const weather = this.weather;
    if (!strongest && !weather) {
      this.restore();
      return;
    }
    const bases = this.bases ?? this.capture();
    const { blend, profile } = strongest ?? NO_ZONE;
    for (const base of bases) {
      const lit = base.light as Lit;
      this.adopt(base);
      const weathered = weather && lit.userData['weather'] !== false ? weather : null;
      lit.color.copy(base.color);
      if (lit.isDirectionalLight) {
        lit.intensity = base.intensity * mix(1, profile.sun ?? 1, blend) * (weathered?.sun ?? 1);
        if (weathered) lit.color.lerp(weathered.tint, weathered.tintAmount * 0.5);
      } else {
        lit.intensity = base.intensity * mix(1, profile.fill ?? 1, blend) * (weathered?.fill ?? 1);
        if (profile.sky !== undefined) lit.color.lerp(this.sky.set(profile.sky), blend);
        if (weathered) lit.color.lerp(weathered.tint, weathered.tintAmount);
        if (lit.groundColor && base.ground) {
          lit.groundColor.copy(base.ground);
          if (profile.ground !== undefined) lit.groundColor.lerp(this.ground.set(profile.ground), blend);
        }
      }
      base.applied = lit.intensity;
      base.appliedColor.copy(lit.color);
    }
    if (this.scene.environmentIntensity !== this.appliedEnvironment) this.environment = this.scene.environmentIntensity;
    this.scene.environmentIntensity = this.environment * mix(1, profile.environment ?? 1, blend) * (weather?.environment ?? 1);
    this.appliedEnvironment = this.scene.environmentIntensity;
    this.applyBackground(weather);
  }

  /** Picks up lights added since the levels were read and forgets removed ones. */
  refresh(): void {
    if (!this.bases) return;
    const known = new Map(this.bases.map((base) => [base.light, base]));
    const next: Base[] = [];
    this.scene.traverse((object) => {
      const light = object as Lit;
      if (isSceneLight(light)) next.push(known.get(light) ?? this.baseOf(light));
    });
    this.bases = next;
  }

  private adopt(base: Base): void {
    if (base.light.intensity !== base.applied) base.intensity = base.light.intensity;
    if (!base.light.color.equals(base.appliedColor)) base.color.copy(base.light.color);
  }

  private applyBackground(weather: WeatherLight | null): void {
    const background = this.scene.background as THREE.Color | null;
    if (!background?.isColor) return;
    if (!weather) {
      if (this.background && background.equals(this.appliedBackground)) background.copy(this.background);
      this.background = null;
      return;
    }
    if (!this.background) this.background = background.clone();
    else if (!background.equals(this.appliedBackground)) this.background.copy(background);
    background.copy(this.background).lerp(weather.sky, weather.skyAmount);
    this.appliedBackground.copy(background);
  }

  private restore(): void {
    if (!this.bases) return;
    for (const base of this.bases) {
      const light = base.light as Lit;
      // A level someone else wrote since stays.
      if (light.intensity === base.applied) light.intensity = base.intensity;
      if (light.color.equals(base.appliedColor)) light.color.copy(base.color);
      if (base.ground) light.groundColor?.copy(base.ground);
    }
    if (this.scene.environmentIntensity === this.appliedEnvironment) this.scene.environmentIntensity = this.environment;
    this.applyBackground(null);
    this.bases = null;
  }

  private baseOf(light: Lit): Base {
    return {
      light, intensity: light.intensity, color: light.color.clone(), ground: light.groundColor?.clone() ?? null,
      applied: light.intensity, appliedColor: light.color.clone(),
    };
  }

  private capture(): Base[] {
    const bases: Base[] = [];
    this.scene.traverse((object) => {
      const light = object as Lit;
      if (isSceneLight(light)) bases.push(this.baseOf(light));
    });
    this.environment = this.appliedEnvironment = this.scene.environmentIntensity;
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
