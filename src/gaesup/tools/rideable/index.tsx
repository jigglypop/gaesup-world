import { CollisionEnterPayload, CollisionExitPayload } from '@react-three/rapier';
import { useContext, useEffect } from 'react';
import { PassiveAirplane } from '../../component/passive/airplane';
import { PassiveVehicle } from '../../component/passive/vehicle';
import { useRideable } from '../../hooks/useRideable';
import { GameStatesType } from '../../types';
import { GaesupWorldContext } from '../../world/context';
import { rideablePropType } from './type';

export function RideableUI({ states }: { states: GameStatesType }) {
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
  return <div style={uiStyle}>🚗 E키를 눌러 {states.nearbyRideable.name}에 탑승하세요</div>;
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
