import "reflect-metadata";
import { g as _ } from "./plugin-B5SoeI0c.js";
import { A, s as C, y as G, w as U, F as f, z as N, D as O, I as v, H as y, K as W, B as x, x as w, v as F, U as b, J as h, C as M, _ as z, X as H, $ as k, a0 as K, a1 as V, ac as j, ad as J, ae as q, a8 as X, af as $, ag as Q, ah as Y, ai as Z, aj as aa, ak as ea, al as ia, am as ta, an as ra, ao as sa, E as na, a as oa, b as la, t as ua, aq as da, ap as ca, G as _a, q as Ea, N as Ta, a6 as Sa, M as Ia, P as La, R as ma, j as Da, k as pa, l as Ba, m as ga, p as Ra, n as Pa, o as Aa, S as Ca, T as Ga, V as Ua, W as fa, O as Na, a4 as Oa, as as va, aa as ya, a3 as Wa, at as xa, ab as wa, a2 as Fa, Z as ba, Q as ha, c as Ma, d as za, h as Ha, ax as ka, a9 as Ka, ar as Va, aD as ja, az as Ja, e as qa, aE as Xa, Y as $a, au as Qa, a7 as Ya, L as Za, ay as ae, i as ee, av as ie, r as te, aA as re, aB as se, aF as ne, aw as oe, a5 as le, aC as ue, u as de, f as ce } from "./plugin-B5SoeI0c.js";
import { useMemo as E } from "react";
import { useFrame as T } from "@react-three/fiber";
import * as d from "three";
import { Q as Ee, S as Te, R as Se, O as Ie, L as Le, P as me, N as De, M as pe, I as Be, K as ge, H as Re, J as Pe, a as Ae, b as Ce, e as Ge, d as Ue, f as fe, n as Ne, o as Oe, c as ve, r as ye, g as We, h as xe, i as we, j as Fe, k as be, l as he, m as Me, F as ze, p as He, q as ke, s as Ke, u as Ve, t as je, v as Je, w as qe, x as Xe, y as $e, z as Qe, G as Ye, A as Ze, B as ai, C as ei, D as ii, E as ti } from "./index-DmHVuHAr.js";
import { H as t, P as o } from "./gaesupStore-x2iiDzsY.js";
import { C as si, H as ni, c as oi, l as li, v as ui, a as di } from "./loader-C3ZwumCe.js";
var S = Object.defineProperty, I = Object.getOwnPropertyDescriptor, r = (e, a, i, l) => {
  for (var n = I(a, i), u = e.length - 1, c; u >= 0; u--)
    (c = e[u]) && (n = c(a, i, n) || n);
  return n && S(a, i, n), n;
};
class s {
  static convertLegacyPosition(a) {
    return { x: a[0], y: a[1], z: a[2] };
  }
  static convertLegacyRotation(a) {
    return { x: a[0], y: a[1], z: a[2] };
  }
  static convertToLegacyPosition(a) {
    return [a.x, a.y, a.z];
  }
  static convertToLegacyRotation(a) {
    return [a.x, a.y, a.z];
  }
  static convertLegacyWall(a) {
    return {
      id: a.id || `wall-${Date.now()}`,
      position: this.convertLegacyPosition(a.position),
      rotation: this.convertLegacyRotation(a.rotation),
      wallGroupId: a.wall_parent_id || "default",
      width: 4,
      height: 4,
      depth: 0.5
    };
  }
  static convertLegacyTile(a) {
    return {
      id: a.id || `tile-${Date.now()}`,
      position: this.convertLegacyPosition(a.position),
      tileGroupId: a.tile_parent_id || "default",
      size: 4
    };
  }
  static convertLegacyMesh(a) {
    const i = {
      id: a.id || `mesh-${Date.now()}`,
      color: a.color || "#ffffff",
      material: a.material === "GLASS" ? "GLASS" : "STANDARD",
      roughness: a.roughness || 0.5,
      metalness: a.metalness || 0,
      opacity: a.opacity || 1,
      transparent: a.transparent || !1
    };
    return a.map_texture_url && (i.mapTextureUrl = a.map_texture_url), a.normal_texture_url && (i.normalTextureUrl = a.normal_texture_url), i;
  }
}
r([
  t(),
  o()
], s, "convertLegacyPosition");
r([
  t(),
  o()
], s, "convertLegacyRotation");
r([
  t()
], s, "convertToLegacyPosition");
r([
  t()
], s, "convertToLegacyRotation");
r([
  t(),
  o()
], s, "convertLegacyWall");
r([
  t(),
  o()
], s, "convertLegacyTile");
r([
  t(),
  o()
], s, "convertLegacyMesh");
function g() {
  const e = E(() => ({
    frustum: new d.Frustum(),
    matrix: new d.Matrix4(),
    camPos: new d.Vector3()
  }), []);
  return T((a, i) => {
    const l = a.camera;
    _().size() !== 0 && (e.matrix.multiplyMatrices(
      l.projectionMatrix,
      l.matrixWorldInverse
    ), e.frustum.setFromProjectionMatrix(e.matrix), e.camPos.copy(l.position), _().tick({
      elapsedTime: a.clock.elapsedTime,
      delta: i,
      cameraPosition: e.camPos,
      frustum: e.frustum
    }));
  }), null;
}
export {
  A as AnimationPanel,
  Ee as BUILDING_BASIC_OBJECT_OPTIONS,
  Te as BUILDING_FLAG_STYLE_OPTIONS,
  Se as BUILDING_PLACED_OBJECT_OPTIONS,
  Ie as BUILDING_TILE_OBJECT_OPTIONS,
  Le as BUILDING_TILE_PRESETS,
  me as BUILDING_TILE_SHAPE_OPTIONS,
  De as BUILDING_TREE_COLOR_PRESETS,
  pe as BUILDING_TREE_OPTIONS,
  Be as BUILDING_WALL_KIND_OPTIONS,
  ge as BUILDING_WALL_PRESETS,
  Re as BUILDING_WEATHER_EFFECT_OPTIONS,
  C as Billboard,
  G as BlockSystem,
  s as BuildingBridge,
  U as BuildingController,
  f as BuildingGpuCullingDriver,
  N as BuildingGpuMirrorDriver,
  O as BuildingGpuUploadDriver,
  v as BuildingIndirectArgsUploadDriver,
  y as BuildingIndirectDrawDriver,
  W as BuildingNavigationObstacleDriver,
  x as BuildingPanel,
  w as BuildingRenderStateDriver,
  F as BuildingSystem,
  b as BuildingUI,
  h as BuildingVisibilityDriver,
  si as CONTENT_SCHEMA_VERSION,
  M as CameraPanel,
  z as DEFAULT_BUILDING_GRID_EXTENSION_ID,
  H as DEFAULT_BUILDING_OBJECT_CATALOG,
  k as DEFAULT_BUILDING_PLACEMENT_EXTENSION_ID,
  K as DEFAULT_BUILDING_SAVE_EXTENSION_ID,
  V as DEFAULT_BUILDING_STORE_SERVICE_ID,
  j as DRAW_CLUSTER_BILLBOARD,
  J as DRAW_CLUSTER_BLOCK,
  q as DRAW_CLUSTER_COUNT,
  X as DRAW_CLUSTER_DESCRIPTORS,
  $ as DRAW_CLUSTER_FIRE,
  Q as DRAW_CLUSTER_FLAG,
  Y as DRAW_CLUSTER_GRASS,
  Z as DRAW_CLUSTER_MODEL,
  aa as DRAW_CLUSTER_SAKURA,
  ea as DRAW_CLUSTER_SAND,
  ia as DRAW_CLUSTER_SNOWFIELD,
  ta as DRAW_CLUSTER_TILE,
  ra as DRAW_CLUSTER_WALL,
  sa as DRAW_CLUSTER_WATER,
  na as EDITOR_PANEL_COMPONENT_KIND,
  oa as Editor,
  la as EditorLayout,
  Pe as FLAG_STYLE_META,
  ua as Fire,
  da as GPU_META_STRIDE,
  ca as GPU_SPATIAL_STRIDE,
  _a as GameplayEventPanel,
  Ea as Grass,
  g as GrassDriver,
  Ta as GridHelper,
  ni as HttpContentBundleSource,
  Sa as INDIRECT_DRAW_STRIDE,
  Ia as MotionPanel,
  La as PerformancePanel,
  ma as ResizablePanel,
  Da as Sakura,
  pa as SakuraBatch,
  Ba as Sand,
  ga as SandBatch,
  Ra as Snow,
  Pa as Snowfield,
  Aa as SnowfieldBatch,
  Ca as StudioPanel,
  Ga as TileSystem,
  Ua as VehiclePanel,
  fa as WallSystem,
  Na as Water,
  Oa as applyBuildingNavigationObstacles,
  Ae as blockToPlacementEntry,
  va as buildBuildingGpuMirror,
  ya as buildBuildingIndirectDrawMirror,
  Ce as buildingCellToWorld,
  Ge as buildingGridAdapter,
  Ue as buildingGroupsToPlacementEntries,
  fe as buildingPlacementAdapter,
  Wa as buildingPlugin,
  Ne as cellToTilePosition,
  Oe as createBlockFootprint,
  xa as createBuildingGpuUploadPlan,
  wa as createBuildingIndirectDrawUploadPlan,
  ve as createBuildingPlacementEngine,
  Fa as createBuildingPlugin,
  ba as createBuildingScopeId,
  oi as createContentBundleFromSaveSystem,
  ha as createCustomMeshId,
  Ma as createEditorCommandStack,
  za as createEditorShell,
  Ha as createEditorSlice,
  ka as createEmptyBuildingGpuUploadResources,
  Ka as createEmptyBuildingIndirectDrawMirror,
  Va as createEmptyGpuMirror,
  ja as createTerrainBlockMaterial,
  ye as createTileFootprint,
  Ja as destroyBuildingGpuUploadResources,
  We as edgeKey,
  xe as edgeSideToWallRotation,
  we as edgeToWallTransform,
  qa as editorSlice,
  Xa as findTerrainBlockMaterial,
  $a as getDefaultBuildingObject,
  Qa as getDrawClusterForSnapshotEntry,
  _ as getGrassManager,
  Ya as getIndirectInstanceCount,
  Fe as getTileSupportHeight,
  Za as getWallMaterialKey,
  ae as getWebGPUDeviceFromRenderer,
  be as hasTileCollision,
  he as hasWallCollision,
  Me as indexAabb,
  ee as isEditorPanelComponentExtension,
  li as loadContentBundleFromManifest,
  ze as normalizeQuarterTurnRotation,
  He as pair,
  ie as parseBuildingGpuVisibilityFlags,
  ke as queryAabbIds,
  te as resolveEditorPanelComponentExtensions,
  Ke as snapBuildingPosition,
  re as syncBuildingGpuBuffers,
  se as syncBuildingIndirectArgsBuffer,
  Ve as tileFootprintKeys,
  je as tileGroupToPlacementEntries,
  Je as tileHalfSize,
  qe as tileOverlaps,
  Xe as tilePositionToCell,
  $e as tileToPlacementEntry,
  Qe as unindexId,
  ne as useBuildingEditor,
  oe as useBuildingGpuCullingStore,
  le as useBuildingRenderStateStore,
  Ye as useBuildingStore,
  ue as useBuildingVisibilityStore,
  de as useEditor,
  ce as useEditorStore,
  ui as validateContentBundle,
  di as validateContentBundleManifest,
  Ze as wallGroupToPlacementEntries,
  ai as wallToPlacementEntry,
  ei as wallTransformToEdge,
  ii as worldToBuildingCell,
  ti as zigZag
};
