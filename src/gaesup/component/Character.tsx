"use client";

import calculation from "../physics";

import { controllerInnerType, refsType } from "../controller/type";
import { CharacterInnerGroupRef, InnerGroupRef } from "./gltf/CharacterGltf";
import {
  CharacterCapsuleCollider,
  CharacterGroup,
  CharacterRigidBody,
  CharacterSlopeRay,
} from "./ref/character";
import setInit from "./setInit";

export function Character({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const {
    capsuleColliderRef,
    rigidBodyRef,
    outerGroupRef,
    slopeRayOriginRef,
    characterInnerRef,
    innerGroupRef,
  } = refs;
  calculation(props);
  setInit(rigidBodyRef);
  return (
    <CharacterRigidBody ref={rigidBodyRef} props={props}>
      <CharacterCapsuleCollider props={props} ref={capsuleColliderRef} />
      <CharacterGroup ref={outerGroupRef} props={props}>
        <CharacterSlopeRay
          slopeRay={props.slopeRay}
          groundRay={props.groundRay}
          ref={slopeRayOriginRef}
        />
        {props.children}
        <InnerGroupRef ref={innerGroupRef} />
        <CharacterInnerGroupRef
          props={props}
          groundRay={props.groundRay}
          refs={refs}
          ref={characterInnerRef}
        />
      </CharacterGroup>
    </CharacterRigidBody>
  );
}
