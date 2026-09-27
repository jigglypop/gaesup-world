import { useLayoutEffect, useMemo, type RefObject } from 'react';

import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { placeNameplates, type NameplateCandidate } from './layout';
import { useEngineFrame } from '../../../runtime/frame';

export { placeNameplates, type NameplateCandidate } from './layout';

type Plate = { object: THREE.Object3D; name: string; height: number };
type Shown = NameplateCandidate & { element: HTMLDivElement };

/** Every named object; each `Nameplates` shows the ones in its own scene. */
const plates = new Set<Plate>();

const sceneOf = (object: THREE.Object3D) => {
  let root = object;
  while (root.parent) root = root.parent;
  return root;
};

/** Labels the object at `ref`, whose origin is its feet, with `name` this many meters above them. */
export function useNameplate(ref: RefObject<THREE.Object3D | null>, name: string | undefined, height = 2): void {
  useLayoutEffect(() => {
    const object = ref.current;
    if (!object || !name) return undefined;
    const plate: Plate = { object, name, height };
    plates.add(plate);
    return () => {
      plates.delete(plate);
    };
  }, [height, name, ref]);
}

const LAYER_STYLE: Partial<CSSStyleDeclaration> = { position: 'absolute', inset: '0', pointerEvents: 'none', overflow: 'hidden', zIndex: '1' };
const LABEL_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'absolute', left: '0', top: '0', padding: '3px 9px', borderRadius: '999px', whiteSpace: 'nowrap', willChange: 'transform',
  font: "600 12px var(--gaesup-ui-font, 'Pretendard', system-ui, sans-serif)",
  color: 'var(--gaesup-ui-text, #f3f4f8)',
  background: 'var(--gaesup-ui-surface, rgba(18,20,28,0.62))',
  border: '1px solid var(--gaesup-ui-border, rgba(255,255,255,0.12))',
  boxShadow: '0 4px 14px rgba(0,0,0,0.16)',
  backdropFilter: 'var(--gaesup-ui-blur, blur(12px))',
};

export type NameplatesProps = {
  /** Labels shown at most, nearest first; `maxOnTouch` on touch screens, where they crowd sooner. */
  max?: number;
  maxOnTouch?: number;
  /** Meters from the camera past which no label shows; they fade over the last quarter. */
  range?: number;
};

/**
 * Screen-space name labels over the characters that `useNameplate` registers (residents register their names). One
 * DOM layer beside the canvas holds a label per character and only moves them, so a crowd costs no React renders. The
 * nearest show first; one that would cover a nearer label waits until it is clear.
 */
export function Nameplates({ max = 6, maxOnTouch = 3, range = 28 }: NameplatesProps) {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const scene = useThree((state) => state.scene);
  const state = useMemo(() => ({
    layer: typeof document === 'undefined' ? null : document.createElement('div'),
    labels: new Map<Plate, { element: HTMLDivElement; width: number; height: number }>(),
    shown: new Set<HTMLDivElement>(),
    point: new THREE.Vector3(),
    touch: typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches,
  }), []);

  useLayoutEffect(() => {
    const host = gl.domElement.parentElement;
    const { layer, labels, shown } = state;
    if (!layer || !host) return undefined;
    Object.assign(layer.style, LAYER_STYLE);
    host.appendChild(layer);
    return () => {
      layer.remove();
      layer.replaceChildren();
      labels.clear();
      shown.clear();
    };
  }, [gl, state]);

  useEngineFrame('effects', () => {
    const { layer, labels, shown, point } = state;
    if (!layer) return;
    const width = gl.domElement.clientWidth;
    const height = gl.domElement.clientHeight;
    const candidates: Shown[] = [];
    for (const plate of plates) {
      if (!plate.object.visible || sceneOf(plate.object) !== scene) continue;
      plate.object.getWorldPosition(point);
      point.y += plate.height;
      const distance = point.distanceTo(camera.position);
      if (distance > range) continue;
      point.project(camera);
      if (point.z > 1 || Math.abs(point.x) > 1.05 || Math.abs(point.y) > 1.05) continue;
      let label = labels.get(plate);
      if (!label) {
        const element = document.createElement('div');
        Object.assign(element.style, LABEL_STYLE);
        element.textContent = plate.name;
        layer.appendChild(element);
        label = { element, width: element.offsetWidth || plate.name.length * 8 + 18, height: element.offsetHeight || 22 };
        labels.set(plate, label);
      }
      candidates.push({ x: ((point.x + 1) / 2) * width, y: ((1 - point.y) / 2) * height - label.height / 2, width: label.width, height: label.height, distance, element: label.element });
    }
    const next = new Set<HTMLDivElement>();
    for (const plate of placeNameplates(candidates, state.touch ? maxOnTouch : max)) {
      const { element } = plate;
      next.add(element);
      element.style.transform = `translate(${Math.round(plate.x - plate.width / 2)}px, ${Math.round(plate.y - plate.height / 2)}px)`;
      element.style.opacity = String(Math.min(1, (range - plate.distance) / (range * 0.25)));
      element.style.display = '';
    }
    for (const element of shown) if (!next.has(element)) element.style.display = 'none';
    state.shown = next;
    // Labels of characters that left go with them.
    for (const [plate, label] of labels) {
      if (plates.has(plate)) continue;
      label.element.remove();
      labels.delete(plate);
    }
  }, { label: 'ui:nameplates' });

  return null;
}
