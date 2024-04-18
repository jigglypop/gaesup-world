import { ReactNode } from "react";
import * as THREE from "three";
import { groundRayType, refsType } from "../../../controller/type";
import { urlsType } from "../../../world/context/type";
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
  //   const { colliderRef } = refs;
  //   const { size, gltf } = useGltfAndSize({ url: urls.vehicleUrl });
  //   groundRay.offset = vec3({
  //     x: 0,
  //     y: size.y * 3,
  //     z: 0,
  //   });
  //
  //   setGroundRay({
  //     groundRay: groundRay,
  //     length: size.y * 3,
  //     colliderRef,
  //   });
  //   const { animationResult } = subscribeActions({
  //     type: "vehicle",
  //     groundRay: groundRay,
  //     animations: gltf.animations,
  //   });
  //   const { currentAnimation } = playActions({
  //     type: "vehicle",
  //     animationResult,
  //   });
  // callback
  // initCallback({
  //   animationResult,
  //   type: "vehicle",
  // });
  return (
    <VehicleInnerRef
      refs={refs}
      urls={urls}
      isRiderOn={isRiderOn}
      enableRiding={enableRiding}
      offset={offset}
      outerGroupRef={refs.outerGroupRef}
      innerGroupRef={refs.innerGroupRef}
      rigidBodyRef={refs.rigidBodyRef}
      colliderRef={refs.colliderRef}
      isActive={true}
      componentType="vehicle"
    >
      {children}
    </VehicleInnerRef>
  );
}
