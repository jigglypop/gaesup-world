import { useContext, useEffect } from "react";

import { CollisionEnterPayload, euler } from "@react-three/rapier";
import { PassiveAirplane } from "../../component/passive/airplane/index.js";
import { PassiveVehicle } from "../../component/passive/vehicle/index.js";
import { useRideable } from "../../hooks/useRideable/index.js";
import { V3 } from "../../utils/vector.js";
import { GaesupWorldContext } from "../../world/context/index.js";
import "./style.css";
import { rideablePropType } from "./type.js";

export function Rideable(props: rideablePropType) {
  const { states, rideable, urls } = useContext(GaesupWorldContext);
  const { initRideable, getRideable, ride, landing } = useRideable();
  const current = getRideable(props.objectkey);

  useEffect(() => {
    initRideable(props);
  }, []);

  // useEffect(() => {
  //   if (
  //     states?.isRiding &&
  //     rideable[props.objectkey] &&
  //     !rideable[props.objectkey].visible
  //   ) {
  //     landing(props.objectkey);
  //   }
  // }, [states?.isRiding]);

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
                componentType={"vehicle"}
                controllerOptions={props.controllerOptions}
                position={current.position || V3(0, 0, 0)}
                rotation={current.rotation || euler()}
                currentAnimation={"idle"}
                url={props.url}
                wheelUrl={props.wheelUrl}
                offset={props.offset}
                isRiderOn={props.isRiderOn}
                enableRiding={props.enableRiding}
                onCollisionEnter={onCollisionEnter}
              />
            )}
            {props.objectType === "airplane" && (
              <PassiveAirplane
                componentType={"airplane"}
                controllerOptions={props.controllerOptions}
                position={current.position || V3(0, 0, 0)}
                rotation={current.rotation || euler()}
                currentAnimation={"idle"}
                url={props.url}
                offset={props.offset}
                isRiderOn={props.isRiderOn}
                enableRiding={props.enableRiding}
                onCollisionEnter={onCollisionEnter}
              />
            )}
          </group>
        )}
    </>
  );
}
