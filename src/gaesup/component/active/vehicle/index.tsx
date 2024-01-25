import { vec3 } from "@react-three/rapier";
import { ReactNode } from "react";
import playActions, { subscribeActions } from "../../../animation/actions";
import { groundRayType, refsType } from "../../../controller/type";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlsType } from "../../../world/context/type";
import { setGroundRay } from "../../inner/common/setGroundRay";
import { VehicleInnerRef } from "../../inner/vehicle";

export function VehicleRef({
  children,
  groundRay,
  enableRiding,
  isRiderOn,
  offset,
  refs,
  urls,
}: {
  children: ReactNode;
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
    y: size.y * 3,
    z: 0,
  });

  setGroundRay({
    groundRay: groundRay,
    length: size.y * 3,
    colliderRef,
  });
  const { animationResult } = subscribeActions({
    type: "vehicle",
    groundRay: groundRay,
    animations: gltf.animations,
  });
  const { animationRef, currentAnimation } = playActions({
    type: "vehicle",
    animationResult,
  });
  return (
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
      currentAnimation={currentAnimation}
    >
      {children}
    </VehicleInnerRef>
  );
}
