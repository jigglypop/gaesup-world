import { Collider } from "@dimforge/rapier3d-compat";
import { CapsuleCollider } from "@react-three/rapier";
import { Ref, forwardRef } from "react";
import { characterColliderType } from "../../../world/context/type";

export const CharacterCapsuleCollider = forwardRef(
  ({ collider }: { collider: characterColliderType }, ref: Ref<Collider>) => {
    return (
      <CapsuleCollider
        ref={ref}
        args={[collider.height, collider.radius]}
        position={[0, collider.height + collider.radius, 0]}
      />
    );
  }
);
