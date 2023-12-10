"use client";

import check from "../check";
import { propType, refsType } from "../controller/type";
import calculation from "../physics";
import AirplaneGltf from "./gltf/AirplaneGltf";
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
  const { rigidBodyRef, outerGroupRef, capsuleColliderRef } = refs;
  check(controllerProps);
  calculation(controllerProps);

  return (
    <>
      <AirplaneGroup ref={outerGroupRef}>
        <AirplaneRigidBody
          ref={rigidBodyRef}
          groundRay={controllerProps.groundRay}
        >
          <AirplaneCollider ref={capsuleColliderRef} />
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
          <AirplaneGltf />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
