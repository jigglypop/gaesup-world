import { vec3 } from "@react-three/rapier";
import { ReactNode } from "react";
import * as THREE from "three";
import playActions, { subscribeActions } from "../../../animation/actions";
import initCallback from "../../../controller/initialize/callback";
import {
  controllerInnerType,
  groundRayType,
  refsType,
} from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlsType } from "../../../world/context/type";
import { AirplaneInnerRef } from "../../inner/airplane";
import { setGroundRay } from "../../inner/common/setGroundRay";

export function AirplaneRef({
  children,
  props,
  groundRay,
  enableRiding,
  isRiderOn,
  offset,
  refs,
  urls,
}: {
  children: ReactNode;
  props: controllerInnerType;
  groundRay: groundRayType;
  enableRiding?: boolean;
  isRiderOn?: boolean;
  offset?: THREE.Vector3;
  refs: refsType;
  urls: urlsType;
}) {
  const { colliderRef } = refs;
  const { size, gltf } = useGltfAndSize({ url: urls.vehicleUrl });
  groundRay.offset = vec3({
    x: 0,
    y: size.y * 5,
    z: 0,
  });

  setGroundRay({
    groundRay: groundRay,
    length: size.y * 5,
    colliderRef,
  });
  const { animationResult } = subscribeActions({
    type: "airplane",
    groundRay: groundRay,
    animations: gltf.animations,
  });
  const { currentAnimation } = playActions({
    type: "airplane",
    animationResult,
  });
  // callback
  initCallback({
    props,
    animationResult,
    type: "airplane",
  });
  return (
    <AirplaneInnerRef
      refs={refs}
      urls={urls}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
      currentAnimation={currentAnimation}
    >
      {children}
    </AirplaneInnerRef>
  );
}
