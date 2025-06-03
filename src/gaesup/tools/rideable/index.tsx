import { euler, CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';
import { useContext, useState, useEffect } from 'react';
import { useRideable } from '../../hooks/useRideable';
import { V3 } from '../../utils';
import { GaesupWorldContext } from '../../world/context';
import { rideablePropType } from './type';
import * as THREE from 'three';
import { PassiveAirplane } from '../../component/passive/airplane';
import { PassiveVehicle } from '../../component/passive/vehicle';

// E키 UI 컴포넌트
function RideableUI({ states }: { states: any }) {
  if (!states.canRide || !states.nearbyRideable) {
    return null;
  }

  const uiStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    color: 'white',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid #4CAF50',
    zIndex: 1000,
    pointerEvents: 'none',
    animation: 'pulse 1.5s infinite',
  };

  return (
    <div style={uiStyle}>
      <style>
        {`
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        `}
      </style>
      🚗 E키를 눌러 {states.nearbyRideable.name}에 탑승하세요
    </div>
  );
}

export function Rideable(props: rideablePropType) {
  const { states, rideable } = useContext(GaesupWorldContext);
  const { initRideable, onRideableNear, onRideableLeave, landing } = useRideable();

  useEffect(() => {
    initRideable(props);
  }, []);

  useEffect(() => {
    if (states?.isRiding && rideable[props.objectkey] && !rideable[props.objectkey].visible) {
      landing(props.objectkey);
    }
  }, [states?.isRiding]);

  const onIntersectionEnter = async (e: CollisionEnterPayload) => {
    // 충돌 감지 시 근처 상태로 설정 (즉시 탑승 X)
    await onRideableNear(e, props);
  };

  const onIntersectionExit = async (e: CollisionExitPayload) => {
    // 충돌 벗어날 시 근처 상태 해제
    await onRideableLeave(e);
  };

  return (
    <>
      {/* E키 UI 표시 */}
      <RideableUI states={states} />
      
      {rideable?.[props.objectkey]?.visible && (
        <group userData={{ intangible: true }}>
          {props.objectType === 'vehicle' && (
            <PassiveVehicle
              controllerOptions={props.controllerOptions}
              position={props.position}
              rotation={props.rotation}
              currentAnimation={'idle'}
              url={props.url}
              wheelUrl={props.wheelUrl}
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
              onIntersectionExit={onIntersectionExit}
            />
          )}
          {props.objectType === 'airplane' && (
            <PassiveAirplane
              controllerOptions={props.controllerOptions}
              position={props.position}
              rotation={props.rotation}
              currentAnimation={'idle'}
              url={props.url}
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
              onIntersectionExit={onIntersectionExit}
            />
          )}
        </group>
      )}
    </>
  );
}
