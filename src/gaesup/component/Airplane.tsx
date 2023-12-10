"use client";

import { propType, refsType } from "../controller/type";
import calculation from "../physics";
import { AirplaneInnerGroupRef } from "./gltf/AirplaneGltf";
import {
  AirplaneCollider,
  AirplaneGroup,
  AirplaneRigidBody,
} from "./ref/airplane";

export function Airplane({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
  refs: refsType;
}) {
  const { rigidBodyRef, outerGroupRef, capsuleColliderRef, innerGroupRef } =
    refs;
  calculation(controllerProps);

  return (
    <>
      <AirplaneGroup ref={outerGroupRef}>
        <AirplaneRigidBody
          ref={rigidBodyRef}
          groundRay={controllerProps.groundRay}
        >
          <AirplaneCollider prop={controllerProps} ref={capsuleColliderRef} />
          {/* <CharacterGltf
            gltf={characterGltf}
            prop={prop}
            url={props.url}
            character={props.character}
            groundRay={prop.groundRay}
            refs={refs}
            callbacks={callbacks}
            isRider={true}
          /> */}
          <AirplaneInnerGroupRef ref={innerGroupRef} />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
