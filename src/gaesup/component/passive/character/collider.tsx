import { Collider } from "@dimforge/rapier3d-compat";
import { CapsuleCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";

export const CharacterCapsuleCollider = forwardRef(
  (
    { height, diameter }: { height: number; diameter: number },
    ref: Ref<Collider>
  ) => {
    return (
      <CapsuleCollider
        ref={ref}
        args={[height, diameter / 2]}
        position={[0, height + diameter / 2, 0]}
      />
    );
  }
);
