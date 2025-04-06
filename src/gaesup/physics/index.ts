import { useFrame } from '@react-three/fiber';
import { useContext, useEffect, useMemo } from 'react';
import { quat, vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import { GaesupControllerContext } from '../controller/context';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import { V3 } from '../utils/vector';
import { calcType } from './type';
import { calculateDirection } from './direction';

export default function calculation({
  groundRay,
  rigidBodyRef,
  outerGroupRef,
  innerGroupRef,
  colliderRef,
}) {
  const worldContext = useContext(GaesupWorldContext);
  const controllerContext = useContext(GaesupControllerContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const { mode, activeState, block } = worldContext;
  const { getSizesByUrls } = useGaesupGltf();
  // 매치 사이즈 캐싱
  const matchSizes = useMemo(() => getSizesByUrls(worldContext?.urls), [worldContext?.urls]);
  // 초기화 설정
  useEffect(() => {
    if (!rigidBodyRef || !innerGroupRef) return;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      rigidBodyRef.current.setTranslation(activeState.position.clone().add(V3(0, 5, 0)), true);
    }
  }, [mode.type]);
  // 블록 컨트롤 처리
  useEffect(() => {
    if (rigidBodyRef?.current && block.control) {
      rigidBodyRef.current.resetForces(false);
      rigidBodyRef.current.resetTorques(false);
    }
  }, [block.control, rigidBodyRef.current]);
  // 매 프레임 물리 계산
  useFrame((state, delta) => {
    if (!rigidBodyRef?.current || !outerGroupRef?.current || !innerGroupRef?.current) return null;
    if (block.control) return null;
    const calcProp: calcType = {
      rigidBodyRef,
      outerGroupRef,
      innerGroupRef,
      colliderRef,
      groundRay,
      state,
      delta,
      worldContext,
      controllerContext,
      dispatch,
      matchSizes,
    };
    entityCalculation(calcProp);
    checkEntityStates(calcProp);
  });
}

const entityCalculation = (prop: calcType) => {
  const { worldContext } = prop;
  const { mode } = worldContext;
  // 1. 방향 계산
  calculateDirection(prop);
  // 2. 충격량 적용
  applyImpulse(prop);
  // 3. 엔티티별 특수 처리
  switch (mode.type) {
    case 'character':
      handleCharacterPhysics(prop);
      break;
    case 'vehicle':
      handleVehiclePhysics(prop);
      break;
    case 'airplane':
      handleAirplanePhysics(prop);
      break;
  }
  // 4. 상태 업데이트
  updateState(prop);
};

// 2. 충격량 적용
function applyImpulse(prop: calcType) {
  const { worldContext, rigidBodyRef } = prop;
  const { mode } = worldContext;
  if (!rigidBodyRef?.current) return;
  switch (mode.type) {
    case 'character':
      applyCharacterImpulse(prop);
      break;
    case 'vehicle':
      applyVehicleImpulse(prop);
      break;
    case 'airplane':
      applyAirplaneImpulse(prop);
      break;
  }
}

// 캐릭터 충격량 적용
function applyCharacterImpulse(prop: calcType) {
  const { worldContext, rigidBodyRef } = prop;
  const { activeState, states } = worldContext;
  const { character } = prop.controllerContext;
  const { walkSpeed, runSpeed, jumpSpeed } = character;

  const impulse = vec3();

  // 점프
  if (states.isJumping && states.isOnTheGround) {
    impulse.setY(jumpSpeed * rigidBodyRef.current.mass());
  }
  if (states.isMoving) {
    const speed = states.isRunning ? runSpeed : walkSpeed;
    const velocity = vec3().addScalar(speed).multiply(activeState.dir.clone().normalize().negate());
    const M = rigidBodyRef.current.mass();
    const A = velocity.clone().sub(activeState.velocity);
    const F = A.multiplyScalar(M);
    impulse.setX(F.x);
    impulse.setZ(F.z);
  }
  rigidBodyRef.current.applyImpulse(impulse, true);
}

// 차량 충격량 적용
function applyVehicleImpulse(prop: calcType) {
  const { worldContext, controllerContext, rigidBodyRef } = prop;
  const { activeState, control } = worldContext;
  const { shift } = control;
  const { vehicle } = controllerContext;
  const { maxSpeed, accelRatio } = vehicle;

  const velocity = rigidBodyRef.current.linvel();
  const V = vec3(velocity).length();

  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
    let speed = shift ? accelRatio : 1;

    rigidBodyRef.current.applyImpulse(
      vec3().addScalar(speed).multiply(activeState.dir.clone().normalize()).multiplyScalar(M),
      false,
    );
  }
}

