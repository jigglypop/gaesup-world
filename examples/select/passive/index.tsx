"use client";

import { useGaesupController } from "../../../src/gaesup";

export default function Passive() {
  const {
    state,
    mode,
    currentAnimation,
    url,
    vehicleCollider,
    characterCollider,
    airplaneCollider,
  } = useGaesupController();

  return (
    <group>
      {/* {vehicleCollider && (
        <PassiveVehicle
          position={state.position.clone().add(V3(-4, 0, -4))}
          euler={state.euler.clone()}
          currentAnimation={currentAnimation}
          wheelSize={V3(
            vehicleCollider.wheelSizeX,
            vehicleCollider.wheelSizeY,
            vehicleCollider.wheelSizeZ
          )}
          vehicleSize={V3(
            vehicleCollider.vehicleSizeX,
            vehicleCollider.vehicleSizeY,
            vehicleCollider.vehicleSizeZ
          )}
          url={url}
        ></PassiveVehicle>
      )} */}
      {/* <PassiveCharacter
        position={state.position.clone().add(V3(5, 0, 5))}
        euler={state.euler.clone()}
        currentAnimation={currentAnimation}
        height={characterCollider?.height}
        diameter={characterCollider?.diameter}
        url={url}
      /> */}
      {/* {url.airplaneUrl && (
        <PassiveAirplane
          position={state.position.clone().add(V3(3, 0, 3))}
          euler={state.euler.clone()}
          currentAnimation={currentAnimation}
          airplaneSize={V3(
            airplaneCollider?.airplaneSizeX,
            airplaneCollider?.airplaneSizeY,
            airplaneCollider?.airplaneSizeZ
          )}
          airplaneUrl={url.airplaneUrl}
          gravity={airplaneCollider?.gravity}
        />
      )} */}
    </group>
  );
}
