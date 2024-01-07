import { useContext, useEffect } from "react";

import { CollisionEnterPayload, euler } from "@react-three/rapier";
import { PassiveAirplane } from "../../component/passive/airplane/index.js";
import { PassiveVehicle } from "../../component/passive/vehicle/index.js";
import { useRideable } from "../../hooks/useRideable/index.js";
import { V3 } from "../../utils/vector.js";
import { GaesupWorldContext } from "../../world/context/index.js";
import { rideableType } from "../../world/context/type.js";
import "./style.css";

export function Rideable(props: rideableType) {
  const { states, rideable, vehicleCollider, airplaneCollider } =
    useContext(GaesupWorldContext);

  const { initRideable, getRideable, ride, landing } = useRideable();
  const current = getRideable(props.objectkey);

  useEffect(() => {
    initRideable(props);
  }, []);

  useEffect(() => {
    if (
      states?.isLanding &&
      rideable[props.objectkey] &&
      !rideable[props.objectkey].visible
    ) {
      landing(props.objectkey);
    }
  }, [states?.isLanding]);

  const onCollisionEnter = async (e: CollisionEnterPayload) => {
    await ride(e, props);
  };

  return (
    <>
      {current &&
        rideable[props.objectkey] &&
        rideable[props.objectkey].visible && (
          <group userData={{ intangible: true }}>
            {props.objectType === "vehicle" && (
              <PassiveVehicle
                position={current.position || V3(0, 0, 0)}
                euler={current.rotation || euler()}
                vehicleSize={
                  current.vehicleSize ||
                  V3(
                    vehicleCollider.vehicleSizeX,
                    vehicleCollider.vehicleSizeY,
                    vehicleCollider.vehicleSizeZ
                  )
                }
                wheelSize={
                  current.wheelSize ||
                  V3(
                    vehicleCollider.wheelSizeX,
                    vehicleCollider.wheelSizeY,
                    vehicleCollider.wheelSizeZ
                  )
                }
                currentAnimation={"idle"}
                url={{
                  vehicleUrl: props.url,
                  wheelUrl: props.wheelUrl,
                }}
                onCollisionEnter={onCollisionEnter}
              />
            )}
            {props.objectType === "airplane" && (
              <PassiveAirplane
                position={current.position || V3(0, 0, 0)}
                euler={current.rotation || euler()}
                airplaneSize={
                  current.airplaneSize ||
                  V3(
                    airplaneCollider.airplaneSizeX,
                    airplaneCollider.airplaneSizeY,
                    airplaneCollider.airplaneSizeZ
                  )
                }
                currentAnimation={"idle"}
                airplaneUrl={props.url}
                onCollisionEnter={onCollisionEnter}
              />
            )}
          </group>
        )}
    </>
  );
}
