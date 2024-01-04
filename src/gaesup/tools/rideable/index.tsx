import { useContext, useState } from "react";

import { Gltf } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import {
  GaesupWorldContext,
  GaesupWorldDispatchContext,
} from "../../world/context/index.js";
import "./style.css";

export type ridableType = {
  objectType: "vehicle" | "airplane";
  url: string;
  wheelUrl?: string;
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
};

export function Rideable({
  objectType,
  url,
  wheelUrl,
  position,
  rotation,
}: ridableType) {
  const context = useContext(GaesupWorldContext);
  const dispatch = useContext(GaesupWorldDispatchContext);
  const [visible, setVisible] = useState(true);

  const visibleFalse = async () => {
    setVisible(false);
  };

  const setUrl = async () => {
    if (objectType === "vehicle") {
      context.url.vehicleUrl = url;
      context.url.wheelUrl = wheelUrl || null;
    } else if (objectType === "airplane") {
      context.url.airplaneUrl = url;
    }
    dispatch({
      type: "update",
      payload: {
        url: {
          ...context.url,
        },
      },
    });
  };

  const setMode = async () => {
    context.mode.type = objectType;
    dispatch({
      type: "update",
      payload: {
        mode: {
          ...context.mode,
        },
      },
    });
  };

  return (
    <group userData={{ intangible: true }}>
      {visible && (
        <RigidBody
          type="dynamic"
          colliders="cuboid"
          position={position}
          rotation={rotation}
          userData={{ intangible: true }}
          onCollisionEnter={async (e) => {
            if (e.other.rigidBodyObject.name === "character") {
              await visibleFalse();
              await setUrl();
              await setMode();
            }
          }}
        >
          <Gltf src={url} />
        </RigidBody>
      )}
    </group>
  );
}
