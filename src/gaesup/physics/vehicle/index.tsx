import { calcType } from '../type';
import { quat, vec3 } from '@react-three/rapier';
import { V3 } from '../../utils/vector';

export function normal(prop: calcType) {
  const {
    worldContext: { activeState, control },
  } = prop;
  const { forward, backward, leftward, rightward } = control;
  const xAxis = Number(leftward) - Number(rightward);
  const zAxis = Number(forward) - Number(backward);
  const front = vec3().set(zAxis, 0, zAxis);
  activeState.euler.y += xAxis * (Math.PI / 64);
  return front;
}

export function direction(prop: calcType) {
  const {
    worldContext: { mode, activeState },
  } = prop;
  const front = vec3();
  front.copy(normal(prop));
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), 0, Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

export function damping(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { control },
    controllerContext: { vehicle },
  } = prop;
  const { space } = control;
  const { brakeRatio, linearDamping } = vehicle;
  rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);
}

export function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState, control },
    controllerContext: { vehicle },
  } = prop;
  const { shift } = control;
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = shift ? accelRatio : 1;
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      vec3().addScalar(speed).multiply(activeState.dir.clone().normalize()).multiplyScalar(M),
      false,
    );
  }
}

export function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
  rigidBodyRef.current.setRotation(quat().setFromEuler(activeState.euler.clone()), false);
}

export function landing(prop: calcType) {
  const {
    worldContext: { states, rideable, mode },
    dispatch,
  } = prop;
  const { isRiding } = states;
  if (isRiding) {
    rideable.objectType = null;
    rideable.key = null;
    mode.type = 'character';
    states.isRiding = false;
    states.enableRiding = false;
  }

  dispatch({
    type: 'update',
    payload: {
      mode: {
        ...mode,
      },
      rideable: {
        ...rideable,
      },
    },
  });
}

export default function vehicleCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}
