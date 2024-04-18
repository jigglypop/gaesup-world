import * as THREE from "three";
import { OuterGroupRef } from "../common/OuterGroupRef";
import { RigidBodyRef } from "../common/RigidbodyRef";
import { characterInnerType } from "./type";

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

export function CharacterInnerRef(props: characterInnerType) {
  const { outerGroupRef, rigidBodyRef, colliderRef, innerGroupRef } =
    props.refs;
  return (
    <OuterGroupRef ref={outerGroupRef}>
      <RigidBodyRef
        ref={rigidBodyRef}
        name={"character"}
        url={props.urls.characterUrl}
        outerGroupRef={outerGroupRef}
        innerGroupRef={innerGroupRef}
        rigidBodyRef={rigidBodyRef}
        colliderRef={colliderRef}
        {...props}
      >
        {props.children}
      </RigidBodyRef>
    </OuterGroupRef>
  );
}
