import { ACESFilmicToneMapping, Box3, Color, DirectionalLight, Group, HemisphereLight, Matrix4, MOUSE, OrthographicCamera, PCFShadowMap, PerspectiveCamera, Plane, Raycaster, Scene, SkinnedMesh, TOUCH, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { clone as cloneSkeleton } from 'three/addons/utils/SkeletonUtils.js';

import { createLegacyRenderer, createRenderer, loadSceneRuntime, readRendererStats } from 'gaesup-world';
import type { SceneDocumentController } from 'gaesup-world';
import { NavigationSystem } from 'gaesup-world/navigation';
import type { Waypoint } from 'gaesup-world/navigation';

import { createDemandLoop } from './demandLoop';
import { furnitureKind } from './model';
import { createRoomAssets } from './roomAssets';
import { createRoomAvatar } from './roomAvatar';
import { RoomBatches } from './roomBatches';
import { createRoomBloom } from './roomBloom';
import { createRoomEnvironment } from './roomEnvironment';
import { createRoomFestival } from './roomFestival';
import { createRoomPath } from './roomPath';
import { createRoomPeers } from './roomPeers';
import { createRoomProfiler } from './roomProfiler';
import { createRoomTerrain } from './roomTerrain';
import { DEFAULT_ROOM_SETTINGS, type RoomCamera, type RoomDiagnostics, type RoomFrame, type RoomLighting, type RoomOptions, type RoomQuality, type RoomSettings } from './roomTypes';
import type { RoomPeer } from './roomVisitors';
import { createTerrain, DEFAULT_EDITOR, TILES, brushIndices, applyTerrainBrush, terrainHeight, tileAt, tileIndex, tilePosition, type RoomEditor, type RoomTerrain } from './terrain';
import type { RoomTheme } from './types';

export type RoomView = { editing: boolean; selected: string | null; theme: RoomTheme; zoom: number; terrain?: RoomTerrain; editor?: RoomEditor };
const QUALITY = { economy: { dpr: 1, shadow: 512 }, balanced: { dpr: 1.5, shadow: 1024 }, high: { dpr: 2, shadow: 2048 } };
const CAMERA = { isometric: [24, 25, 30], front: [0, 20, 34], top: [0, 40, 0.01], back: [0, 20, -34], left: [-34, 20, 0], right: [34, 20, 0], follow: [10, 12, 14] } as const;
export type { RoomCamera } from './roomTypes';

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
    const scene = new Scene(); scene.background = new Color('#9fcfdf');
    let camera: OrthographicCamera | PerspectiveCamera = new OrthographicCamera(-16, 16, 16, -16, 0.1, 160); camera.position.set(...CAMERA.isometric);
    const bloom = await createRoomBloom(renderer, scene, camera);
    if (signal.aborted) { bloom.dispose(); cleanup(); return null; }
    const controls = new OrbitControls<OrthographicCamera | PerspectiveCamera>(camera, canvas);
    controls.target.set(0, 0, 0); controls.enablePan = true; controls.enableDamping = true;
    controls.minZoom = 0.5; controls.maxZoom = 4; controls.minDistance = 5; controls.maxDistance = 70; controls.minPolarAngle = 0.02; controls.maxPolarAngle = 1.48;
    controls.mouseButtons.LEFT = null; controls.mouseButtons.RIGHT = MOUSE.ROTATE; controls.mouseButtons.MIDDLE = MOUSE.PAN;
    controls.touches.ONE = TOUCH.ROTATE; controls.touches.TWO = TOUCH.DOLLY_PAN; controls.update();
    let sun = new DirectionalLight('#ffe5c3', 2.8); sun.position.set(8, 22, 12); sun.castShadow = true;
    const retiredShadows: Array<DirectionalLight['shadow']> = [];
    sun.shadow.normalBias = 0.025; sun.shadow.bias = -0.00015; sun.shadow.autoUpdate = false; sun.shadow.bias = -0.00025; sun.shadow.normalBias = 0.025;
    Object.assign(sun.shadow.camera, { left: -19, right: 19, top: 19, bottom: -19, near: 0.5, far: 65 }); sun.shadow.camera.updateProjectionMatrix();
    const fill = new HemisphereLight('#d7e8f0', '#a48a71', 2.1); scene.add(sun, fill);
    const assets = createRoomAssets(scene); const { room, back, left, rug, avatar, feet } = assets;
    const terrainRenderer = createRoomTerrain(scene); let terrain = createTerrain(); terrainRenderer.update(terrain);
    const pathMarker = createRoomPath(scene); const profiler = createRoomProfiler(renderer.info, () => camera);
    const visitors = createRoomPeers(scene);
    const festival = createRoomFestival(scene, (x, z) => terrainHeight(terrain, x, z));
    let knownFurniture: Set<string> | null = null;
    const groups = new Map<string, Group>(); const batches = new RoomBatches(); scene.add(batches.root);
    const target = avatar.position.clone();
    const createNavigation = (size: number) => new NavigationSystem({ cellSize: 0.25, maxStepHeight: 0.18, worldMinX: -size / 2, worldMinZ: -size / 2, worldMaxX: size / 2, worldMaxZ: size / 2 });
    let navigation = createNavigation(terrain.size);
    let route: Waypoint[] = []; let routeIndex = 0;
    const marker = assets.part(scene, '#e7c16e', [0.67, 0.007, 0.67], [0, 0.09, 0], 'cylinder'); marker.castShadow = false; marker.visible = false;
    let view: RoomView = { editing: false, selected: null, theme: 'peach', zoom: 1 };
    let quality: RoomQuality = 'balanced'; let lighting: RoomLighting = 'day';
    let settings: RoomSettings = { ...DEFAULT_ROOM_SETTINGS }; let cameraPreset: RoomCamera = 'isometric';
    let movement: RoomDiagnostics['movement'] = { state: 'idle', destination: null, waypoints: 0 };
    let disposed = false; let visible = true; let last = 0; let renderedFrames = 0; let loopCallbacks = 0;
    let shadowElapsed = 0;
    let batchesDirty = true; let needsRender = true; let failure: Error | null = null;
    let latestFrame: RoomFrame | null = null; let projected: ReturnType<typeof controller.getSnapshot> | undefined;
    const frameWaiters = new Set<{ resolve: (frame: RoomFrame) => void; reject: (error: Error) => void }>();
    let wake = () => {};
    function invalidate(shadow = false) { if (disposed) return; needsRender = true; if (shadow) sun.shadow.needsUpdate = true; wake(); }
    const rendererCleanup = cleanup;
    cleanup = () => { controls.dispose(); bloom.dispose(); terrainRenderer.dispose(); pathMarker.dispose(); visitors.dispose(); festival.dispose(); profiler.dispose(); navigation.dispose(); batches.dispose(); assets.dispose(); sun.shadow.dispose(); rendererCleanup(); };
    const environment = await createRoomEnvironment(renderer, scene, camera, () => invalidate(true));
    const sceneCleanup = cleanup; cleanup = () => { environment.dispose(); sceneCleanup(); };
    if (signal.aborted) { cleanup(); return null; }
    environment.update(terrain, quality, settings.weather);
    const avatarRuntime = createRoomAvatar(avatar, signal, () => invalidate(true));
    function markerUpdate() {
      const selected = view.selected ? groups.get(view.selected) : undefined;
      marker.visible = view.editing && !!selected?.visible;
      if (selected) marker.position.set(selected.position.x, selected.position.y + 0.095, selected.position.z);
    }
    function rebuildNavigation() {
      navigation.reset();
      if (terrain.heights || terrain.stairs) navigation.setHeightSampler(0, 0, terrain.size, terrain.size, (x, z) => terrainHeight(terrain, x, z));
      avatar.position.y = terrainHeight(terrain, avatar.position.x, avatar.position.z);
      for (const wall of room.children) {
        if (wall.userData['baseY'] === undefined) wall.userData['baseY'] = wall.position.y;
        wall.position.y = Number(wall.userData['baseY']) + terrainHeight(terrain, wall.position.x, wall.position.z);
      }
      for (const group of groups.values()) if (group.visible && group.userData['kind'] !== 'cushion') navigation.setBlockedFromBox(new Box3().setFromObject(group));
      for (const wall of [back, left]) navigation.setBlockedFromBox(new Box3().setFromObject(wall));
      terrain.tiles.forEach((kind, index) => {
        if (TILES[kind].walkable) return;
        const [x, , z] = tilePosition(index, terrain.size); navigation.setBlockedFromBox(new Box3(new Vector3(x - 0.49, -1, z - 0.49), new Vector3(x + 0.49, 1, z + 0.49)));
      });
      route = []; target.copy(avatar.position); movement = { state: 'idle', destination: null, waypoints: 0 }; pathMarker.hide();
      if (!navigation.isWalkable(avatar.position.x, avatar.position.z, { agentRadius: 0.3 })) {
        let closest = -1; let distance = Infinity;
        terrain.tiles.forEach((kind, index) => {
          if (!TILES[kind].walkable) return;
          const [x, , z] = tilePosition(index, terrain.size); const squared = (x - avatar.position.x) ** 2 + (z - avatar.position.z) ** 2;
          if (squared < distance && navigation.isWalkable(x, z, { agentRadius: 0.3 })) { distance = squared; closest = index; }
        });
        if (closest >= 0) { avatar.position.fromArray(tilePosition(closest, terrain.size)); avatar.position.y = terrainHeight(terrain, avatar.position.x, avatar.position.z); target.copy(avatar.position); }
      }
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
          const appearance = object.components.find(component => component.type === 'miniroom.furniture')?.data;
          const glow = appearance?.['bloom'] === true ? Number(appearance['emissiveIntensity'] ?? 3) : 0;
          if (!group || group.userData['kind'] !== kind || group.userData['glow'] !== glow) { group = assets.furniture(kind, glow); group.userData['objectId'] = object.id; group.userData['kind'] = kind; group.userData['glow'] = glow; groups.set(object.id, group); }
          const worldMatrix = loaded.runtime.getWorldMatrix(object.id);
          if (worldMatrix) { matrix.fromArray(worldMatrix); matrix.decompose(group.position, group.quaternion, group.scale); }
          group.visible = object.components.find(component => component.type === 'miniroom.furniture')?.enabled !== false;
        }
        // Newly placed furniture gets one confetti burst; the first projection and bulk imports stay quiet.
        const added = knownFurniture ? [...ids].filter(id => !knownFurniture!.has(id)) : [];
        const placed = added.length === 1 ? groups.get(added[0]!) : undefined;
        if (placed?.visible) festival.burst(placed.position.x, placed.position.y, placed.position.z);
        knownFurniture = ids;
        projected = document; batchesDirty = true; invalidate(true);
        rebuildNavigation();
      }
      markerUpdate(); invalidate();
    }
    const ray = new Raycaster(); const pointer = new Vector2(); const ground = new Plane(new Vector3(0, 1, 0), 0); const hit = new Vector3();
    let dragging: { id: string; revision: number; offset: Vector3; pointer: number; moved: boolean } | null = null;
    let press: { x: number; y: number; pointer: number } | null = null; const pointers = new Set<number>();
    let stroke: { pointer: number; cells: Set<number>; lastX: number; lastZ: number } | null = null;
    function paintPreview(x: number, z: number) {
      if (!stroke) return;
      const editor = view.editor ?? DEFAULT_EDITOR;
      const steps = Math.max(1, Math.ceil(Math.hypot(x - stroke.lastX, z - stroke.lastZ) * 2));
      for (let step = 1; step <= steps; step++) {
        const index = tileIndex(stroke.lastX + (x - stroke.lastX) * step / steps, stroke.lastZ + (z - stroke.lastZ) * step / steps, terrain.size);
        for (const cell of brushIndices(index, editor.brush, terrain.size)) stroke.cells.add(cell);
      }
      stroke.lastX = x; stroke.lastZ = z; terrainRenderer.update(applyTerrainBrush(terrain, [...stroke.cells], editor)); invalidate(true);
    }
    function endStroke(commit: boolean) {
      if (!stroke) return;
      const current = stroke; stroke = null; controls.enabled = true;
      terrainRenderer.update(terrain);
      if (commit && current.cells.size) {
        const editor = view.editor ?? DEFAULT_EDITOR;
        if (editor.tool === 'tile') options.onPaint?.([...current.cells], editor.tile);
        else options.onSculpt?.([...current.cells], { height: editor.height, stair: editor.tool === 'stairs' ? editor.stair : null });
      }
      if (canvas.hasPointerCapture(current.pointer)) canvas.releasePointerCapture(current.pointer);
      invalidate(true);
    }
    function point(event: PointerEvent) {
      const bounds = canvas.getBoundingClientRect();
      pointer.set((event.clientX - bounds.left) / bounds.width * 2 - 1, -(event.clientY - bounds.top) / bounds.height * 2 + 1);
      ray.setFromCamera(pointer, camera);
      const surface = ray.intersectObject(terrainRenderer.root, true)[0];
      return surface ? hit.copy(surface.point) : ray.ray.intersectPlane(ground, hit);
    }
    const clamp = (value: number) => Math.round(Math.max(-terrain.size / 2 + 0.75, Math.min(terrain.size / 2 - 0.75, value)) * 100) / 100;
    function moveTo(x: number, z: number) {
      const goal: Waypoint = [clamp(x), terrainHeight(terrain, clamp(x), clamp(z)), clamp(z)]; const start: Waypoint = [avatar.position.x, avatar.position.y, avatar.position.z];
      const surface = tileAt(terrain, x, z);
      if (!surface || !TILES[surface].walkable) { blocked(goal); return; }
      const path = navigation.findPath(start[0], start[2], goal[0], goal[2], { agentRadius: 0.3 });
      route = navigation.smoothPath(path, start, goal, { agentRadius: 0.3 }); routeIndex = 1;
      const next = route[routeIndex];
      if (!next) { blocked(goal); return; }
      movement = { state: 'moving', destination: goal, waypoints: route.length }; pathMarker.show(new Vector3(...goal), route, false);
      options.onNotice?.(''); target.fromArray(next); invalidate(true);
    }
    function blocked(goal: Waypoint) { route = []; target.copy(avatar.position); movement = { state: 'blocked', destination: [...goal], waypoints: 0 }; pathMarker.show(new Vector3(...goal), [], true); options.onNotice?.('이 위치로 이동할 수 없습니다. 길이나 빈 타일을 선택해 주세요.'); invalidate(); }
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
      pointers.add(event.pointerId); if (pointers.size > 1) { press = null; finish(false); endStroke(false); return; }
      if (event.button !== 0 || !point(event)) return;
      canvas.focus({ preventScroll: true }); press = { x: event.clientX, y: event.clientY, pointer: event.pointerId };
      if (!view.editing) return;
      const editor = view.editor ?? DEFAULT_EDITOR;
      if (editor.tool === 'tile' || editor.tool === 'height' || editor.tool === 'stairs') {
        stroke = { pointer: event.pointerId, cells: new Set(), lastX: hit.x, lastZ: hit.z }; controls.enabled = false;
        canvas.setPointerCapture(event.pointerId); paintPreview(hit.x, hit.z); return;
      }
      if (editor.tool === 'furniture') { controls.enabled = false; return; }
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
      if (point(event) && view.editing) {
        const editor = view.editor ?? DEFAULT_EDITOR;
        terrainRenderer.cursor(tileIndex(hit.x, hit.z, terrain.size), editor.tool === 'tile' || editor.tool === 'height' || editor.tool === 'stairs' ? editor.brush : 1, editor.tool === 'tile' ? TILES[editor.tile].color : '#90e2f3'); invalidate();
        if (stroke?.pointer === event.pointerId) { paintPreview(hit.x, hit.z); return; }
      }
      if (!dragging || event.pointerId !== dragging.pointer || !point(event)) return;
      const group = groups.get(dragging.id); if (!group) return;
      const snap = (view.editor ?? DEFAULT_EDITOR).snap;
      group.position.x = snap ? Math.round(clamp(hit.x + dragging.offset.x) * 2) / 2 : clamp(hit.x + dragging.offset.x);
      group.position.z = snap ? Math.round(clamp(hit.z + dragging.offset.z) * 2) / 2 : clamp(hit.z + dragging.offset.z);
      group.position.y = terrainHeight(terrain, group.position.x, group.position.z);
      dragging.moved = true; batchesDirty = true; markerUpdate(); invalidate(true);
    }, { signal });
    canvas.addEventListener('pointerup', event => {
      pointers.delete(event.pointerId);
      if (stroke?.pointer === event.pointerId) endStroke(true);
      else if (dragging?.pointer === event.pointerId) finish(true);
      else if (view.editing && (view.editor ?? DEFAULT_EDITOR).tool === 'furniture' && press?.pointer === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6 && point(event)) {
        const index = tileIndex(hit.x, hit.z, terrain.size); if (index >= 0) {
          if (tileAt(terrain, hit.x, hit.z) === 'water') options.onNotice?.('가구는 육지 타일에 놓아 주세요.');
          else { const [x, , z] = (view.editor ?? DEFAULT_EDITOR).snap ? tilePosition(index, terrain.size) : [clamp(hit.x), 0, clamp(hit.z)]; options.onPlace?.((view.editor ?? DEFAULT_EDITOR).furniture, x!, z!); }
        }
      }
      else if (!view.editing && press?.pointer === event.pointerId && Math.hypot(event.clientX - press.x, event.clientY - press.y) < 6 && point(event)) moveTo(hit.x, hit.z);
      press = null; controls.enabled = true;
    }, { signal });
    const cancelPointer = (event: PointerEvent) => { pointers.delete(event.pointerId); press = null; if (dragging?.pointer === event.pointerId) finish(false); if (stroke?.pointer === event.pointerId) endStroke(false); controls.enabled = true; };
    canvas.addEventListener('pointercancel', cancelPointer, { signal }); canvas.addEventListener('lostpointercapture', cancelPointer, { signal });
    canvas.addEventListener('pointerleave', () => { terrainRenderer.cursor(-1, 1); invalidate(); }, { signal });
    window.addEventListener('blur', () => { pointers.clear(); press = null; finish(false); endStroke(false); }, { signal });
    canvas.addEventListener('keydown', event => {
      if (event.key === 'Escape') { finish(false); endStroke(false); onSelect(null); return; }
      if (event.key === 'Home') { event.preventDefault(); setCamera('isometric'); return; }
      const step = view.editing ? 0.5 : 1;
      const delta = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step], a: [-step, 0], d: [step, 0], w: [0, -step], s: [0, step] }[event.key];
      if (!delta) return; event.preventDefault(); const object = controller.getSnapshot().objects.find(entry => entry.id === view.selected);
      if (view.editing && object && !object.parentId) controller.dispatch({ type: 'scene-object.update', objectId: object.id, patch: { transform: { position: [clamp(object.transform.position[0] + delta[0]!), object.transform.position[1], clamp(object.transform.position[2] + delta[1]!)] } } });
      else if (!view.editing) moveTo(avatar.position.x + delta[0]!, avatar.position.z + delta[1]!);
    }, { signal });
    function resize() {
      if (disposed) return;
      const width = Math.max(1, canvas.clientWidth); const height = Math.max(1, canvas.clientHeight); const aspect = width / height;
      renderer.setPixelRatio(Math.min(options.dpr ?? devicePixelRatio, QUALITY[quality].dpr)); renderer.setSize(width, height, false);
      const half = Math.max(terrain.size * 0.52, terrain.size * 0.67 / aspect);
      if (camera instanceof OrthographicCamera) Object.assign(camera, { left: -half * aspect, right: half * aspect, top: half, bottom: -half }); else camera.aspect = aspect;
      camera.updateProjectionMatrix(); bloom.resize(width, height, renderer.getPixelRatio()); invalidate();
    }
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    const intersection = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? true; wake(); }) : null; intersection?.observe(canvas);
    const controlsChanged = () => invalidate(); controls.addEventListener('change', controlsChanged);
    const controlsEnded = () => { if (camera instanceof OrthographicCamera) options.onCameraZoom?.(camera.zoom); };
    controls.addEventListener('end', controlsEnded);
    const loop = createDemandLoop(time => {
      loopCallbacks++; const delta = last ? Math.min((time - last) / 1000, 0.05) : 0; last = time;
      let moving = !view.editing && ((avatar.position.x - target.x) ** 2 + (avatar.position.z - target.z) ** 2) > 0.0004;
      if (moving) {
        avatar.rotation.y = Math.atan2(target.x - avatar.position.x, target.z - avatar.position.z);
        avatar.position.lerp(target, Math.min(1, settings.moveSpeed * delta / avatar.position.distanceTo(target)));
        avatar.position.y = terrainHeight(terrain, avatar.position.x, avatar.position.z);
        for (let i = 0; i < feet.length; i++) feet[i]!.position.z = Math.sin(time * 0.012 + i * Math.PI) * 0.1 + 0.04;
        if (((avatar.position.x - target.x) ** 2 + (avatar.position.z - target.z) ** 2) <= 0.0004) {
          avatar.position.copy(target); avatar.position.y = terrainHeight(terrain, avatar.position.x, avatar.position.z); const next = route[++routeIndex];
          if (next) target.fromArray(next); else { for (const foot of feet) foot.position.z = 0.04; moving = false; movement.state = 'arrived'; }
        }
        sun.shadow.needsUpdate = true; needsRender = true;
      }
      if (cameraPreset === 'follow' && !view.editing) {
        const dx = avatar.position.x - controls.target.x; const dz = avatar.position.z - controls.target.z;
        camera.position.x += dx; camera.position.z += dz; controls.target.x += dx; controls.target.z += dz;
      }
      const markerActive = pathMarker.update(time, moving);
      const visitorsMoving = visitors.tick(delta); if (visitorsMoving) { sun.shadow.needsUpdate = true; needsRender = true; }
      const cameraChanged = controls.update(delta);
      avatarRuntime.update(moving, delta);
      const natureMoving = settings.natureMotion;
      environment.tick(delta, natureMoving, camera);
      const festiveBurst = festival.tick(delta, natureMoving);
      if (natureMoving) { shadowElapsed += delta; if (shadowElapsed >= 1 / 15) { sun.shadow.needsUpdate = true; shadowElapsed = 0; } }
      if (needsRender || cameraChanged || moving || markerActive || natureMoving || festiveBurst || frameWaiters.size) {
        try {
          if (batchesDirty) { batches.update(groups); batchesDirty = false; }
          renderer.info.reset(); profiler.begin(scene); const started = performance.now();
          if (settings.bloom) bloom.render(); else renderer.render(scene, camera);
          for (const shadow of retiredShadows) shadow.dispose(); retiredShadows.length = 0;
          latestFrame = { at: performance.now(), submitMs: performance.now() - started, stats: readRendererStats(renderer.info), ...profiler.end() };
          canvas.dataset['renderedFrames'] = String(++renderedFrames); needsRender = false;
          for (const waiter of frameWaiters) waiter.resolve(latestFrame); frameWaiters.clear();
        } catch (error) {
          failure = error instanceof Error ? error : new Error(String(error)); for (const waiter of frameWaiters) waiter.reject(failure); frameWaiters.clear(); loop.dispose(); options.onError?.(failure); return false;
        }
      }
      return cameraChanged || moving || markerActive || visitorsMoving || natureMoving || festiveBurst;
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
      unsubscribe(); observer.disconnect(); intersection?.disconnect(); controls.removeEventListener('change', controlsChanged); controls.removeEventListener('end', controlsEnded); controls.dispose();
      environment.dispose(); profiler.dispose(); bloom.dispose(); terrainRenderer.dispose(); pathMarker.dispose(); visitors.dispose(); festival.dispose(); avatarRuntime.dispose(); navigation.dispose(); batches.dispose(); assets.dispose(); sun.shadow.dispose();
      for (const shadow of retiredShadows) shadow.dispose(); retiredShadows.length = 0;
      renderer.dispose(); groups.clear();
    }
    cleanup = dispose; signal.addEventListener('abort', dispose, { once: true });
    function frame(): Promise<RoomFrame> {
      if (disposed || failure) return Promise.reject(failure ?? new DOMException('Room closed', 'AbortError'));
      return new Promise((resolve, reject) => { frameWaiters.add({ resolve, reject }); invalidate(); });
    }
    function setCamera(preset: RoomCamera) {
      if (disposed) return; finish(false); endStroke(false); cameraPreset = preset;
      controls.reset(); controls.target.set(preset === 'follow' ? avatar.position.x : 0, 0, preset === 'follow' ? avatar.position.z : 0);
      camera.position.fromArray(CAMERA[preset]).add(controls.target); camera.zoom = view.zoom; camera.updateProjectionMatrix(); controls.update(); invalidate();
    }
    function setQuality(next: RoomQuality) {
      if (disposed || !QUALITY[next]) return; quality = next;
      environment.update(terrain, quality, settings.weather); festival.layout(terrain.size, quality);
      if (sun.shadow.mapSize.x !== QUALITY[next].shadow) {
        // New shadow identity avoids common-renderer attachment caches retaining destroyed depth views.
        const previous = sun; sun = previous.clone(); sun.shadow.mapSize.setScalar(QUALITY[next].shadow);
        previous.removeFromParent(); scene.add(sun); retiredShadows.push(previous.shadow);
      }
      resize(); invalidate(true);
    }
    const engine = {
      dispose, frame, setCamera, setQuality, setAvatar: avatarRuntime.setStyle,
      setSettings(next: RoomSettings) {
        if (disposed) return;
        if (settings.projection !== next.projection) {
          const previous = camera;
          camera = next.projection === 'perspective' ? new PerspectiveCamera(42, 1, 0.1, 160) : new OrthographicCamera(-16, 16, 16, -16, 0.1, 160);
          camera.position.copy(previous.position); camera.quaternion.copy(previous.quaternion); camera.zoom = previous.zoom;
          controls.object = camera; bloom.camera(camera); resize();
        }
        settings = next; controls.enablePan = next.pan; controls.enableRotate = next.rotate; controls.enableDamping = next.damping;
        environment.update(terrain, quality, next.weather); bloom.update(next); festival.setEnabled(next.festive); invalidate();
      },
      setDiagnostics(enabled: boolean) { profiler.enable(enabled); invalidate(true); },
      setPeers(peers: RoomPeer[]) { if (visitors.update(peers)) invalidate(true); },
      moveCamera(action: 'left' | 'right' | 'up' | 'down' | 'rotateLeft' | 'rotateRight' | 'tiltUp' | 'tiltDown' | 'focus') {
        if (action === 'focus') { const delta = avatar.position.clone().sub(controls.target); camera.position.add(delta); controls.target.copy(avatar.position); }
        else if (action === 'rotateLeft' || action === 'rotateRight') {
          const offset = camera.position.clone().sub(controls.target).applyAxisAngle(new Vector3(0, 1, 0), action === 'rotateLeft' ? -Math.PI / 8 : Math.PI / 8); camera.position.copy(controls.target).add(offset);
        } else if (action === 'tiltUp' || action === 'tiltDown') {
          const offset = camera.position.clone().sub(controls.target); const axis = new Vector3().crossVectors(offset, camera.up).normalize();
          offset.applyAxisAngle(axis, action === 'tiltUp' ? -0.12 : 0.12); camera.position.copy(controls.target).add(offset);
        } else {
          const right = new Vector3().setFromMatrixColumn(camera.matrix, 0); right.y = 0; right.normalize();
          const forward = new Vector3().crossVectors(new Vector3(0, 1, 0), right).normalize();
          const delta = action === 'left' || action === 'right' ? right.multiplyScalar(action === 'left' ? -1.5 : 1.5) : forward.multiplyScalar(action === 'up' ? 1.5 : -1.5);
          camera.position.add(delta); controls.target.add(delta);
        }
        controls.update(); invalidate();
      },
      goTo: moveTo,
      setLighting(next: RoomLighting) {
        if (disposed) return; lighting = next; sun.color.set(next === 'day' ? '#ffe5c3' : '#ffbf86'); sun.intensity = next === 'day' ? 2.8 : 1.4;
        fill.color.set(next === 'day' ? '#d7e8f0' : '#9eafdf'); fill.intensity = next === 'day' ? 2.1 : 0.95;
        scene.background = new Color(next === 'day' ? '#9fcfdf' : '#26304f'); festival.setLighting(next);
        environment.update(terrain, quality, settings.weather, next); invalidate(true);
      },
      diagnostics(): RoomDiagnostics {
        return { backend: backendName, adapter, renderedFrames, loopCallbacks, pendingFrame: loop.pending, objectCount: groups.size, visibleObjects: [...groups.values()].filter(group => group.visible).length, quality, lighting, dpr: renderer.getPixelRatio(), width: canvas.clientWidth, height: canvas.clientHeight, frame: latestFrame, avatarPosition: [avatar.position.x, avatar.position.y, avatar.position.z], avatar: avatarRuntime.diagnostics(), camera: { preset: cameraPreset, projection: settings.projection, position: camera.position.toArray(), target: controls.target.toArray(), zoom: camera.zoom }, movement: { ...movement }, bloom: { enabled: settings.bloom, strength: settings.bloomStrength, objects: [...groups.values()].filter(group => group.userData['glow'] > 0).length }, terrain: terrainRenderer.diagnostics(), environment: environment.diagnostics(), visitors: visitors.count(), festive: festival.diagnostics() };
      },
      projectPoint(position: [number, number, number]) { const point = new Vector3(...position).project(camera); return { x: (point.x + 1) * canvas.clientWidth / 2, y: (1 - point.y) * canvas.clientHeight / 2 }; },
      async capture(): Promise<Blob> { await frame(); return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('이미지를 만들 수 없습니다.')), 'image/png')); },
      async exportGlb(): Promise<ArrayBuffer> {
        const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
        if (disposed) throw new Error('방이 닫혔습니다. 다시 열고 내보내기해 주세요.'); finish(false); project();
        const exported = new Scene(); const avatarCopy = cloneSkeleton(avatar);
        exported.add(room.clone(true), terrainRenderer.root.clone(true), avatarCopy); for (const group of groups.values()) if (group.visible) exported.add(group.clone(true));
        try {
          const result = await new GLTFExporter().parseAsync(exported, { binary: true }); if (!(result instanceof ArrayBuffer)) throw new Error('GLB 내보내기에 실패했습니다.'); return result;
        } finally {
          const skeletons = new Set<SkinnedMesh['skeleton']>();
          avatarCopy.traverse(object => { if (object instanceof SkinnedMesh) skeletons.add(object.skeleton); });
          for (const skeleton of skeletons) skeleton.dispose();
        }
      },
      update(next: RoomView) {
        if (disposed) return;
        if (next.editing !== view.editing || next.editor?.tool !== view.editor?.tool) { finish(false); endStroke(false); target.copy(avatar.position); pathMarker.hide(); options.onNotice?.(''); for (const foot of feet) foot.position.z = 0.04; }
        if (next.terrain && next.terrain !== terrain) {
          const resized = next.terrain.size !== terrain.size; endStroke(false); terrain = next.terrain;
          if (resized) {
            navigation.dispose(); navigation = createNavigation(terrain.size);
            void navigation.init(); resize();
            const extent = terrain.size / 2 + 7;
            Object.assign(sun.shadow.camera, { left: -extent, right: extent, top: extent, bottom: -extent }); sun.shadow.camera.updateProjectionMatrix();
          }
          terrainRenderer.update(terrain); environment.update(terrain, quality, settings.weather);
          if (!festival.layout(terrain.size, quality)) festival.refreshGround();
          rebuildNavigation(); invalidate(true);
        }
        if (next.zoom !== view.zoom) { camera.zoom = next.zoom; camera.updateProjectionMatrix(); }
        view = next; terrainRenderer.setGrid(next.editing && (next.editor ?? DEFAULT_EDITOR).grid);
        if (!next.editing) terrainRenderer.cursor(-1, 1);
        const palette = { peach: ['#ead3c6', '#e2a88e'], sage: ['#d5dfcb', '#b1bf97'], lavender: ['#dfd9ea', '#c2b0ce'] }[next.theme];
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
