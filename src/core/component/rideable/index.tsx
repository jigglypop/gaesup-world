import { useEffect } from 'react';
import { PassiveAirplane } from '../passive/airplane';
import { PassiveVehicle } from '../passive/vehicle';
import { useRideable } from '@hooks/useRideable';
import { useGaesupStore } from '@stores/gaesupStore';
import { RideableUIProps, RideablePropType } from './types';
import './styles.css';
import React from 'react';

export function RideableUI({ states }: RideableUIProps) {
  const setMode = useGaesupStore((state) => state.setMode);
  const setStates = useGaesupStore((state) => state.setStates);

  if (!states) {
    return null;
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code !== 'KeyF') return;
      
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
      } else if (states.isRiding) {
        setMode({
          type: 'character',
        });
        setStates({
          shouldExitRideable: true,
          isRiding: false,
        });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [states.canRide, states.nearbyRideable, states.isRiding, setMode, setStates]);

  if (!states.canRide && !states.isRiding) {
    return null;
  }

  return (
    <div className="rideable-ui-container">
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

  const userData = {
    objectType: props.objectType,
    objectkey: props.objectkey,
    rideable: true,
    init: initRideable,
    onNear: onRideableNear,
    onLeave: onRideableLeave,
    landing,
  };

  return (
    <>
      {props.objectType === 'vehicle' && (
        <PassiveVehicle
          {...props}
          userData={userData}
          visible={!rideable[props.objectkey]?.isOccupied}
        />
      )}
      {props.objectType === 'airplane' && (
        <PassiveAirplane
          {...props}
          userData={userData}
          visible={!rideable[props.objectkey]?.isOccupied}
        />
      )}
    </>
  );
}
