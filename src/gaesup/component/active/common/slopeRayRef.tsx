import { forwardRef, Ref } from "react";
import { groundRayType, slopeRayType } from "../../../controller/type";

export const SlopeRayRef = forwardRef(
  (
    {
      groundRay,
      slopeRay,
    }: {
      groundRay: groundRayType;
      slopeRay: slopeRayType;
    },
    ref: Ref<THREE.Mesh>
  ) => {
    return (
      <mesh
        position={[
          groundRay.offset.x,
          groundRay.offset.y,
          groundRay.offset.z + slopeRay.offset.z,
        ]}
        ref={ref}
        visible={false}
        // userData={{ intangible: true }}
      >
        {/* <arrowHelper
          args={[
            slopeRay.dir,
            groundRay.origin.add(V3(0, 0, slopeRay.offset.z)),
            slopeRay.length,
            "#ff0000",
          ]}
        /> */}
        <boxGeometry args={[0.15, 0.15, 0.15]} />
      </mesh>
    );
  }
);
