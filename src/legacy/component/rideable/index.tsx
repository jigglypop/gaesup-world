import { useEffect } from 'react';
import { PassiveAirplane } from '../passive/airplane';
import { PassiveVehicle } from '../passive/vehicle';
import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';
import { RideableUIProps, RideablePropType } from './types';
import './styles.css';
import React from 'react';

export function RideableUI({ states }: RideableUIProps) {
  if (!states) {
    return null;
  }

  if (!states.canRide && !states.isRiding) {
    return null;
  }

  const rideMessage =
    states.nearbyRideable?.rideMessage ??
    `Press F to ride ${
      states.nearbyRideable?.displayName ??
      states.nearbyRideable?.name ??
      'vehicle'
    }`;
  const exitMessage = states.nearbyRideable?.exitMessage ?? 'Press F to exit';

  return (
    <div className="rideable-ui-container">
      <div className="message-box">
        {states.canRide && <div>{rideMessage}</div>}
        {states.isRiding && <div>{exitMessage}</div>}
      </div>
    </div>
  );
}

export function Rideable(props: RideablePropType) {
  const rideable = useGaesupStore((state) => state.rideable);
  const { initRideable, onRideableNear, onRideableLeave, landing } =
    useRideable();

  useEffect(() => {
    initRideable(props);
  }, [props, initRideable]);

  const userData = {
    objectType: props.objectType,
    objectkey: props.objectkey,
    rideable: true,
    init: initRideable,
    onNear: onRideableNear,
    onLeave: onRideableLeave,
    landing,
    rideMessage: props.rideMessage,
    exitMessage: props.exitMessage,
    displayName: props.displayName,
  };

  return (
    <>
      {props.objectType === 'vehicle' && (
        <PassiveVehicle
          {...props}
          userData={userData}
          sensor={true}
          visible={!rideable[props.objectkey]?.isOccupied}
        />
      )}
      {props.objectType === 'airplane' && (
        <PassiveAirplane
          {...props}
          userData={userData}
          sensor={true}
          visible={!rideable[props.objectkey]?.isOccupied}
        />
      )}
    </>
  );
}