// 비행기 충격량 적용
function applyAirplaneImpulse(prop: calcType) {
  const { worldContext, controllerContext, rigidBodyRef } = prop;
  const { activeState } = worldContext;
  const { airplane } = controllerContext;
  const { maxSpeed } = airplane;

  const velocity = rigidBodyRef.current.linvel();
  const V = vec3(velocity).length();

  if (V < maxSpeed) {
    const M = rigidBodyRef.current.mass();
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

// 캐릭터 물리 처리
function handleCharacterPhysics(prop: calcType) {
  const { worldContext, rigidBodyRef, innerGroupRef, delta } = prop;
  const { states, activeState } = worldContext;
  const { character } = prop.controllerContext;
  const { linearDamping } = character;

  // 댐핑 설정
  if (states.isJumping || rigidBodyRef.current.linvel().y < 0) {
    rigidBodyRef.current.setLinearDamping(linearDamping);
  } else {
    rigidBodyRef.current.setLinearDamping(states.isNotMoving ? linearDamping * 5 : linearDamping);
  }

  // 회전 제한
  rigidBodyRef.current.setEnabledRotations(false, false, false, false);

  // 내부 그룹 회전
  innerGroupRef.current.quaternion.rotateTowards(
    quat().setFromEuler(activeState.euler),
    10 * delta,
  );

  // 클리커 관련 로직은 handleClickerQueue 함수에서 처리
  handleClickerQueue(prop);
}

// 클리커 큐 처리
function handleClickerQueue(prop: calcType) {
  const { worldContext, rigidBodyRef, state } = prop;
  const { control, clicker, mode, clickerOption } = worldContext;

  // S 키로 정지
  if (control.keyS && mode.controller === 'clicker') {
    clicker.isOn = false;
    clicker.isRun = false;
    return;
  }

  // clicker 모드 아님
  if (mode.controller !== 'clicker') return;

  const u = vec3(rigidBodyRef.current?.translation());
  let norm = calcNorm(u, clicker.point, false);

  // 자동 시작
  if (clickerOption.autoStart && clickerOption.queue[0] instanceof THREE.Vector3) {
    clicker.isOn = true;
    norm = calcNorm(u, clickerOption.queue[0], false);
    const v = vec3(clickerOption.queue[0]);
    clicker.angle = Math.atan2(v.z - u.z, v.x - u.x);
  }

  // 목적지 도달
  if (norm < 1) {
    if (clickerOption.track && clickerOption.queue.length !== 0) {
      const Q = clickerOption.queue.shift();
      if (Q instanceof THREE.Vector3) {
        clicker.point = Q;
        const v = vec3(clicker.point);
        clicker.angle = Math.atan2(v.z - u.z, v.x - u.x);
      } else {
        const { action, beforeCB, afterCB, time } = Q;
        if (action === 'stop') {
          state.clock.stop();
          beforeCB(state);
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

// 차량 물리 처리
function handleVehiclePhysics(prop: calcType) {
  const { worldContext, controllerContext, rigidBodyRef } = prop;
  const { control, states, rideable, mode } = worldContext;
  const { vehicle } = controllerContext;
  const { brakeRatio, linearDamping } = vehicle;
  const { space } = control;

  rigidBodyRef.current.setLinearDamping(space ? brakeRatio : linearDamping);

  // 내부 위치 및 상태 업데이트
  handleEntityLanding(prop);
}

// 비행기 물리 처리
function handleAirplanePhysics(prop: calcType) {
  const { worldContext, controllerContext, rigidBodyRef } = prop;
  const { activeState } = worldContext;
  const { airplane } = controllerContext;
  const { linearDamping } = airplane;

  rigidBodyRef.current.setLinearDamping(linearDamping);

  // 중력 스케일
  rigidBodyRef.current.setGravityScale(
    activeState.position.y < 10 ? ((1 - 0.1) / (0 - 10)) * activeState.position.y + 1 : 0.1,
    false,
  );

  // 회전 제한
  const _euler = activeState.euler.clone();
  _euler.x = 0;
  _euler.z = 0;
  rigidBodyRef.current.setRotation(quat().setFromEuler(_euler), true);

  // 내부 위치 및 상태 업데이트
  handleEntityLanding(prop);
}

// 엔티티 하차 처리
function handleEntityLanding(prop: calcType) {
  const { worldContext, dispatch } = prop;
  const { states, rideable, mode } = worldContext;
  const { isRiding } = states;

  if (isRiding) {
    rideable.objectType = null;
    rideable.key = null;
    mode.type = 'character';
    states.isRiding = false;
    states.enableRiding = false;
    dispatch({
      type: 'update',
      payload: {
        mode: { ...mode },
        rideable: { ...rideable },
      },
    });
  }
}

// 상태 업데이트
function updateState(prop: calcType) {
  const { worldContext, rigidBodyRef, dispatch } = prop;
  const { activeState } = worldContext;
  if (rigidBodyRef?.current) {
    activeState.position = vec3(rigidBodyRef.current.translation());
    activeState.velocity = vec3(rigidBodyRef.current.linvel());
    dispatch({
      type: 'update',
      payload: {
        activeState: { ...activeState },
      },
    });
  }
}

// 엔티티 상태 체크
function checkEntityStates(prop: calcType) {
  const { worldContext, colliderRef, groundRay, outerGroupRef } = prop;
  const { states, activeState, mode, control, clicker, clickerOption } = worldContext;

  // 1. 지면 체크
  if (groundRay) {
    groundRay.origin.addVectors(activeState.position, vec3(groundRay.offset));
    if (!groundRay.hit || !groundRay.rayCast || !colliderRef?.current) {
      states.isOnTheGround = false;
    }
    if (groundRay.hit) {
      const MAX = groundRay.length * 2;
      const MIN = groundRay.length * 0.8;
      const toi = groundRay.hit.toi;

      if (toi >= MAX) {
        states.isFalling = true;
        states.isOnTheGround = false;
      } else if (MIN <= toi && toi < MAX) {
        states.isFalling = true;
      } else if (toi < MIN) {
        states.isFalling = false;
        states.isOnTheGround = true;
      }
    }
  }

  // clicker 모드
  if (mode.controller === 'clicker') {
    states.isMoving = clicker.isOn;
    states.isNotMoving = !clicker.isOn;
    states.isRunning = (control.shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
    states.isJumping = control.space;
  }

  // 회전 여부
  if (states.isMoving && outerGroupRef?.current) {
    states.isRotated =
      Math.sin(outerGroupRef.current.rotation.y).toFixed(3) ===
      Math.sin(activeState.euler.y).toFixed(3);
  }

  // 누르고 있는 키 상태
  Object.keys(control).forEach((key) => {
    states.isPush[key] = control[key];
  });

  // 탑승/하차
  if (states.isRiderOn && states.isPush['keyR']) {
    states.isRiding = true;
  }
}

// 거리 계산 유틸
function calcNorm(u: THREE.Vector3, v: THREE.Vector3, calcZ: boolean): number {
  return Math.sqrt(
    Math.pow(u.x - v.x, 2) + (calcZ ? Math.pow(u.y - v.y, 2) : 0) + Math.pow(u.z - v.z, 2),
  );
}
