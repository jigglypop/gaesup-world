import { ACESFilmicToneMapping, Box3, Color, DirectionalLight, Group, HemisphereLight, Matrix4, OrthographicCamera, PCFShadowMap, Plane, Raycaster, Scene, TOUCH, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { createLegacyRenderer, createRenderer, loadSceneRuntime, readRendererStats } from 'gaesup-world';
import type { SceneDocumentController } from 'gaesup-world';
import { NavigationSystem } from 'gaesup-world/navigation';
import type { Waypoint } from 'gaesup-world/navigation';

import { createDemandLoop } from './demandLoop';
import { furnitureKind } from './model';
import { createRoomAssets } from './roomAssets';
import { RoomBatches } from './roomBatches';
import type { RoomDiagnostics, RoomFrame, RoomLighting, RoomOptions, RoomQuality } from './roomTypes';
import type { RoomTheme } from './types';

export type RoomView = { editing: boolean; selected: string | null; theme: RoomTheme; zoom: number };
const QUALITY = { economy: { dpr: 1, shadow: 512 }, balanced: { dpr: 1.5, shadow: 1024 }, high: { dpr: 2, shadow: 2048 } };
const CAMERA = { isometric: [12, 11, 15], front: [0, 7, 18], top: [0, 19, 0.01] } as const;
export type RoomCamera = keyof typeof CAMERA;

export async function mountMiniroom(canvas: HTMLCanvasElement, controller: SceneDocumentController, onSelect: (id: string | null) => void, onReady: (backend: string) => void, ownerSignal: AbortSignal, options: RoomOptions = {}) {
  if (ownerSignal.aborted) return null;
  options.onProgress?.('렌더러 초기화');
  const renderer = options.backend === 'webgl' ? createLegacyRenderer({ canvas, antialias: true }) : await createRenderer({ canvas, antialias: true });
  if (ownerSignal.aborted) { renderer.dispose(); return null; }
  const lifetime = new AbortController(); const signal = lifetime.signal;
  const abort = () => lifetime.abort(); ownerSignal.addEventListener('abort', abort, { once: true });
  let cleanup = () => { ownerSignal.removeEventListener('abort', abort); renderer.dispose(); };
  try {
    renderer.info.autoReset = false; renderer.toneMapping = ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = PCFShadowMap;
    const backend = 'backend' in renderer ? renderer.backend as unknown as { isWebGPUBackend?: boolean; device?: { adapterInfo?: { vendor?: string; architecture?: string } } } : undefined;
    const gpuInfo = backend?.device?.adapterInfo;
    const adapter = gpuInfo ? [gpuInfo.vendor, gpuInfo.architecture].filter(Boolean).join(' / ') : null;
    const backendName = backend?.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
    options.onProgress?.('장면·가구 구성');
    const scene = new Scene(); scene.background = new Color('#ece7df');
    const camera = new OrthographicCamera(-6, 6, 6, -6, 0.1, 100); camera.position.set(...CAMERA.isometric);
    const controls = new OrbitControls(camera, canvas);
    controls.target.set(0, 1, 0); controls.enablePan = false; controls.enableDamping = true;
    controls.minZoom = 0.65; controls.maxZoom = 1.65; controls.minPolarAngle = 0.02; controls.maxPolarAngle = 1.4;
    controls.mouseButtons.LEFT = null; controls.touches.ONE = TOUCH.ROTATE; controls.touches.TWO = TOUCH.DOLLY_ROTATE; controls.update();
    let sun = new DirectionalLight('#ffe5c3', 2.8); sun.position.set(3, 9, 6); sun.castShadow = true;
    const retiredShadows: Array<DirectionalLight['shadow']> = [];
    sun.shadow.normalBias = 0.025; sun.shadow.bias = -0.00015; sun.shadow.autoUpdate = false;
    Object.assign(sun.shadow.camera, { left: -7, right: 7, top: 7, bottom: -7, near: 0.5, far: 25 }); sun.shadow.camera.updateProjectionMatrix();
    const fill = new HemisphereLight('#d7e8f0', '#a48a71', 2.1); scene.add(sun, fill);
    const assets = createRoomAssets(scene); const { room, back, left, rug, avatar, feet } = assets;
    const groups = new Map<string, Group>(); const batches = new RoomBatches(); scene.add(batches.root);
    const target = avatar.position.clone();
    const navigation = new NavigationSystem({ cellSize: 0.25, worldMinX: -3.75, worldMinZ: -3.75, worldMaxX: 3.75, worldMaxZ: 3.75 });
    let route: Waypoint[] = []; let routeIndex = 0;
    const marker = assets.part(scene, '#e7c16e', [0.67, 0.007, 0.67], [0, 0.09, 0], 'cylinder'); marker.castShadow = false; marker.visible = false;
    let view: RoomView = { editing: false, selected: null, theme: 'peach', zoom: 1 };
    let quality: RoomQuality = 'balanced'; let lighting: RoomLighting = 'day';
    let disposed = false; let visible = true; let last = 0; let renderedFrames = 0; let loopCallbacks = 0;
    let batchesDirty = true; let needsRender = true; let failure: Error | null = null;
    let latestFrame: RoomFrame | null = null; let projected: ReturnType<typeof controller.getSnapshot> | undefined;
    const frameWaiters = new Set<{ resolve: (frame: RoomFrame) => void; reject: (error: Error) => void }>();
    let wake = () => {};
    function invalidate(shadow = false) { if (disposed) return; needsRender = true; if (shadow) sun.shadow.needsUpdate = true; wake(); }
    function markerUpdate() {
      const selected = view.selected ? groups.get(view.selected) : undefined;
      marker.visible = view.editing && !!selected?.visible;
      if (selected) marker.position.set(selected.position.x, 0.095, selected.position.z);
    }
    function project() {
      const document = controller.getSnapshot();
      if (document !== projected) {
        const loaded = loadSceneRuntime(document); if (!loaded.runtime) throw new Error('장면 문서를 읽을 수 없습니다.');
        const ids = new Set(document.objects.filter(object => furnitureKind(object)).map(object => object.id));
        for (const [id] of groups) if (!ids.has(id)) groups.delete(id);
        const matrix = new Matrix4();
        for (const object of document.objects) {
          const kind = furnitureKind(object); if (!kind) continue;
          let group = groups.get(object.id);
          if (!group || group.userData['kind'] !== kind) { group = assets.furniture(kind); group.userData['objectId'] = object.id; group.userData['kind'] = kind; groups.set(object.id, group); }
          const worldMatrix = loaded.runtime.getWorldMatrix(object.id);
          if (worldMatrix) { matrix.fromArray(worldMatrix); matrix.decompose(group.position, group.quaternion, group.scale); }
          group.visible = object.components.find(component => component.type === 'miniroom.furniture')?.enabled !== false;
        }
        projected = document; batchesDirty = true; invalidate(true);
        navigation.reset();
        for (const group of groups.values()) if (group.visible && group.userData['kind'] !== 'cushion') navigation.setBlockedFromBox(new Box3().setFromObject(group));
        route = []; target.copy(avatar.position);
      }
      markerUpdate(); invalidate();
    }
    const ray = new Raycaster(); const pointer = new Vector2(); const ground = new Plane(new Vector3(0, 1, 0), 0); const hit = new Vector3();
    let dragging: { id: string; revision: number; offset: Vector3; pointer: number; moved: boolean } | null = null;
    let press: { x: number; y: number; pointer: number } | null = null; const pointers = new Set<number>();
    function point(event: PointerEvent) {
      const bounds = canvas.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      ray.setFromCamera(pointer, camera); return ray.ray.intersectPlane(ground, hit);
    }
    const clamp = (value: number) => Math.round(Math.max(-3.25, Math.min(3.25, value)) * 4) / 4;
    function moveTo(x: number, z: number) {
      const goal: Waypoint = [clamp(x), 0, clamp(z)]; const start: Waypoint = [avatar.position.x, 0, avatar.position.z];
      const path = navigation.findPath(start[0], start[2], goal[0], goal[2], { y: 0, agentRadius: 0.18 });
      route = navigation.smoothPath(path, start, goal, { agentRadius: 0.18 }); routeIndex = 1;
      const next = route[routeIndex];
      if (!next) { options.onNotice?.('가구를 피해 빈 바닥을 선택해 주세요.'); return; }
      options.onNotice?.(''); target.fromArray(next); invalidate(true);
    }
    function finish(commit: boolean) {
      if (!dragging) return;
      const current = dragging; dragging = null; controls.enabled = true; const group = groups.get(current.id);
      if (commit && current.moved && group) {
        const result = controller.dispatch({ type: 'scene-object.update', objectId: current.id, patch: { transform: { position: [group.position.x, group.position.y, group.position.z] } } }, { expectedRevision: current.revision });
        if (!result.accepted) options.onNotice?.('다른 변경이 있어 이동을 취소했습니다.');
      }
      if (canvas.hasPointerCapture(current.pointer)) canvas.releasePointerCapture(current.pointer);
      projected = undefined; project();
    }
    canvas.addEventListener('pointerdown', event => {
      pointers.add(event.pointerId); if (pointers.size > 1) { press = null; finish(false); return; }
      if (event.button !== 0 || !point(event)) return;
      canvas.focus({ preventScroll: true }); press = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
      if (!view.editing) return;
      const picked = ray.intersectObject(batches.root, true)[0];
      const id: unknown = picked?.instanceId === undefined ? undefined : picked.object.userData['owners']?.[picked.instanceId];
      if (typeof id !== 'string') { onSelect(null); return; }
      onSelect(id); const group = groups.get(id); const object = controller.getSnapshot().objects.find(entry => entry.id === id);
      if (group && !object?.parentId) {
        dragging = { id, revision: controller.getRevision(), offset: group.position.clone().sub(hit), pointer: event.pointerId, moved: false };
        controls.enabled = false; canvas.setPointerCapture(event.pointerId);
      }
    }, { signal });
    canvas.addEventListener('pointermove', event => {
      if (!dragging || event.pointerId !== dragging.pointer || !point(event)) return;
      const group = groups.get(dragging.id); if (!group) return;
      group.position.x = clamp(hit.x + dragging.offset.x); group.position.z = clamp(hit.z + dragging.offset.z);
      dragging.moved = true; batchesDirty = true; markerUpdate(); invalidate(true);
    }, { signal });
    canvas.addEventListener('pointerup', event => {
      pointers.delete(event.pointerId);
      if (dragging?.pointer === event.pointerId) finish(true);
      else if (!view.editing && press?.pointer === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6 && point(event)) moveTo(hit.x, hit.z);
      press = null;
    }, { signal });
    const cancelPointer = (event: PointerEvent) => { pointers.delete(event.pointerId); press = null; if (dragging?.pointer === event.pointerId) finish(false); };
    canvas.addEventListener('pointercancel', cancelPointer, { signal }); canvas.addEventListener('lostpointercapture', cancelPointer, { signal });
    window.addEventListener('blur', () => { pointers.clear(); press = null; finish(false); }, { signal });
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Escape') { finish(false); onSelect(null); return; }
      if (event.key === 'Home') { event.preventDefault(); setCamera('isometric'); return; }
      const delta = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, -0.25], ArrowDown: [0, 0.25] }[event.key];
      if (!delta) return; event.preventDefault(); const object = controller.getSnapshot().objects.find(entry => entry.id === view.selected);
      if (view.editing && object && !object.parentId) controller.dispatch({ type: 'scene-object.update', objectId: object.id, patch: { transform: { position: [clamp(object.transform.position[0] + delta[0]!), object.transform.position[1], clamp(object.transform.position[2] + delta[1]!)] } } });
      else if (!view.editing) moveTo(avatar.position.x + delta[0]!, avatar.position.z + delta[1]!);
    }, { signal });
    function resize() {
      if (disposed) return;
      const width = Math.max(1, canvas.clientWidth); const height = Math.max(1, canvas.clientHeight); const aspect = width / height;
      renderer.setPixelRatio(Math.min(options.dpr ?? devicePixelRatio, QUALITY[quality].dpr)); renderer.setSize(width, height, false);
      const half = Math.max(5.35, 5.9 / aspect); Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half }); camera.updateProjectionMatrix(); invalidate();
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const intersection = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; wake(); }) : null; intersection?.observe(canvas);
    const controlsChanged = () => invalidate(); controls.addEventListener('change', controlsChanged);
    const loop = createDemandLoop(time => {
      loopCallbacks++; const delta = last ? Math.min((time - last) / 1000, 0.05) : 0; last = time;
      let moving = !view.editing && avatar.position.distanceToSquared(target) > 0.0004;
      if (moving) {
        avatar.rotation.y = Math.atan2(target.x - avatar.position.x, target.z - avatar.position.z); avatar.position.lerp(target, 1 - Math.exp(-delta * 5));
        for (let i = 0; i < feet.length; i++) feet[i]!.position.z = Math.sin(time * 0.012 + i * Math.PI) * 0.1 + 0.04;
        if (avatar.position.distanceToSquared(target) <= 0.0004) {
          avatar.position.copy(target); const next = route[++routeIndex];
          if (next) target.fromArray(next); else { for (const foot of feet) foot.position.z = 0.04; moving = false; }
        }
        sun.shadow.needsUpdate = true; needsRender = true;
      }
      const cameraChanged = controls.update(delta);
      if (needsRender || cameraChanged || moving || frameWaiters.size) {
        try {
          if (batchesDirty) { batches.update(groups); batchesDirty = false; }
          renderer.info.reset(); const started = performance.now(); renderer.render(scene, camera);
          for (const shadow of retiredShadows) shadow.dispose(); retiredShadows.length = 0;
          latestFrame = { at: performance.now(), submitMs: performance.now() - started, stats: readRendererStats(renderer.info) };
          canvas.dataset['renderedFrames'] = String(++renderedFrames); needsRender = false;
          for (const waiter of frameWaiters) waiter.resolve(latestFrame); frameWaiters.clear();
        } catch (error) {
          failure = error instanceof Error ? error : new Error(String(error)); for (const waiter of frameWaiters) waiter.reject(failure); frameWaiters.clear(); loop.dispose(); options.onError?.(failure); return false;
        }
      }
      return cameraChanged || moving;
    });
    const lost = () => {
      if (disposed) return;
      failure = new Error('그래픽 연결이 종료됐습니다. 다시 열기를 눌러 복구해 주세요.'); loop.dispose();
      for (const waiter of frameWaiters) waiter.reject(failure); frameWaiters.clear(); options.onError?.(failure);
    };
    canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost(); }, { signal });
    if ('onDeviceLost' in renderer) {
      const previous = renderer.onDeviceLost;
      renderer.onDeviceLost = info => { if (!disposed) { previous.call(renderer, info); lost(); } };
    }
    wake = () => { if (!disposed && !failure) { loop.setActive(document.visibilityState !== 'hidden' && (visible || frameWaiters.size > 0)); if (!loop.pending) last = 0; } };
    document.addEventListener('visibilitychange', () => { if (document.hidden) finish(false); last = 0; wake(); }, { signal });
    const unsubscribe = controller.subscribe(project);
    function dispose() {
      if (disposed) return; disposed = true; loop.dispose(); lifetime.abort(); ownerSignal.removeEventListener('abort', abort);
      for (const waiter of frameWaiters) waiter.reject(new DOMException('Room closed', 'AbortError')); frameWaiters.clear();
      unsubscribe(); observer.disconnect(); intersection?.disconnect(); controls.removeEventListener('change', controlsChanged); controls.dispose();
      navigation.dispose(); batches.dispose(); assets.dispose(); sun.shadow.dispose();
      for (const shadow of retiredShadows) shadow.dispose(); retiredShadows.length = 0;
      renderer.dispose(); groups.clear();
    }
    cleanup = dispose; signal.addEventListener('abort', dispose, { once: true });
    function frame(): Promise<RoomFrame> {
      if (disposed || failure) return Promise.reject(failure ?? new DOMException('Room closed', 'AbortError'));
      return new Promise((resolve, reject) => { frameWaiters.add({ resolve, reject }); invalidate(); });
    }
    function setCamera(preset: RoomCamera) {
      if (disposed) return; finish(false); controls.reset(); camera.position.fromArray(CAMERA[preset]); controls.target.set(0, 1, 0); camera.zoom = view.zoom; camera.updateProjectionMatrix(); controls.update(); invalidate();
    }
    function setQuality(next: RoomQuality) {
      if (disposed || !QUALITY[next]) return; quality = next;
      if (sun.shadow.mapSize.x !== QUALITY[next].shadow) {
        // New shadow identity avoids common-renderer attachment caches retaining destroyed depth views.
        const previous = sun; sun = previous.clone(); sun.shadow.mapSize.setScalar(QUALITY[next].shadow);
        previous.removeFromParent(); scene.add(sun); retiredShadows.push(previous.shadow);
      }
      resize(); invalidate(true);
    }
    const engine = {
      dispose, frame, setCamera, setQuality,
      setLighting(next: RoomLighting) {
        if (disposed) return; lighting = next; sun.color.set(next === 'day' ? '#ffe5c3' : '#ffbf86'); sun.intensity = next === 'day' ? 2.8 : 1.4;
        fill.color.set(next === 'day' ? '#d7e8f0' : '#9eafdf'); fill.intensity = next === 'day' ? 2.1 : 0.95;
        scene.background = new Color(next === 'day' ? '#ece7df' : '#d1cbd6'); invalidate(true);
      },
      diagnostics(): RoomDiagnostics {
        return { backend: backendName, adapter, renderedFrames, loopCallbacks, pendingFrame: loop.pending, objectCount: groups.size, visibleObjects: [...groups.values()].filter(group => group.visible).length, quality, lighting, dpr: renderer.getPixelRatio(), width: canvas.clientWidth, height: canvas.clientHeight, frame: latestFrame, avatarPosition: [avatar.position.x, avatar.position.y, avatar.position.z] };
      },
      projectPoint(position: [number, number, number]) { const point = new Vector3(...position).project(camera); return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }; },
      async capture(): Promise<Blob> { await frame(); return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('이미지를 만들 수 없습니다.')), 'image/png')); },
      async exportGlb(): Promise<ArrayBuffer> {
        const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
        if (disposed) throw new Error('방이 닫혔습니다. 다시 열고 내보내기해 주세요.'); finish(false); project();
        const exported = new Scene(); exported.add(room.clone(true), avatar.clone(true)); for (const group of groups.values()) if (group.visible) exported.add(group.clone(true));
        const result = await new GLTFExporter().parseAsync(exported, { binary: true }); if (!(result instanceof ArrayBuffer)) throw new Error('GLB 내보내기에 실패했습니다.'); return result;
      },
      update(next: RoomView) {
        if (disposed) return;
        if (next.editing !== view.editing) { finish(false); target.copy(avatar.position); for (const foot of feet) foot.position.z = 0.04; }
        if (next.zoom !== view.zoom) { camera.zoom = next.zoom; camera.updateProjectionMatrix(); }
        view = next; const palette = { peach: ['#ead3c6', '#e2a88e'], sage: ['#d5dfcb', '#b1bf97'], lavender: ['#dfd9ea', '#c2b0ce'] }[next.theme];
        back.material.color.set(palette[0]!); left.material.color.copy(back.material.color); rug.material.color.set(palette[1]!); project();
      },
      resetCamera() { setCamera('isometric'); },
    };
    project(); setQuality(quality); batches.update(groups); batchesDirty = false;
    options.onProgress?.('이동 경로 준비'); await navigation.init();
    if (disposed) return null;
    options.onProgress?.('셰이더 준비'); await renderer.compileAsync(scene, camera);
    if (disposed) return null; await frame(); if (disposed) return null; onReady(backendName); return engine;
  } catch (error) { cleanup(); throw error; }
}

export type MiniroomEngine = NonNullable<Awaited<ReturnType<typeof mountMiniroom>>>;
