import { DirectionalLight, Vector3 } from 'three';

import { placeShadowLight } from '../shadowFollow';

const offset = new Vector3(20, 30, 10);
const texel = 180 / 1024;

function place(x: number): DirectionalLight {
  const light = new DirectionalLight();
  placeShadowLight(light, new Vector3(x, 0, 0), offset, texel);
  return light;
}

test('the shadow box follows the focus in whole texels, with the light at target + offset', () => {
  const origin = place(0);
  expect(origin.position.clone().sub(origin.target.position).distanceTo(offset)).toBeLessThan(1e-9);
  // Sub-texel moves keep the map still; they are what makes a following shadow shimmer.
  expect(place(texel * 0.2).target.position.distanceTo(origin.target.position)).toBeLessThan(1e-9);
  const moved = place(30).target.position.clone().sub(origin.target.position);
  const direction = offset.clone().normalize();
  const right = new Vector3(0, 1, 0).cross(direction).normalize();
  const up = direction.clone().cross(right);
  for (const axis of [right, up]) {
    const texels = moved.dot(axis) / texel;
    expect(Math.abs(texels - Math.round(texels))).toBeLessThan(1e-6);
  }
});
