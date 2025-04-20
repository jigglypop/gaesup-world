import { useFrame } from '@react-three/fiber';
import { useContext, useEffect, useMemo, useRef } from 'react';
import { quat, vec3 } from '@react-three/rapier';
import * as THREE from 'three';
import { GaesupControllerContext } from '../controller/context';
import { GaesupWorldContext, GaesupWorldDispatchContext } from '../world/context';
import { useGaesupGltf } from '../hooks/useGaesupGltf';
import { V3, getTempVector, getTempVector2, calcNorm } from '../utils/vector';
import { calculateDirection } from './direction';
import { CalcType } from '../types';

// 재사용 가능한 벡터 객체들
const _tempVec3 = new THREE.Vector3();
const _tempVec3_2 = new THREE.Vector3();
const _tempVec3_3 = new THREE.Vector3();
const _tempVec3_4 = new THREE.Vector3();

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

  // 임시 벡터 객체 모음 (함수 내에서 재사용)
  const tempVectors = useRef({
    impulse: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
  });

  // 초기화 설정
  useEffect(() => {
    if (!rigidBodyRef || !innerGroupRef) return;
    if (rigidBodyRef.current && innerGroupRef.current) {
      rigidBodyRef.current.lockRotations(false, true);
      activeState.euler.set(0, 0, 0);
      // 새 객체 생성 대신 임시 벡터 사용
      _tempVec3.copy(activeState.position).add(V3(0, 5, 0));
      rigidBodyRef.current.setTranslation(_tempVec3, true);
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
    const calcProp: CalcType = {
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
      tempVectors: tempVectors.current,
    };
    entityCalculation(calcProp);
    checkEntityStates(calcProp);
  });
}

const entityCalculation = (prop: CalcType) => {
  const { worldContext } = prop;
  const { mode } = worldContext;
  calculateDirection(prop);
  applyImpulse(prop);
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
  updateState(prop);
};

const applyImpulse = (prop: CalcType) => {
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
};

// 캐릭터 충격량 적용
const applyCharacterImpulse = (prop: CalcType) => {
  const { worldContext, rigidBodyRef } = prop;
  const { activeState, states } = worldContext;
  const { character } = prop.controllerContext;
  const { walkSpeed, runSpeed, jumpSpeed } = character;
  const impulse = vec3();
  
  // 점프 처리 개선
  // 이중 점프 방지 및 안정적인 점프 처리
  if (states.isJumping && states.isOnTheGround) {
    // 캐릭터 질량에 비례하는 점프 충격량 계산
    const mass = rigidBodyRef.current.mass();
    const jumpMultiplier = 2.0; // 점프 강도 강화
    const jumpImpulse = jumpSpeed * mass * jumpMultiplier;
    
    // 시작 속도가 있는 경우 보정
    const currentVelY = activeState.velocity.y;
    const adjustedImpulse = currentVelY > 0 
      ? jumpImpulse + (currentVelY * mass * 0.5) // 이미 상승 중이면 추가 보정
      : jumpImpulse;
    
    // 세로축(Y) 충격량 설정
    impulse.setY(adjustedImpulse);
    
    // 즉시 지면 상태 업데이트하여 연속 점프 방지
    states.isOnTheGround = false;
    states.isFalling = false;
    
    // 로그 출력
    if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
      console.log('Jump executed!', { 
        impulse: adjustedImpulse, 
        mass, 
        baseSpeed: jumpSpeed, 
        currentVelY 
      });
    }
    
    // 상태에 점프 카운터 추가 (연속 점프 방지)
    if (!states._jumpCounter) {
      states._jumpCounter = 0;
    }
    states._jumpCounter++;
    
    // 점프 후 짧은 시간 동안 재점프 방지
    setTimeout(() => {
      if (states._jumpCounter > 0) {
        states._jumpCounter--;
      }
    }, 500); // 0.5초 후에 카운터 감소
  }
  
  // 이동 충격량 (지면에서와 공중에서 다른 처리)
  if (states.isMoving) {
    const speed = states.isRunning ? runSpeed : walkSpeed;
    const velocity = vec3().addScalar(speed).multiply(activeState.dir.clone().normalize().negate());
    const M = rigidBodyRef.current.mass();
    const A = velocity.clone().sub(activeState.velocity);
    
    // 공중에서는 이동 제어를 위한 계수
    const airControlFactor = states.isOnTheGround ? 1.0 : 0.3;
    
    // 가속도 계산 시 지면/공중 상태 고려
    const F = A.multiplyScalar(M * airControlFactor);
    
    // 수평 방향 충격량 적용
    impulse.setX(F.x);
    impulse.setZ(F.z);
  }
  
  // 충격량이 유효할 때만 적용
  if (impulse.length() > 0) {
    rigidBodyRef.current.applyImpulse(impulse, true);
    
    // 디버깅
    if (typeof window !== 'undefined' && 
        window.localStorage.getItem('debug') === 'true' && 
        (impulse.y > 0 || !states.isOnTheGround)) {
      console.log('Applied impulse:', impulse, 'OnGround:', states.isOnTheGround);
    }
  }
};

