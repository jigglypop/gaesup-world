import { useContext, useEffect } from "react";

import { CollisionEnterPayload, euler } from "@react-three/rapier";
import { PassiveVehicle } from "../../component/passive/vehicle/index.js";
import { useRideable } from "../../hooks/useRideable/index.js";
import { V3, V30 } from "../../utils/vector.js";
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
    <group userData={{ intangible: true }}>
      {current &&
        rideable[props.objectkey] &&
        rideable[props.objectkey].visible && (
          <PassiveVehicle
            position={current.position || V3(0, 0, 0)}
            euler={current.rotation || euler()}
            vehicleSize={
              current.vehicleSize || props.objectType === "vehicle"
                ? V3(
                    vehicleCollider.vehicleSizeX,
                    vehicleCollider.vehicleSizeY,
                    vehicleCollider.vehicleSizeZ
                  )
                : V3(
                    airplaneCollider.airplaneSizeX,
                    airplaneCollider.airplaneSizeY,
                    airplaneCollider.airplaneSizeZ
                  )
            }
            wheelSize={
              current.wheelSize || props.objectType === "vehicle"
                ? V3(
                    vehicleCollider.wheelSizeX,
                    vehicleCollider.wheelSizeY,
                    vehicleCollider.wheelSizeZ
                  )
                : V30()
            }
            currentAnimation={"idle"}
            url={{
              vehicleUrl: props.url,
              wheelUrl: props.wheelUrl,
            }}
            onCollisionEnter={onCollisionEnter}
          />
          // <RigidBody
          //   type="dynamic"
          //   colliders="cuboid"
          //   position={current.position || V3(0, 0, 0)}
          //   rotation={current.rotation || euler()}
          //   userData={{ intangible: true }}
          //   onCollisionEnter={async (e) => {
          //     await ride(e, props);
          //   }}
          // >
          //   <Gltf src={props.url} />
          // </RigidBody>
        )}
    </group>
  );
}
