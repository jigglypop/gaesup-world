import { createContext, useRef, useState, useSyncExternalStore } from 'react';

import * as THREE from 'three';

import { useSharedFrame, type SharedFrameChannel } from '../../../../runtime/frame';

/** Point lights shared by every lamp; the nearest lamps to the camera borrow them. */
export const LAMP_LIGHT_POOL_SIZE = 4;
const LAMP_POOL_FRAME: SharedFrameChannel = { phase: 'effects', label: 'building:lamp-pool' };
const REASSIGN_SECONDS = 0.2;

export type LampSource = { object: THREE.Object3D; color: THREE.Color; intensity: number; distance: number };

/**
 * Lamps registered with a world. Lit materials compile per light count, so a light per lamp recompiled every lit
 * pipeline whenever a lamp was placed, removed or streamed in; a fixed pool changes the light set at most once.
 */
export class LampRegistry {
  readonly lamps = new Set<LampSource>();
  private listeners = new Set<() => void>();

  add(lamp: LampSource): () => void {
    this.lamps.add(lamp);
    this.notify();
    return () => {
      if (this.lamps.delete(lamp)) this.notify();
    };
  }

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  hasLamps = (): boolean => this.lamps.size > 0;

  private notify(): void {
    for (const listener of this.listeners) listener();
  }
}

export const LampRegistryContext = createContext<LampRegistry | null>(null);

const lampPosition = new THREE.Vector3();

/** Nearest lamps first, written into `out` (length = pool size) without allocating. */
function pickNearest(lamps: ReadonlySet<LampSource>, camera: THREE.Vector3, out: (LampSource | null)[], distances: number[]): void {
  out.fill(null);
  distances.fill(Number.POSITIVE_INFINITY);
  for (const lamp of lamps) {
    const distance = lamp.object.getWorldPosition(lampPosition).distanceToSquared(camera);
    let slot = out.length;
    while (slot > 0 && distance < distances[slot - 1]!) slot--;
    if (slot === out.length) continue;
    for (let i = out.length - 1; i > slot; i--) {
      out[i] = out[i - 1]!;
      distances[i] = distances[i - 1]!;
    }
    out[slot] = lamp;
    distances[slot] = distance;
  }
}

/** Mounts the pool once the first lamp appears and keeps it, so later lamps never change the light set. */
export function LampLightPool({ registry }: { registry: LampRegistry }) {
  const hasLamps = useSyncExternalStore(registry.subscribe, registry.hasLamps, registry.hasLamps);
  const [active, setActive] = useState(false);
  if (hasLamps && !active) setActive(true);
  return active ? <ActiveLampLights registry={registry} /> : null;
}

function ActiveLampLights({ registry }: { registry: LampRegistry }) {
  const lights = useRef<(THREE.PointLight | null)[]>([]);
  const [nearest] = useState(() => new Array<LampSource | null>(LAMP_LIGHT_POOL_SIZE).fill(null));
  const [distances] = useState(() => new Array<number>(LAMP_LIGHT_POOL_SIZE).fill(0));
  const sinceAssign = useRef(Number.POSITIVE_INFINITY);
  useSharedFrame(LAMP_POOL_FRAME, (delta, _, three) => {
    sinceAssign.current += delta;
    if (sinceAssign.current < REASSIGN_SECONDS) return;
    sinceAssign.current = 0;
    pickNearest(registry.lamps, three.camera.position, nearest, distances);
    for (let i = 0; i < LAMP_LIGHT_POOL_SIZE; i++) {
      const light = lights.current[i];
      if (!light) continue;
      const lamp = nearest[i];
      if (!lamp) {
        light.intensity = 0;
        continue;
      }
      lamp.object.getWorldPosition(light.position);
      light.color.copy(lamp.color);
      light.intensity = lamp.intensity;
      light.distance = lamp.distance;
    }
  });
  return (
    <>
      {Array.from({ length: LAMP_LIGHT_POOL_SIZE }, (_, index) => (
        <pointLight key={index} ref={(light) => { lights.current[index] = light; }} intensity={0} />
      ))}
    </>
  );
}
