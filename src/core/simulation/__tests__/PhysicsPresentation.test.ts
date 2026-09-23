import type { RapierRigidBody } from '@react-three/rapier';
import { Group, Quaternion, Vector3 } from 'three';

import { PhysicsPresentation } from '../PhysicsPresentation';

test('visual interpolation preserves physics and works beneath translated, rotated, scaled parents', () => {
  const root = new Group(); root.position.set(7, 1, -3); root.rotation.y = 0.4; root.scale.setScalar(2);
  const parent = new Group(); const visual = new Group(); root.add(parent); parent.add(visual);
  const position = new Vector3(1, 2, 3); const rotation = new Quaternion();
  const body = { translation: () => position, rotation: () => rotation, isValid: () => true } as unknown as RapierRigidBody;
  const presentation = new PhysicsPresentation(); const off = presentation.register(body, visual);
  presentation.beforeStep(); position.set(3, 2, 3); rotation.setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 2);
  presentation.afterStep();
  // Rapier has already synchronized its render object to the current authoritative pose.
  parent.position.copy(root.worldToLocal(position.clone()));
  parent.quaternion.copy(root.getWorldQuaternion(new Quaternion()).invert()).multiply(rotation);
  presentation.present(0.25);
  expect(visual.getWorldPosition(new Vector3()).distanceTo(new Vector3(1.5, 2, 3))).toBeLessThan(1e-10);
  expect(visual.getWorldQuaternion(new Quaternion()).angleTo(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), Math.PI / 8))).toBeLessThan(1e-7);
  expect(position.toArray()).toEqual([3, 2, 3]);
  // A teleport before the next step starts a new interpolation interval, without a long visual trail.
  position.set(50, 2, 3); presentation.beforeStep(); presentation.afterStep();
  parent.position.copy(root.worldToLocal(position.clone())); presentation.present(0);
  expect(visual.getWorldPosition(new Vector3()).distanceTo(position)).toBeLessThan(1e-10);
  off(); expect(visual.position.lengthSq()).toBe(0); expect(visual.quaternion.equals(new Quaternion())).toBe(true);
  presentation.present(0); expect(visual.position.lengthSq()).toBe(0);
});

test('removed Rapier bodies are never read during deferred renderer cleanup', () => {
  let valid = true; const read = jest.fn(() => ({ x: 0, y: 0, z: 0, w: 1 }));
  const body = { translation: read, rotation: read, isValid: () => valid } as unknown as RapierRigidBody;
  const visual = new Group(); new Group().add(visual);
  const presentation = new PhysicsPresentation(); presentation.register(body, visual);
  presentation.beforeStep(); presentation.afterStep(); valid = false; read.mockClear();
  presentation.beforeStep(); presentation.afterStep(); presentation.present(0.5); expect(read).not.toHaveBeenCalled();
});
