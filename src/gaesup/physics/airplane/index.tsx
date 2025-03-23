import { calcType } from '../type';
import { quat, vec3 } from '@react-three/rapier';
import { V3 } from '../../utils/vector';

export function gravity(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
  } = prop;
  rigidBodyRef.current.setGravityScale(
    activeState.position.y < 10 ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1 : 0.1,
    false,
  );
}

export function direction(prop: calcType) {
  const {
    innerGroupRef,
    worldContext: { activeState, control },
    controllerContext: { airplane },
    matchSizes,
  } = prop;
  const { forward, backward, leftward, rightward, shift, space } = control;
  const { angleDelta, maxAngle, accelRatio } = airplane;
  if (!matchSizes || !matchSizes['airplaneUrl']) return null;

  let boost = 0;

  boost = space ? Number(shift) : Number(shift) * accelRatio;

  const upDown = Number(backward) - Number(forward);
  const leftRight = Number(rightward) - Number(leftward);
  const front = V3().set(boost, boost, boost);

  activeState.euler.y += -leftRight * angleDelta.y;

  const X = maxAngle.x * upDown;
  const Z = maxAngle.z * leftRight;

  const _x = innerGroupRef.current.rotation.x;
  const _z = innerGroupRef.current.rotation.z;

  const maxX = maxAngle.x;
  const maxZ = maxAngle.z;

  const innerGrounRefRotation = innerGroupRef.current.clone();

  if (_x < -maxX) {
    innerGrounRefRotation.rotation.x = -maxX + X;
  } else if (_x > maxX) {
    innerGrounRefRotation.rotation.x = maxX + X;
  } else {
    innerGrounRefRotation.rotateX(X);
  }

  if (_z < -maxZ) innerGrounRefRotation.rotation.z = -maxZ + Z;
  else if (_z > maxZ) innerGrounRefRotation.rotation.z = maxZ + Z;
  else innerGrounRefRotation.rotateZ(Z);
  activeState.euler.x = innerGrounRefRotation.rotation.x;
  activeState.euler.z = innerGrounRefRotation.rotation.z;

  innerGrounRefRotation.rotation.y = 0;
  innerGroupRef.current.setRotationFromQuaternion(
    quat()
      .setFromEuler(innerGroupRef.current.rotation.clone())
      .slerp(quat().setFromEuler(innerGrounRefRotation.rotation.clone()), 0.2),
  );

  activeState.rotation = innerGrounRefRotation.rotation;
  activeState.direction = front.multiply(
    V3(Math.sin(activeState.euler.y), -upDown, Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

export function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    dispatch,
  } = prop;

  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());

  const _euler = activeState.euler.clone();
  _euler.x = 0;
  _euler.z = 0;
  rigidBodyRef.current.setRotation(quat().setFromEuler(_euler), true);

  dispatch({
    type: 'update',
    payload: {
      activeState: {
        ...activeState,
      },
    },
  });
}

export function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { activeState },
    controllerContext: { airplane },
  } = prop;
  const { maxSpeed } = airplane;
  const velocity = rigidBodyRef.current.linvel();
  // a = v / t (t = 1) (approximate calculation)
  const V = vec3(velocity).length();
  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    // impulse = mass * velocity
    rigidBodyRef.current.applyImpulse(
      vec3({
        x: activeState.direction.x,
        y: activeState.direction.y,
        z: activeState.direction.z,
      }).multiplyScalar(M),
      false,
    );
  }
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

export function damping(prop: calcType) {
  const {
    rigidBodyRef,
    controllerContext: { airplane },
  } = prop;
  const { linearDamping } = airplane;
  rigidBodyRef.current.setLinearDamping(linearDamping);
}

export default function airplaneCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  damping(calcProp);
  gravity(calcProp);
  landing(calcProp);
  innerCalc(calcProp);
}
