import { Rideable, RideableUI, V3, useStateSystem } from 'gaesup-world';

import { AIRPLANE_URL, VEHICLE_URL } from '../../config/constants';

export function RideableVehicles() {
  return (
    <>
      <Rideable
        objectkey="vehicle_main"
        url={VEHICLE_URL}
        objectType="vehicle"
        enableRiding
        offset={V3(0, 1, 0)}
        position={V3(-70, 1, 30)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
        displayName="Gorani Vehicle"
        rideMessage="Press F to ride the Gorani vehicle"
        exitMessage="Press F to exit the vehicle"
      />
      <Rideable
        objectkey="airplane_main"
        url={AIRPLANE_URL}
        objectType="airplane"
        enableRiding
        offset={V3(0, 1, 0)}
        position={V3(70, 1, 40)}
        controllerOptions={{ lerp: { cameraPosition: 0.1, cameraTurn: 0.1 } }}
        displayName="Gaebird Airplane"
        rideMessage="Press F to ride the Gaebird airplane"
        exitMessage="Press F to exit the airplane"
      />
    </>
  );
}

export function RideableUIRenderer() {
  const { gameStates } = useStateSystem();
  const states = {
    canRide: gameStates.canRide,
    isRiding: gameStates.isRiding,
    ...(gameStates.nearbyRideable ? { nearbyRideable: gameStates.nearbyRideable } : {}),
    ...(gameStates.currentRideable ? { currentRideable: gameStates.currentRideable } : {}),
  };

  return (
    <RideableUI
      states={states}
      actionKey="F"
      classNames={{
        root: 'gaesup-rideable-menu',
        box: 'gaesup-rideable-menu__box',
        message: 'gaesup-rideable-menu__message',
        key: 'gaesup-rideable-menu__key',
      }}
      labels={{
        speed: 'Max',
        acceleration: 'Accel',
      }}
    />
  );
}
