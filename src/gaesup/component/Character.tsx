"use client";

import calculation from "../physics";

import { propType, refsType } from "../controller/type";
import { CharacterInnerGroupRef, InnerGroupRef } from "./gltf/CharacterGltf";
import {
  CharacterCapsuleCollider,
  CharacterGroup,
  CharacterRigidBody,
  CharacterSlopeRay,
} from "./ref/character";
import setInit from "./setInit";

export function Character({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
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
  calculation(controllerProps);
  setInit(rigidBodyRef);
  return (
    <CharacterRigidBody ref={rigidBodyRef} controllerProps={controllerProps}>
      <CharacterCapsuleCollider
        prop={controllerProps}
        ref={capsuleColliderRef}
      />
      <CharacterGroup ref={outerGroupRef} controllerProps={controllerProps}>
        <CharacterSlopeRay
          slopeRay={controllerProps.slopeRay}
          groundRay={controllerProps.groundRay}
          ref={slopeRayOriginRef}
        />
        {controllerProps.children}
        <InnerGroupRef ref={innerGroupRef} />
        <CharacterInnerGroupRef
          prop={controllerProps}
          groupProps={controllerProps.groupProps}
          groundRay={controllerProps.groundRay}
          refs={refs}
          callbacks={controllerProps.callbacks}
          ref={characterInnerRef}
          isRider={false}
        />
      </CharacterGroup>
    </CharacterRigidBody>
  );
}