const applyVehicleImpulse = (prop: CalcType) => {
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
};
// 비행기 충격량 적용
const applyAirplaneImpulse = (prop: CalcType) => {
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
};
// 캐릭터 물리 처리
const handleCharacterPhysics = (prop: CalcType) => {
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
  
  // 중력 스케일 동적 설정
  const defaultGravity = 1.0;  // 기본 중력 스케일
  const fallingGravity = 1.5;  // 낙하 중 중력 스케일 (더 강하게)
  const jumpingGravity = 0.9;  // 점프 상승 중 중력 스케일 (약간 약하게)
  
  // 수직 속도 가져오기
  const verticalVelocity = rigidBodyRef.current.linvel().y;
  
  // 상태에 따른 중력 스케일 결정
  let gravityScale = defaultGravity;
  
  if (states.isJumping && verticalVelocity > 0) {
    // 점프 상승 중 - 약한 중력
    gravityScale = jumpingGravity;
  } else if (states.isFalling || verticalVelocity < -1.0) {
    // 낙하 중 - 강한 중력
    // 속도가 빠를수록 중력을 더 강하게 적용 (터미널 속도 효과)
    const fallingSpeed = Math.abs(verticalVelocity);
    const speedFactor = Math.min(fallingSpeed / 10, 1.0); // 최대 2배까지 증가
    gravityScale = fallingGravity + (speedFactor * 0.5);
  }
  
  // 디버깅 로그
  if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
    console.log('Physics state:', {
      gravity: gravityScale, 
      velocity: verticalVelocity,
      isJumping: states.isJumping,
      isFalling: states.isFalling,
      isOnGround: states.isOnTheGround
    });
  }
  
  // 중력 스케일 적용
  rigidBodyRef.current.setGravityScale(gravityScale, false);
  
  // 내부 그룹 회전 처리
  innerGroupRef.current.quaternion.rotateTowards(
    quat().setFromEuler(activeState.euler),
    10 * delta,
  );
  
  // 클리커 큐 처리
  handleClickerQueue(prop);
};

// 클리커 큐 처리
const handleClickerQueue = (prop: CalcType) => {
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
};

