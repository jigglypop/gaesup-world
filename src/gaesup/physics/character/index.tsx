import { V3, calcAngleByVector } from '../../utils/vector';
import { gaesupWorldContextType } from '../../world/context/type';
import { quat, vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import { calcNorm } from '../../utils';
import { calcType } from '../type';

export function stop(prop: calcType) {
  const {
    worldContext: { control, clicker, mode },
  } = prop;
  const { keyS } = control;

  if (keyS && mode.controller === 'clicker') {
    clicker.isOn = false;
    clicker.isRun = false;
  }
}

export function queue(prop: calcType) {
  const {
    rigidBodyRef,
    state,
    worldContext: { clicker, mode, clickerOption, block },
  } = prop;
  const u = vec3(rigidBodyRef.current?.translation());

  let norm = calcNorm(u, clicker.point, false);
  if (clickerOption.autoStart) {
    if (clickerOption.queue[0] instanceof THREE.Vector3) {
      clicker.isOn = true;
      norm = calcNorm(u, clickerOption.queue[0], false);
      const v = vec3(clickerOption.queue[0]);
      const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
      clicker.angle = newAngle;
    }
  }
  if (norm < 1 && mode.controller === 'clicker') {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        clicker.point = Q;
        const v = vec3(clicker.point);
        const newAngle = Math.atan2(v.z - u.z, v.x - u.x);
        clicker.angle = newAngle;
      } else {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === 'stop') {
          state.clock.stop();
          beforeCB(state);
          console.log();
          setTimeout(() => {
            state.clock.start();
            afterCB(state);
          }, time);
        }
      }
      if (clickerOption.loop) {
        clickerOption.queue.push(Q);
      }
    } else {
      clicker.isOn = false;
      clicker.isRun = false;
    }
  }
}

export function innerCalc(prop: calcType) {
  const {
    rigidBodyRef,
    innerGroupRef,
    controllerContext: {
      character: { linearDamping },
    },
    worldContext: { activeState, states, block },
    delta,
  } = prop;

  if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
    rigidBodyRef.current.setLinearDamping(linearDamping);
  } else {
    rigidBodyRef.current.setLinearDamping(states.isNotMoving ? linearDamping * 5 : linearDamping);
  }
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);
  innerGroupRef.current.quaternion.rotateTowards(
    quat().setFromEuler(activeState.euler),
    10 * delta,
  );
}

export function impulse(prop: calcType) {
  const {
    rigidBodyRef,
    worldContext: { states, activeState },
  } = prop;
  const { isMoving, isRunning } = states;
  const {
    controllerContext: {
      character: { walkSpeed, runSpeed, jumpSpeed },
    },
  } = prop;
  const { isOnTheGround, isJumping } = states;
  const impulse = vec3();
  if (isJumping && isOnTheGround) {
    impulse.setY(jumpSpeed * rigidBodyRef.current.mass());
  }
  if (isMoving) {
    const speed = isRunning ? runSpeed : walkSpeed;
    const velocity = vec3().addScalar(speed).multiply(activeState.dir.clone().normalize().negate());
    const M = rigidBodyRef.current.mass();
    // a = v / t = dv / 1 (dt = 1)
    const A = velocity.clone().sub(activeState.velocity);
    const F = A.multiplyScalar(M);
    impulse.setX(F.x);
    impulse.setZ(F.z);
  }
  rigidBodyRef.current.applyImpulse(impulse, true);
  activeState.position = vec3(rigidBodyRef.current.translation());
  activeState.velocity = vec3(rigidBodyRef.current.linvel());
}

export function orbitDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  const dirX = Number(leftward) - Number(rightward);
  const dirZ = Number(forward) - Number(backward);
  let start = 0;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    start = 1;
  } else {
    if (dirX === 0 && dirZ === 0) return;
    activeState.euler.y += (dirX * Math.PI) / 32;
    start = dirZ;
  }
  const front = V3(start, 0, start);
  activeState.direction = front.multiply(
    V3(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y)),
  );
  activeState.dir = activeState.direction.normalize();
}

export function normalDirection({
  activeState,
  control,
  mode,
  clicker,
}: Partial<gaesupWorldContextType>) {
  const { forward, backward, leftward, rightward } = control;
  if (mode.controller === 'clicker') {
    activeState.euler.y = Math.PI / 2 - clicker.angle;
    activeState.dir.set(-Math.sin(activeState.euler.y), 0, -Math.cos(activeState.euler.y));
  } else {
    // 일반 컨트롤
    // right hand rule. north -> east -> south -> west
    const dirX = Number(leftward) - Number(rightward);
    const dirZ = Number(forward) - Number(backward);
    if (dirX === 0 && dirZ === 0) return;
    const dir = V3(dirX, 0, dirZ);
    const angle = calcAngleByVector(dir);
    activeState.euler.y = angle;
    activeState.dir.set(dirX, 0, dirZ);
  }
}

export function direction(prop: calcType) {
  const { worldContext } = prop;
  if (worldContext.mode.control === 'normal') {
    normalDirection(worldContext);
  } else if (worldContext.mode.control === 'orbit') {
    orbitDirection(worldContext);
  }
}

export default function characterCalculation(calcProp: calcType) {
  direction(calcProp);
  impulse(calcProp);
  innerCalc(calcProp);
  stop(calcProp);
  queue(calcProp);
}
