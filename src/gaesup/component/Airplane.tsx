"use client";

import { propType, refsType } from "../controller/type";
import calculation from "../physics";
import { AirplaneInnerGroupRef } from "./gltf/AirplaneGltf";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import {
  AirplaneCollider,
  AirplaneGroup,
  AirplaneRigidBody,
} from "./ref/airplane";
import setInit from "./setInit";

export function Airplane({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
  refs: refsType;
}) {
  const {
    rigidBodyRef,
    outerGroupRef,
    capsuleColliderRef,
    innerGroupRef,
    characterInnerRef,
  } = refs;
  calculation(controllerProps);
  setInit(rigidBodyRef);

  return (
    <>
      <AirplaneGroup ref={outerGroupRef} controllerProps={controllerProps}>
        <AirplaneRigidBody ref={rigidBodyRef} controllerProps={controllerProps}>
          <AirplaneCollider prop={controllerProps} ref={capsuleColliderRef} />
          {controllerProps.isRider && (
            <CharacterInnerGroupRef
              prop={controllerProps}
              groupProps={controllerProps.groupProps}
              groundRay={controllerProps.groundRay}
              refs={refs}
              callbacks={controllerProps.callbacks}
              isRider={controllerProps.isRider}
              ref={characterInnerRef}
            />
          )}
          <AirplaneInnerGroupRef ref={innerGroupRef} />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
