import type { RapierRigidBody } from '@react-three/rapier';

import { applyEnabledRotations, applyGravityScale, applyLinearDamping } from '../bodySettings';

function createBody() {
  return {
    setLinearDamping: jest.fn(),
    setEnabledRotations: jest.fn(),
    setGravityScale: jest.fn(),
  };
}

test('mode settings reach Rapier only when the value changes', () => {
  const mock = createBody();
  const body = mock as unknown as RapierRigidBody;
  for (let i = 0; i < 60; i++) {
    applyLinearDamping(body, 0.9);
    applyEnabledRotations(body, false, false, false);
    applyGravityScale(body, 1);
  }
  expect(mock.setLinearDamping).toHaveBeenCalledTimes(1);
  expect(mock.setEnabledRotations).toHaveBeenCalledTimes(1);
  expect(mock.setGravityScale).toHaveBeenCalledWith(1, false);
  expect(mock.setGravityScale).toHaveBeenCalledTimes(1);

  applyLinearDamping(body, 0.2);
  applyEnabledRotations(body, false, true, false);
  applyGravityScale(body, 1.5);
  expect(mock.setLinearDamping).toHaveBeenLastCalledWith(0.2);
  expect(mock.setEnabledRotations).toHaveBeenLastCalledWith(false, true, false, false);
  expect(mock.setGravityScale).toHaveBeenLastCalledWith(1.5, false);
});

test('each body keeps its own applied values', () => {
  const a = createBody();
  const b = createBody();
  applyLinearDamping(a as unknown as RapierRigidBody, 0.9);
  applyLinearDamping(b as unknown as RapierRigidBody, 0.9);
  expect(a.setLinearDamping).toHaveBeenCalledTimes(1);
  expect(b.setLinearDamping).toHaveBeenCalledTimes(1);
});
