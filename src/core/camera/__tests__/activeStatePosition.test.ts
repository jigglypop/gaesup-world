import { Euler, Quaternion, Vector3 } from 'three';

import type { ActiveStateType } from '../../motions/core/types';
import { activeStateUtils } from '../utils/camera';

test('cameras follow the presented position while a body is interpolated, else the physics position', () => {
  const state: ActiveStateType = {
    euler: new Euler(), position: new Vector3(1, 0, 0), quaternion: new Quaternion(), isGround: true,
    velocity: new Vector3(), direction: new Vector3(), dir: new Vector3(), angular: new Vector3(),
  };
  expect(activeStateUtils.getPosition(state)).toBe(state.position);
  state.presentedPosition = new Vector3(0.5, 0, 0);
  expect(activeStateUtils.getPosition(state)).toBe(state.presentedPosition);
});