// 차량 물리 처리
function handleVehiclePhysics(prop: CalcType) {
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
function handleAirplanePhysics(prop: CalcType) {
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
function handleEntityLanding(prop: CalcType) {
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

// 상태 업데이트 (최적화 버전)
function updateState(prop: CalcType) {
  const { worldContext, rigidBodyRef, dispatch } = prop;
  const { activeState } = worldContext;
  if (!rigidBodyRef?.current) return;

  const newPos = rigidBodyRef.current.translation();
  const newVel = rigidBodyRef.current.linvel();

  // 임시 벡터 사용하여 거리 계산
  _tempVec3.set(
    newPos.x - activeState.position.x,
    newPos.y - activeState.position.y,
    newPos.z - activeState.position.z,
  );

  const distance = _tempVec3.length();
  if (distance < 0.05) {
    return;
  }

  // 벡터 복사로 새 객체 생성 피하기
  activeState.position.set(newPos.x, newPos.y, newPos.z);
  activeState.velocity.set(newVel.x, newVel.y, newVel.z);

  // 전역 상태 업데이트 (dispatch)
  dispatch({
    type: 'update',
    payload: {
      activeState: { ...activeState },
    },
  });
}

// 엔티티 상태 체크 (최적화 버전)
function checkEntityStates(prop: CalcType) {
  const { worldContext, colliderRef, groundRay, outerGroupRef, rigidBodyRef } = prop;
  const { states, activeState, mode, control, clicker, clickerOption } = worldContext;

  // 수직 속도로 기본 상태 업데이트 (레이캐스트 전에 기본 판단)
  const verticalVelocity = activeState.velocity.y;
  const isMovingDown = verticalVelocity < -0.1; // 약간의 여유를 둠
  
  // 수직 속도를 기준으로 기본 낙하 감지
  if (isMovingDown) {
    states.isFalling = true;
    
    // 낙하 속도가 크면 확실히 땅에 닿지 않음
    if (verticalVelocity < -3.0) {
      states.isOnTheGround = false;
    }
  }

  // 1. 지면 체크
  if (groundRay) {
    // 새 객체 생성 대신 직접 계산
    groundRay.origin.x = activeState.position.x + groundRay.offset.x;
    groundRay.origin.y = activeState.position.y + groundRay.offset.y;
    groundRay.origin.z = activeState.position.z + groundRay.offset.z;

    // 레이캐스트 상태 확인
    const isValidRay = groundRay.rayCast && colliderRef?.current;
    const hasValidHit = groundRay.hit && 
                        groundRay.hit.toi !== undefined && 
                        !isNaN(groundRay.hit.toi) && 
                        groundRay.hit.collider;
    
    // 지면 감지 히트 확인
    if (!isValidRay || !hasValidHit) {
      // 히트가 없거나 유효하지 않으면 지면에 없음
      // 내려가는 중이라면 isFalling을 true로 설정
      states.isOnTheGround = false;
      
      // 이미 위에서 수직 속도로 기본 판단을 했으므로 여기서는 생략 가능
    } else if (hasValidHit) {
      // 히트 거리 파라미터
      const MAX = groundRay.length * 2;
      const MIN = groundRay.length * 0.5; // 지면 감지 임계값
      const toi = groundRay.hit.toi;

      // 히스테리시스(hysteresis) 적용 - 상태 변화에 안정성 추가
      const BUFFER = 0.05; // 상태 전환 버퍼

      // 디버깅
      if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
        console.log('Ground check - TOI:', toi, 'MIN:', MIN, 'MAX:', MAX, 'isOnGround:', states.isOnTheGround);
      }

      // 거리에 따른 상태 결정
      if (toi >= MAX) {
        // 너무 멀리 있음 - 떨어지는 중, 지면 아님
        states.isFalling = true;
        states.isOnTheGround = false;
      } else if (MIN <= toi && toi < MAX) {
        // 중간 구간 - 지면에 가까워지는 중
        states.isFalling = true;
        
        // 현재 내려가는 중인지 확인
        if (activeState.velocity.y < 0) {
          // 내려가는 중일 때는 땅에 닿지 않은 것으로 처리
          states.isOnTheGround = false;
        } else if (states.isOnTheGround) {
          // 이미 지면에 있는 상태면 약간의 높이 변화는 허용 (안정성)
          if (toi > MAX - BUFFER) {
            states.isOnTheGround = false;
          }
        }
      } else if (toi < MIN) {
        // 충분히 가까움 - 지면에 있음
        states.isFalling = false;
        states.isOnTheGround = true;
      }
    }
  }

  // 추가 안전장치: 지면 상태와 속도로 isFalling 최종 결정
  if (!states.isOnTheGround && activeState.velocity.y < 0) {
    states.isFalling = true;
  } else if (states.isOnTheGround) {
    states.isFalling = false;
    
    // 땅에 닿았을 때 점프 카운터 리셋
    if (states._jumpCounter && states._jumpCounter > 0) {
      states._jumpCounter = 0;
    }
  }

  // 점프 버튼 관련 처리
  if (!control.space && !states.isOnTheGround && Math.abs(activeState.velocity.y) > 0.1) {
    states.isJumping = false;
  }

  // clicker 모드
  if (mode.controller === 'clicker') {
    states.isMoving = clicker.isOn;
    states.isNotMoving = !clicker.isOn;
    states.isRunning = (control.shift || clicker.isRun) && states.isMoving && clickerOption.isRun;
    
    // 점프 상태 업데이트 - 지면에 있을 때만 space 키를 눌렀을 때 점프 허용
    // 추가 조건: 이전에 점프 중이 아니었을 때만 새로운 점프 허용 (이중 점프 방지)
    const wasJumping = states.isJumping;
    const noRecentJump = !states._jumpCounter || states._jumpCounter === 0;
    
    if (control.space && states.isOnTheGround && !wasJumping && noRecentJump) {
      states.isJumping = true;
      
      // 디버깅 로그
      if (typeof window !== 'undefined' && window.localStorage.getItem('debug') === 'true') {
        console.log('Jump initiated! On ground:', states.isOnTheGround);
      }
    } else if (!control.space) {
      states.isJumping = false;
    }
  }

  // 회전 여부
  if (states.isMoving && outerGroupRef?.current) {
    // toFixed 사용 대신 반올림 연산으로 대체 (성능 개선)
    const yRot = Math.sin(outerGroupRef.current.rotation.y);
    const yEuler = Math.sin(activeState.euler.y);
    states.isRotated = Math.abs(yRot - yEuler) < 0.001;
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
