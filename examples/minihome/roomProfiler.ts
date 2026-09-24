import { InstancedMesh, type Camera, type Object3D, type Scene } from 'three';

import { readRendererStats, type RendererInfoSource } from 'gaesup-world';

import type { DrawCallRow } from './roomTypes';

/** Counts actual renderer increments, including shadow passes and instanced draws. */
export function createRoomProfiler(info: RendererInfoSource, getCamera: () => Camera) {
  let enabled = false; let capturing = false;
  const tracked = new Map<Object3D, () => void>(); const rows = new Map<string, DrawCallRow>();
  const stack: Array<{ object: Object3D; pass: 'scene' | 'shadow'; calls: number; triangles: number; nestedCalls: number; nestedTriangles: number }> = [];
  function before(object: Object3D, pass: 'scene' | 'shadow') {
    if (!capturing) return;
    const stats = readRendererStats(info); stack.push({ object, pass, calls: stats.drawCalls, triangles: stats.triangles, nestedCalls: 0, nestedTriangles: 0 });
  }
  function after(object: Object3D, pass: 'scene' | 'shadow') {
    if (!capturing) return;
    const entry = stack.pop(); if (!entry || entry.object !== object || entry.pass !== pass) { stack.length = 0; return; }
    const stats = readRendererStats(info); const totalCalls = stats.drawCalls - entry.calls; const totalTriangles = stats.triangles - entry.triangles;
    const parent = stack[stack.length - 1]; if (parent) { parent.nestedCalls += totalCalls; parent.nestedTriangles += totalTriangles; }
    const calls = totalCalls - entry.nestedCalls; const triangles = totalTriangles - entry.nestedTriangles;
    if (calls <= 0) return;
    const id = `${object.uuid}:${pass}`; const material = (object as Object3D & { material?: { name?: string; type?: string } }).material;
    const row = rows.get(id) ?? { id, name: object.name || object.parent?.name || object.type, pass, calls: 0, triangles: 0, instances: object instanceof InstancedMesh ? object.count : 1, material: material?.name || material?.type || '—' };
    row.calls += calls; row.triangles += triangles; rows.set(id, row);
  }
  function watch(root: Scene) {
    root.traverse(object => {
      if (tracked.has(object)) return;
      const { onBeforeRender, onAfterRender, onBeforeShadow, onAfterShadow } = object;
      object.onBeforeRender = function (...args) { onBeforeRender.apply(this, args); if (args[2] === getCamera()) before(this, 'scene'); };
      object.onAfterRender = function (...args) { if (args[2] === getCamera()) after(this, 'scene'); onAfterRender.apply(this, args); };
      object.onBeforeShadow = function (...args) { onBeforeShadow.apply(this, args); before(this, 'shadow'); };
      object.onAfterShadow = function (...args) { after(this, 'shadow'); onAfterShadow.apply(this, args); };
      tracked.set(object, () => Object.assign(object, { onBeforeRender, onAfterRender, onBeforeShadow, onAfterShadow }));
    });
    // Removed batches/avatars must not stay strongly retained by diagnostics.
    for (const [object, restore] of tracked) { let parent: Object3D | null = object; while (parent && parent !== root) parent = parent.parent; if (!parent) { restore(); tracked.delete(object); } }
  }
  return {
    enable(value: boolean) { enabled = value; if (!value) { for (const restore of tracked.values()) restore(); tracked.clear(); rows.clear(); } },
    begin(scene: Scene) { rows.clear(); stack.length = 0; capturing = enabled; if (enabled) watch(scene); },
    end() { capturing = false; const draws = [...rows.values()].sort((a, b) => b.calls - a.calls || b.triangles - a.triangles); return { draws, otherCalls: Math.max(0, readRendererStats(info).drawCalls - draws.reduce((sum, row) => sum + row.calls, 0)) }; },
    dispose() { for (const restore of tracked.values()) restore(); tracked.clear(); },
  };
}
