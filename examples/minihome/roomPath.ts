import { BufferGeometry, Float32BufferAttribute, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, RingGeometry, type Scene, type Vector3 } from 'three';

import type { Waypoint } from 'gaesup-world/navigation';

// Smoothed routes are short; a fixed buffer keeps every route's points instead of the first route's length.
const MAX_PATH_POINTS = 256;

export function createRoomPath(scene: Scene) {
  const root = new Group(); root.name = '이동 목적지'; root.visible = false; scene.add(root);
  const material = new MeshBasicMaterial({ color: '#fff5a0', transparent: true, opacity: 0.95, depthWrite: false });
  const geometry = new RingGeometry(0.28, 0.37, 48); const ring = new Mesh(geometry, material); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.07; root.add(ring);
  const inner = new Mesh(new RingGeometry(0.07, 0.12, 24), material); inner.rotation.x = -Math.PI / 2; inner.position.y = 0.08; root.add(inner);
  const points = new Float32BufferAttribute(new Float32Array(MAX_PATH_POINTS * 3), 3);
  const lineGeometry = new BufferGeometry().setAttribute('position', points); const lineMaterial = new LineBasicMaterial({ color: '#fff4b0', transparent: true, opacity: 0.8, depthWrite: false });
  const line = new Line(lineGeometry, lineMaterial); line.name = '이동 경로'; line.visible = false; line.frustumCulled = false; scene.add(line);
  let until = 0;
  return {
    show(destination: Vector3, path: Waypoint[], blocked: boolean) {
      root.position.copy(destination); root.visible = true; material.color.set(blocked ? '#ed6e70' : '#fff5a0');
      const count = Math.min(path.length, MAX_PATH_POINTS);
      for (let index = 0; index < count; index++) points.setXYZ(index, path[index]![0], path[index]![1] + 0.065, path[index]![2]);
      points.clearUpdateRanges(); points.addUpdateRange(0, count * 3); points.needsUpdate = true;
      lineGeometry.setDrawRange(0, count); line.visible = count > 1 && !blocked;
      until = performance.now() + (blocked ? 1600 : 900);
    },
    update(time: number, moving: boolean) {
      if (!root.visible) return false;
      if (moving) until = time + 700;
      const remaining = until - time;
      if (remaining <= 0) { root.visible = false; line.visible = false; return true; }
      ring.scale.setScalar(1 + Math.sin(time * 0.008) * 0.1); material.opacity = Math.min(0.95, remaining / 700);
      if (!moving) line.visible = false;
      return true;
    },
    hide() { root.visible = false; line.visible = false; },
    dispose() { geometry.dispose(); inner.geometry.dispose(); material.dispose(); lineGeometry.dispose(); lineMaterial.dispose(); root.removeFromParent(); line.removeFromParent(); },
  };
}
