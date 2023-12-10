"use client";

import calculation from "../physics";

import { propType, refsType } from "../controller/type";
import CharacterGltf from "./gltf/CharacterGltf";
import {
  CharacterCapsuleCollider,
  CharacterGroup,
  CharacterRigidBody,
  CharacterSlopeRay,
} from "./ref/character";

export function Character({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
  refs: refsType;
}) {
  const { capsuleColliderRef, rigidBodyRef, outerGroupRef, slopeRayOriginRef } =
    refs;
  calculation(controllerProps);

  return (
    <CharacterRigidBody ref={rigidBodyRef} controllerProps={controllerProps}>
      <CharacterCapsuleCollider
        prop={controllerProps}
        ref={capsuleColliderRef}
      />
      <CharacterGroup ref={outerGroupRef}>
        <CharacterSlopeRay
          slopeRay={controllerProps.slopeRay}
          groundRay={controllerProps.groundRay}
          ref={slopeRayOriginRef}
        />
        {controllerProps.children}
        <CharacterGltf
          prop={controllerProps}
          groupProps={controllerProps.groupProps}
          groundRay={controllerProps.groundRay}
          refs={refs}
          callbacks={controllerProps.callbacks}
        />
      </CharacterGroup>
    </CharacterRigidBody>
  );
}
