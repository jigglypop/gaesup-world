import { useEffect } from 'react';
import { PassiveAirplane } from '../passive/airplane';
import { PassiveVehicle } from '../passive/vehicle';
import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';
import { RideableUIProps, RideablePropType } from './types';
import './styles.css';
import React from 'react';

export function RideableUI({ states }: RideableUIProps) {
  const mode = useGaesupStore((state) => state.mode);
  const setMode = useGaesupStore((state) => state.setMode);
  const setStates = useGaesupStore((state) => state.setStates);

  if (!states) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.stopPropagation();
    if (states.canRide && states.nearbyRideable) {
      const { objectkey, objectType } = states.nearbyRideable;
      setMode({
        type: objectType as 'character' | 'vehicle' | 'airplane',
      });
      setStates({
        rideableId: objectkey,
        isRiding: true,
        shouldEnterRideable: true,
        nearbyRideable: null,
        canRide: false,
      });
    }
    if (states.isRiding) {
      setMode({
        type: 'character',
      });
      setStates({
        shouldExitRideable: true,
        isRiding: false,
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
  const mode = useGaesupStore((state) => state.mode);
  const rideable = useGaesupStore((state) => state.rideable);
  const { initRideable, onRideableNear, onRideableLeave, landing } = useRideable();

  useEffect(() => {
    if (mode.type !== 'character' && props.objectkey && rideable[props.objectkey]) {
      landing(props.objectkey);
    }
  }, [mode.type, props.objectkey, rideable, landing]);

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
          <PassiveVehicle
            {...props}
            visible={!rideable[props.name || props.objectkey]?.isOccupied}
          />
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
          <PassiveAirplane
            {...props}
            visible={!rideable[props.name || props.objectkey]?.isOccupied}
          />
        </group>
      )}
    </>
  );
}
