'use client';
import { CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';
import { useEffect } from 'react';
import { PassiveAirplane } from '../passive/airplane';
import { PassiveVehicle } from '../passive/vehicle';
import { useRideable } from '../../hooks/useRideable';
import { useGaesupContext } from '../../atoms';
import { RideableUIProps, RideablePropType } from './types';
import './styles.css';

export function RideableUI({ states }: RideableUIProps) {
  if (!states.canRide || !states.nearbyRideable) {
    return null;
  }

  return <div className="rideable-ui">🚗 E키를 눌러 {states.nearbyRideable.name}에 탑승하세요</div>;
}

export function Rideable(props: RideablePropType) {
  const { states, rideable } = useGaesupContext();
  const { initRideable, onRideableNear, onRideableLeave, landing } = useRideable();

  useEffect(() => {
    initRideable(props);
  }, []);

  useEffect(() => {
    if (states?.isRiding && rideable?.[props.objectkey] && !rideable[props.objectkey].visible) {
      landing(props.objectkey);
    }
  }, [states?.isRiding]);

  const onIntersectionEnter = async (e: CollisionEnterPayload) => {
    await onRideableNear(e, props);
  };

  const onIntersectionExit = async (e: CollisionExitPayload) => {
    await onRideableLeave(e);
  };

  return (
    <>
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
