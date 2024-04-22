import { useContext, useEffect, useState } from "react";

import { CollisionEnterPayload, euler } from "@react-three/rapier";

import * as THREE from "three";
import { PassiveAirplane } from "../../component/passive/airplane";
import { PassiveVehicle } from "../../component/passive/vehicle";
import { useRideable } from "../../hooks/useRideable";
import { V3 } from "../../utils";
import { GaesupWorldContext } from "../../world/context";
import "./style.css";
import { rideablePropType } from "./type";

export function Rideable(props: rideablePropType) {
  const { states, rideable, urls } = useContext(GaesupWorldContext);
  const { initRideable, getRideable, ride, landing } = useRideable();
  // const current = getRideable(props.objectkey);
  const [_rideable, set_Rideable] = useState<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
  }>({
    position: props.position || V3(0, 0, 0),
    rotation: props.rotation || euler(),
  });
  // console.log(current);
  // if (!current) return null;
  useEffect(() => {
    initRideable(props);
  }, []);

  useEffect(() => {
    if (
      states?.isRiding &&
      rideable[props.objectkey] &&
      !rideable[props.objectkey].visible
    ) {
      landing(props.objectkey);
    }
  }, [states?.isRiding]);

  const onCollisionEnter = async (e: CollisionEnterPayload) => {
    await ride(e, props);
  };

  return (
    <>
      {rideable?.[props.objectkey]?.visible && (
        <group userData={{ intangible: true }}>
          {props.objectType === "vehicle" && (
            <PassiveVehicle
              controllerOptions={props.controllerOptions}
              position={_rideable.position}
              rotation={_rideable.rotation}
              currentAnimation={"idle"}
              url={props.url}
              wheelUrl={props.wheelUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              onCollisionEnter={onCollisionEnter}
            />
          )}
          {props.objectType === "airplane" && (
            <PassiveAirplane
              controllerOptions={props.controllerOptions}
              position={_rideable.position}
              rotation={_rideable.rotation}
              currentAnimation={"idle"}
              url={props.url}
              offset={props.offset}
              enableRiding={props.enableRiding}
              onCollisionEnter={onCollisionEnter}
            />
          )}
        </group>
      )}
    </>
  );
}
