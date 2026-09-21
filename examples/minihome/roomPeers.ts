import { CanvasTexture, CapsuleGeometry, Group, Mesh, MeshStandardMaterial, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, Vector3, type Scene } from 'three';

import type { RoomPeer } from './roomVisitors';

export function createRoomPeers(scene: Scene) {
  const root = new Group(); root.name = '방문자'; scene.add(root);
  const bodyGeometry = new CapsuleGeometry(0.22, 0.45, 4, 8); const headGeometry = new SphereGeometry(0.24, 12, 8);
  const skin = new MeshStandardMaterial({ color: '#efc6a4', roughness: 0.9 });
  const peers = new Map<string, { group: Group; target: Vector3; body: MeshStandardMaterial; label: SpriteMaterial; name: string }>();
  let identity = '';
  function remove(id: string) { const peer = peers.get(id); if (!peer) return; peer.body.dispose(); peer.label.map?.dispose(); peer.label.dispose(); peer.group.removeFromParent(); peers.delete(id); }
  function labelTexture(name: string) {
    const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 64; const context = canvas.getContext('2d')!;
    context.fillStyle = '#f7fff3'; context.beginPath(); context.roundRect(2, 2, 252, 60, 16); context.fill(); context.fillStyle = '#254e3e'; context.font = '600 36px sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillText(name, 128, 32, 236);
    const texture = new CanvasTexture(canvas); texture.colorSpace = SRGBColorSpace; return texture;
  }
  return {
    update(values: RoomPeer[]) {
      const next = values.map(peer => `${peer.id}:${peer.name}:${peer.color}:${peer.position.join(',')}`).join('|');
      if (next === identity) return false; identity = next;
      const ids = new Set(values.map(peer => peer.id)); for (const id of peers.keys()) if (!ids.has(id)) remove(id);
      for (const value of values) {
        let peer = peers.get(value.id);
        if (!peer) {
          const group = new Group(); group.name = `방문자 · ${value.name}`;
          const body = new MeshStandardMaterial({ color: value.color, roughness: 0.85 }); const torso = new Mesh(bodyGeometry, body); torso.position.y = 0.57; torso.castShadow = true;
          const head = new Mesh(headGeometry, skin); head.position.y = 1.2; head.castShadow = true;
          const label = new SpriteMaterial({ map: labelTexture(value.name), depthTest: false, transparent: true, toneMapped: false }); const sprite = new Sprite(label); sprite.position.y = 1.8; sprite.scale.set(2, 0.5, 1);
          group.add(torso, head, sprite); group.position.fromArray(value.position); root.add(group);
          peer = { group, body, label, target: new Vector3(...value.position), name: value.name }; peers.set(value.id, peer);
        }
        peer.target.fromArray(value.position);
      }
      return true;
    },
    tick(delta: number) {
      let moving = false;
      for (const peer of peers.values()) if (peer.group.position.distanceToSquared(peer.target) > 0.0001) {
        peer.group.rotation.y = Math.atan2(peer.target.x - peer.group.position.x, peer.target.z - peer.group.position.z);
        peer.group.position.lerp(peer.target, 1 - Math.exp(-delta * 18)); if (peer.group.position.distanceToSquared(peer.target) <= 0.0001) peer.group.position.copy(peer.target); moving = true;
      }
      return moving;
    },
    count: () => peers.size,
    dispose() { for (const id of peers.keys()) remove(id); bodyGeometry.dispose(); headGeometry.dispose(); skin.dispose(); root.removeFromParent(); },
  };
}
