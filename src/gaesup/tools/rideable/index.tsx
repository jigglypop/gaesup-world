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
  const { states, rideable } = useContext(GaesupWorldContext);
  const { initRideable, ride, landing } = useRideable();
  const [_rideable] = useState<{
    position: THREE.Vector3;
    rotation: THREE.Euler;
  }>({
    position: props.position || V3(0, 0, 0),
    rotation: props.rotation || euler(),
  });

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

  const onIntersectionEnter = async (e: CollisionEnterPayload) => {
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
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
            />
          )}
          {props.objectType === "airplane" && (
            <PassiveAirplane
              controllerOptions={props.controllerOptions}
              position={_rideable.position.clone()}
              rotation={_rideable.rotation.clone()}
              currentAnimation={"idle"}
              url={props.url}
              ridingUrl={props.ridingUrl}
              offset={props.offset}
              enableRiding={props.enableRiding}
              rigidBodyProps={props.rigidBodyProps}
              sensor={true}
              onIntersectionEnter={onIntersectionEnter}
            />
          )}
        </group>
      )}
    </>
  );
}
