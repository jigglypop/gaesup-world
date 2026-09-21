import { BufferGeometry, Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, RingGeometry, Vector3, type Scene } from 'three';

import type { Waypoint } from 'gaesup-world/navigation';

export function createRoomPath(scene: Scene) {
  const root = new Group(); root.name = '이동 목적지'; root.visible = false; scene.add(root);
  const material = new MeshBasicMaterial({ color: '#fff5a0', transparent: true, opacity: 0.95, depthWrite: false });
  const geometry = new RingGeometry(0.28, 0.37, 48); const ring = new Mesh(geometry, material); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.07; root.add(ring);
  const inner = new Mesh(new RingGeometry(0.07, 0.12, 24), material); inner.rotation.x = -Math.PI / 2; inner.position.y = 0.08; root.add(inner);
  const lineGeometry = new BufferGeometry(); const lineMaterial = new LineBasicMaterial({ color: '#fff4b0', transparent: true, opacity: 0.8, depthWrite: false });
  const line = new Line(lineGeometry, lineMaterial); line.name = '이동 경로'; line.visible = false; scene.add(line);
  let until = 0;
  return {
    show(destination: Vector3, path: Waypoint[], blocked: boolean) {
      root.position.set(destination.x, 0, destination.z); root.visible = true; material.color.set(blocked ? '#ed6e70' : '#fff5a0');
      line.geometry.setFromPoints(path.map(point => new Vector3(point[0], 0.065, point[2]))); line.visible = path.length > 1 && !blocked;
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
