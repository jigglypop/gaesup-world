import { refsType } from "../../../controller/type";

import { CapsuleCollider } from "@react-three/rapier";
import { ReactNode, Ref } from "react";
import { Object3D, Object3DEventMap } from "three";
import { useGltfAndSize } from "../../../hooks/useGaesupGltf";
import { urlType } from "../../../world/context/type";
import { InnerGroupRef } from "../common/InnerGroupRef";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";

export const calcCharacterColliderProps = (characterSize: THREE.Vector3) => {
  if (!characterSize) return null;
  const heightPlusDiameter = characterSize.y / 2;
  const diameter = Math.max(characterSize.x, characterSize.z);
  const radius = diameter / 2;
  const height = heightPlusDiameter - radius;
  const halfHeight = height / 2;
  return {
    height,
    halfHeight,
    radius,
    diameter,
  };
};

export type characterColliderType = {
  height: number;
  halfHeight: number;
  radius: number;
  diameter: number;
};

export function CharacterInnerRef({
  children,
  refs,
  urls,
  position,
  euler,
  animationRef,
  currentAnimation,
}: {
  children: ReactNode;
  refs: Partial<refsType>;
  urls: urlType;
  position?: THREE.Vector3;
  euler?: THREE.Euler;
  animationRef?: Ref<Object3D<Object3DEventMap>>;
  currentAnimation?: string;
}) {
  const { outerGroupRef, rigidBodyRef, colliderRef, innerGroupRef } = refs;
  const { size } = useGltfAndSize({ url: urls.characterUrl });
  const collider = calcCharacterColliderProps(size);
  return (
    <>
      {collider && (
        <OuterGroupRef ref={outerGroupRef}>
          {children}
          <RigidBodyRef
            ref={rigidBodyRef}
            name={"character"}
            position={position}
            rotation={euler}
          >
            <CapsuleCollider
              ref={colliderRef}
              args={[collider.height, collider.radius]}
              position={[0, collider.height + collider.radius, 0]}
            />
            <InnerGroupRef
              type={"character"}
              ref={innerGroupRef}
              url={urls.characterUrl}
              currentAnimation={currentAnimation}
            />
          </RigidBodyRef>
          {/* {outerChildren} */}
        </OuterGroupRef>
      )}
    </>
  );
}
