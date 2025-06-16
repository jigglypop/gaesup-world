import { useEffect } from 'react';
import { PassiveAirplane } from '../passive/airplane';
import { PassiveVehicle } from '../passive/vehicle';
import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';
import { RideableUIProps, RideablePropType } from './types';
import './styles.css';
import React from 'react';

export function RideableUI({ states }: RideableUIProps) {
  const updateState = useGaesupStore((state) => state.updateState);
  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (states.canRide && states.nearbyRideable) {
      const { objectkey, objectType } = states.nearbyRideable;
      updateState({
        mode: {
          type: objectType,
        },
        states: {
          rideableId: objectkey,
          isRiding: true,
          shouldEnterRideable: true,
          nearbyRideable: null,
        },
      });
    }
    if (states.isRiding) {
      updateState({
        mode: {
          type: 'character',
        },
        states: {
          shouldExitRideable: true,
          isRiding: false,
        },
      });
    }
  };

  return (
    <div className="rideable-ui-container" onClick={handleClick}>
      <div className="message-box">
        {states.canRide && <div>Press F to ride</div>}
        {states.isRiding && <div>Press F to exit</div>}
      </div>
    </div>
  );
}

export function Rideable(props: RideablePropType) {
  const { states, rideable } = useGaesupStore();
  const { initRideable, onRideableNear, onRideableLeave, landing } = useRideable();

  useEffect(() => {
    if (states?.isRiding && rideable?.[props.objectkey] && !rideable[props.objectkey].visible) {
      landing(props.objectkey);
    }
  }, [states?.isRiding]);

  return (
    <>
      {props.objectType === 'vehicle' && (
        <group
          position={props.position}
          rotation={props.rotation}
          name={props.name}
          userData={{
            ...props.userData,
            objectType: props.objectType,
            rideable: true,
            init: initRideable,
            onNear: onRideableNear,
            onLeave: onRideableLeave,
            landing,
          }}
        >
          <PassiveVehicle {...props} visible={!rideable[props.name]?.isOccupied} />
        </group>
      )}
      {props.objectType === 'airplane' && (
        <group
          position={props.position}
          rotation={props.rotation}
          name={props.name}
          userData={{
            ...props.userData,
            objectType: props.objectType,
            rideable: true,
            init: initRideable,
            onNear: onRideableNear,
            onLeave: onRideableLeave,
            landing,
          }}
        >
          <PassiveAirplane {...props} visible={!rideable[props.name]?.isOccupied} />
        </group>
      )}
    </>
  );
}
