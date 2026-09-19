import {
  AmbientLight,
  BoxGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshStandardMaterial,
  OrthographicCamera,
  Plane,
  Raycaster,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebGPURenderer } from 'three/webgpu';

import type { SceneDocumentController, SceneObject } from 'gaesup-world';

import { furnitureKind } from './model';
import type { FurnitureKind, RoomTheme } from './types';

export type RoomView = {
  editing: boolean;
  selected: string | null;
  theme: RoomTheme;
  zoom: number;
};

export async function mountMiniroom(
  canvas: HTMLCanvasElement,
  controller: SceneDocumentController,
  onSelect: (id: string | null) => void,
  onReady: (backend: string) => void,
  signal: AbortSignal,
) {
  const renderer = new WebGPURenderer({ canvas, antialias: true });
  const initialBackend = renderer.backend;
  try {
    await renderer.init();
  } catch (error) {
    try {
      (initialBackend as unknown as { dispose(): void }).dispose();
    } catch {
      /* Preserve the initialization failure. */
    }
    if (renderer.backend !== initialBackend) {
      try {
        (renderer.backend as unknown as { dispose(): void }).dispose();
      } catch {
        /* Partial backend. */
      }
    }
    throw error;
  }
  if (signal.aborted) {
    renderer.dispose();
    return null;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  const scene = new Scene();
  scene.background = new Color('#f5efe8');
  const camera = new OrthographicCamera(-6.5, 6.5, 6.5, -6.5, 0.1, 100);
  camera.position.set(12, 11, 15);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 1, 0);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minZoom = 0.65;
  controls.maxZoom = 1.65;
  controls.minPolarAngle = 0.35;
  controls.maxPolarAngle = 1.35;
  controls.mouseButtons.LEFT = null;
  const sun = new DirectionalLight('#fff0d2', 3.4);
  sun.position.set(3, 9, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.03;
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  scene.add(sun, new AmbientLight('#fff0df', 2));
  const box = new BoxGeometry();
  const sphere = new SphereGeometry(1, 16, 12);
  const cylinder = new CylinderGeometry(1, 1, 1, 24);
  const cone = new ConeGeometry(1, 1, 24);
  const geometries = [box, sphere, cylinder, cone];
  const materials = new Map<string, MeshStandardMaterial>();
  function material(color: string) {
    let value = materials.get(color);
    if (!value) {
      value = new MeshStandardMaterial({ color, roughness: 0.82 });
      materials.set(color, value);
    }
    return value;
  }
  function part(
    parent: Group | Scene,
    color: string,
    scale: [number, number, number],
    position: [number, number, number],
    shape: 'box' | 'sphere' | 'cylinder' | 'cone' = 'box',
  ) {
    const mesh = new Mesh(
      shape === 'sphere' ? sphere : shape === 'cylinder' ? cylinder : shape === 'cone' ? cone : box,
      material(color),
    );
    mesh.scale.set(...scale);
    mesh.position.set(...position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const room = new Group();
  scene.add(room);
  part(room, '#d4ab85', [8.35, 0.32, 8.35], [0, -0.18, 0]);
  for (let i = 0; i < 16; i += 1) {
    part(room, i % 3 === 0 ? '#ead5b7' : '#e5cba8', [0.492, 0.04, 8], [-3.75 + i * 0.5, 0.01, 0]);
  }
  const back = part(room, '#ead3c6', [8.3, 3.5, 0.18], [0, 1.6, -4.08]);
  const left = part(room, '#ead3c6', [0.18, 3.5, 8.3], [-4.08, 1.6, 0]);
  part(room, '#ffefe0', [8.2, 0.13, 0.2], [0, 0.1, -3.95]);
  part(room, '#ffefe0', [0.2, 0.13, 8.2], [-3.95, 0.1, 0]);
  part(room, '#f7edda', [0.19, 2.05, 2.3], [-3.94, 2, -1.5]);
  part(room, '#a9d6d8', [0.2, 1.72, 1.94], [-3.81, 2, -1.5]);
  part(room, '#fcf4df', [0.23, 0.08, 1.94], [-3.7, 2, -1.5]);
  part(room, '#fcf4df', [0.23, 1.72, 0.08], [-3.7, 2, -1.5]);
  part(room, '#fff2de', [0.4, 0.12, 2.8], [-3.68, 1.05, -1.5]);
  const rug = part(room, '#e2a88e', [2.5, 0.04, 2.0], [0, 0.07, 0.9], 'cylinder');
  rug.rotation.y = 0.2;
  part(room, '#faf1dc', [1.1, 1.15, 0.1], [-0.1, 2.35, -3.92]);
  part(room, '#adc0a6', [0.9, 0.94, 0.12], [-0.1, 2.35, -3.85]);
  part(room, '#f5d88e', [0.22, 0.22, 0.04], [0.1, 2.55, -3.76], 'sphere');
  part(room, '#f0f4e4', [0.55, 0.13, 0.04], [-0.18, 2.2, -3.76]);
  const clock = part(room, '#fff6df', [0.4, 0.06, 0.4], [2.95, 2.7, -3.86], 'cylinder');
  clock.rotation.x = Math.PI / 2;
  part(room, '#876b5d', [0.03, 0.25, 0.04], [2.95, 2.8, -3.77]);
  part(room, '#876b5d', [0.18, 0.03, 0.04], [3.025, 2.7, -3.77]);
  const groups = new Map<string, Group>();
  function furniture(kind: FurnitureKind) {
    const group = new Group();
    switch (kind) {
      case 'sofa':
        part(group, '#c88672', [2.6, 0.42, 1.1], [0, 0.42, 0]);
        part(group, '#edb198', [2.55, 0.9, 0.28], [0, 0.9, -0.5]);
        part(group, '#f1bca4', [1.07, 0.24, 0.86], [-0.58, 0.72, 0.04]);
        part(group, '#f1bca4', [1.07, 0.24, 0.86], [0.58, 0.72, 0.04]);
        for (const side of [-1, 1])
          part(group, '#dfa086', [0.25, 0.65, 1.18], [side * 1.3, 0.7, 0]);
        part(group, '#fff0d4', [0.55, 0.5, 0.18], [-0.68, 1, -0.22]);
        part(group, '#9dbba7', [0.46, 0.46, 0.18], [0.55, 1, -0.2]);
        break;
      case 'table':
        part(group, '#b48159', [0.67, 0.55, 0.52], [0, 0.32, 0], 'cylinder');
        part(group, '#f0d5ac', [0.91, 0.12, 0.72], [0, 0.64, 0], 'cylinder');
        part(group, '#b8c3a0', [0.46, 0.07, 0.34], [-0.2, 0.75, 0.08]);
        part(group, '#fff5e3', [0.14, 0.24, 0.14], [0.35, 0.82, 0], 'cylinder');
        break;
      case 'plant':
        part(group, '#d69c7e', [0.36, 0.54, 0.36], [0, 0.27, 0], 'cylinder');
        part(group, '#62805c', [0.05, 1.0, 0.05], [0, 0.9, 0], 'cylinder');
        for (let i = 0; i < 5; i += 1) {
          const angle = i * 2.4;
          const leaf = part(
            group,
            i % 2 ? '#7fa47d' : '#91b087',
            [0.24, 0.48, 0.14],
            [Math.cos(angle) * 0.27, 0.95 + i * 0.11, Math.sin(angle) * 0.27],
            'sphere',
          );
          leaf.rotation.z = Math.cos(angle) * 0.8;
          leaf.rotation.x = Math.sin(angle) * 0.8;
        }
        break;
      case 'shelf':
        for (const x of [-0.85, 0.85]) part(group, '#bd9772', [0.12, 1.95, 0.65], [x, 0.975, 0]);
        for (const y of [0.1, 0.72, 1.32, 1.92])
          part(group, '#e1bc8f', [1.82, 0.12, 0.68], [0, y, 0]);
        for (let i = 0; i < 7; i += 1)
          part(
            group,
            ['#8aa8a3', '#deab8c', '#ede0b3'][i % 3] ?? '#8aa8a3',
            [0.15, 0.42 + (i % 2) * 0.08, 0.36],
            [-0.62 + i * 0.18, 0.4, 0],
          );
        part(group, '#f0dcc0', [0.23, 0.4, 0.23], [0.42, 1.55, 0], 'sphere');
        part(group, '#ce957a', [0.6, 0.29, 0.45], [-0.36, 0.93, 0]);
        break;
      case 'lamp':
        part(group, '#b49a79', [0.33, 0.1, 0.33], [0, 0.07, 0], 'cylinder');
        part(group, '#a68c6d', [0.035, 1.85, 0.035], [0, 0.95, 0], 'cylinder');
        part(group, '#f9e7ba', [0.53, 0.75, 0.53], [0, 1.95, 0], 'cone');
        break;
      case 'cushion':
        part(group, '#9bb8a2', [0.6, 0.18, 0.6], [0, 0.2, 0], 'sphere');
        break;
    }
    return group;
  }
  const avatar = new Group();
  avatar.position.set(1.8, 0, 1.5);
  scene.add(avatar);
  part(avatar, '#6b493d', [0.34, 0.38, 0.32], [0, 1.27, 0], 'sphere');
  part(avatar, '#f1c7a5', [0.27, 0.3, 0.26], [0, 1.24, 0.13], 'sphere');
  part(avatar, '#67473c', [0.32, 0.16, 0.28], [0, 1.49, 0.15], 'sphere');
  for (const x of [-0.1, 0.1]) {
    part(avatar, '#473e37', [0.025, 0.035, 0.018], [x, 1.25, 0.374], 'sphere');
    part(avatar, '#e6a498', [0.044, 0.022, 0.013], [x * 1.6, 1.17, 0.35], 'sphere');
  }
  part(avatar, '#fff1d3', [0.43, 0.43, 0.33], [0, 0.79, 0]);
  part(avatar, '#c57e64', [0.29, 0.33, 0.24], [0, 0.48, 0], 'cone');
  for (const x of [-0.29, 0.29]) part(avatar, '#fff1d3', [0.13, 0.4, 0.15], [x, 0.8, 0]);
  const feet: Mesh[] = [];
  for (const x of [-0.14, 0.14]) {
    part(avatar, '#f1c7a5', [0.1, 0.21, 0.12], [x, 0.24, 0]);
    feet.push(part(avatar, '#76534a', [0.15, 0.12, 0.23], [x, 0.1, 0.04]));
  }
  const target = avatar.position.clone();
  const marker = part(scene, '#fff4c9', [0.57, 0.012, 0.57], [0, 0.09, 0], 'cylinder');
  marker.visible = false;
  let view: RoomView = { editing: false, selected: null, theme: 'peach', zoom: 1 };
  let needsRender = true;
  let renderedFrames = 0;
  function project() {
    needsRender = true;
    const document = controller.getSnapshot();
    const ids = new Set(document.objects.map((object) => object.id));
    for (const [id, group] of groups)
      if (!ids.has(id)) {
        group.removeFromParent();
        groups.delete(id);
      }
    for (const object of document.objects) {
      const kind = furnitureKind(object);
      if (!kind) continue;
      let group = groups.get(object.id);
      if (group && group.userData['kind'] !== kind) {
        group.removeFromParent();
        groups.delete(object.id);
        group = undefined;
      }
      if (!group) {
        group = furniture(kind);
        group.userData['objectId'] = object.id;
        group.userData['kind'] = kind;
        groups.set(object.id, group);
        scene.add(group);
      }
      group.position.set(...object.transform.position);
      group.rotation.set(...object.transform.rotation);
    }
    const selected = view.selected ? groups.get(view.selected) : undefined;
    marker.visible = view.editing && !!selected;
    if (selected) marker.position.set(selected.position.x, 0.095, selected.position.z);
  }
  project();
  const unsubscribe = controller.subscribe(project);
  const ray = new Raycaster();
  const pointer = new Vector2();
  const ground = new Plane(new Vector3(0, 1, 0), 0);
  const hit = new Vector3();
  const offset = new Vector3();
  let dragging: SceneObject | null = null;
  let moved = false;
  function point(event: PointerEvent) {
    const bounds = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      (-(event.clientY - bounds.top) / bounds.height) * 2 + 1,
    );
    ray.setFromCamera(pointer, camera);
    return ray.ray.intersectPlane(ground, hit);
  }
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0 || !point(event)) return;
      if (!view.editing) {
        target.set(Math.max(-3.2, Math.min(3.2, hit.x)), 0, Math.max(-3.2, Math.min(3.2, hit.z)));
        return;
      }
      const picked = ray.intersectObjects([...groups.values()], true)[0];
      let object = picked?.object;
      while (object && !object.userData['objectId']) object = object.parent ?? undefined;
      const id = object?.userData['objectId'];
      if (typeof id !== 'string') {
        onSelect(null);
        return;
      }
      onSelect(id);
      dragging = controller.getSnapshot().objects.find((entry) => entry.id === id) ?? null;
      if (dragging) {
        offset.set(...dragging.transform.position).sub(hit);
        moved = false;
        controls.enabled = false;
        canvas.setPointerCapture(event.pointerId);
      }
    },
    { signal },
  );
  canvas.addEventListener(
    'pointermove',
    (event) => {
      if (!dragging || !point(event)) return;
      const group = groups.get(dragging.id);
      if (!group) return;
      group.position.set(
        Math.round(Math.max(-3.3, Math.min(3.3, hit.x + offset.x)) * 4) / 4,
        0,
        Math.round(Math.max(-3.3, Math.min(3.3, hit.z + offset.z)) * 4) / 4,
      );
      marker.position.set(group.position.x, 0.095, group.position.z);
      moved = true;
      needsRender = true;
    },
    { signal },
  );
  function finish(event: PointerEvent) {
    if (!dragging) return;
    const group = groups.get(dragging.id);
    if (moved && group && event.type !== 'pointercancel')
      controller.dispatch({
        type: 'scene-object.update',
        objectId: dragging.id,
        patch: { transform: { position: [group.position.x, 0, group.position.z] } },
      });
    dragging = null;
    controls.enabled = true;
    project();
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  }
  canvas.addEventListener('pointerup', finish, { signal });
  canvas.addEventListener('pointercancel', finish, { signal });
  const resize = new ResizeObserver(() => {
    needsRender = true;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    renderer.setSize(width, height, false);
    const aspect = width / height;
    camera.left = -6.6 * aspect;
    camera.right = 6.6 * aspect;
    camera.top = 6.6;
    camera.bottom = -6.6;
    camera.updateProjectionMatrix();
  });
  resize.observe(canvas);
  let last = 0;
  let disposed = false;
  function dispose() {
    if (disposed) return;
    disposed = true;
    renderer.setAnimationLoop(null);
    unsubscribe();
    resize.disconnect();
    controls.dispose();
    for (const geometry of geometries) geometry.dispose();
    for (const value of materials.values()) value.dispose();
    sun.shadow.dispose();
    renderer.dispose();
  }
  signal.addEventListener('abort', dispose, { once: true });
  renderer.setAnimationLoop((time) => {
    const delta = last ? Math.min((time - last) / 1000, 0.05) : 0;
    last = time;
    const distance = avatar.position.distanceTo(target);
    if (!view.editing && distance > 0.02) {
      avatar.rotation.y = Math.atan2(target.x - avatar.position.x, target.z - avatar.position.z);
      avatar.position.lerp(target, 1 - Math.exp(-delta * 4));
      for (let i = 0; i < feet.length; i++) {
        const foot = feet[i];
        if (foot) foot.position.z = Math.sin(time * 0.012 + i * Math.PI) * 0.1 + 0.04;
      }
    }
    const cameraChanged = controls.update(delta);
    if (needsRender || cameraChanged || (!view.editing && distance > 0.02)) {
      renderer.render(scene, camera);
      canvas.dataset['renderedFrames'] = String(++renderedFrames);
      needsRender = false;
    }
  });
  onReady(
    (renderer.backend as { isWebGPUBackend?: boolean }).isWebGPUBackend ? 'WebGPU' : 'WebGL2',
  );
  return {
    dispose,
    async exportGlb(): Promise<ArrayBuffer> {
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      if (disposed) throw new Error('방이 닫혔습니다. 다시 열고 내보내기해 주세요.');
      project();
      const markerVisible = marker.visible;
      marker.visible = false;
      try {
        const result = await new GLTFExporter().parseAsync(scene, { binary: true });
        if (!(result instanceof ArrayBuffer)) throw new Error('GLB 내보내기에 실패했습니다.');
        return result;
      } finally { marker.visible = markerVisible; needsRender = true; }
    },
    update(next: RoomView) {
      if (next.zoom !== view.zoom) {
        camera.zoom = next.zoom;
        camera.updateProjectionMatrix();
      }
      view = next;
      const colors = {
        peach: ['#ead3c6', '#e2a88e'],
        sage: ['#d5dfcb', '#b1bf97'],
        lavender: ['#dfd9ea', '#c2b0ce'],
      };
      const palette = colors[next.theme];
      back.material.color.set(palette[0] ?? '#ead3c6');
      left.material.color.copy(back.material.color);
      rug.material.color.set(palette[1] ?? '#e2a88e');
      project();
    },
    resetCamera() {
      needsRender = true;
      camera.position.set(12, 11, 15);
      controls.target.set(0, 1, 0);
      controls.update();
    },
  };
}
