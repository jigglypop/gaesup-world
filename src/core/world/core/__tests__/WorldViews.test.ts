/** @jest-environment jsdom */
import * as THREE from 'three';

import { WorldViews } from '../WorldViews';

test('focused canvas selects its view; suspension removes listeners and duplicate cleanup preserves the live owner', () => {
  const views = new WorldViews(); const a = document.createElement('canvas'); const b = document.createElement('canvas');
  const va = { camera: new THREE.PerspectiveCamera(), scene: new THREE.Scene(), surface: a };
  const vb = { camera: new THREE.PerspectiveCamera(), scene: new THREE.Scene(), surface: b };
  const add = jest.spyOn(a, 'addEventListener'); const remove = jest.spyOn(a, 'removeEventListener');
  const offA = views.register(va); const offB = views.register(vb);
  expect(views.current()).toBe(vb); a.dispatchEvent(new Event('pointerdown')); expect(views.current()).toBe(va);
  views.suspend(); expect(views.current()).toBeNull(); expect(remove).toHaveBeenCalledTimes(2);
  b.dispatchEvent(new Event('focusin')); views.resume(); expect(views.current()).toBe(va); expect(add).toHaveBeenCalledTimes(4);
  offA(); const newA = views.register(va); offA(); expect(views.current()).toBe(va);
  newA(); expect(views.current()).toBe(vb); offB(); expect(views.current()).toBeNull(); views.dispose();
});
