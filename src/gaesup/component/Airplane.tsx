"use client";

import { controllerInnerType, refsType } from "../controller/type";
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
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const {
    rigidBodyRef,
    outerGroupRef,
    capsuleColliderRef,
    innerGroupRef,
    characterInnerRef,
  } = refs;
  calculation(props);
  setInit(rigidBodyRef);

  return (
    <>
      <AirplaneGroup ref={outerGroupRef} props={props}>
        <AirplaneRigidBody ref={rigidBodyRef} props={props}>
          <AirplaneCollider prop={props} ref={capsuleColliderRef} />
          {props.isRider && (
            <CharacterInnerGroupRef
              props={props}
              groundRay={props.groundRay}
              refs={refs}
              ref={characterInnerRef}
            />
          )}
          <AirplaneInnerGroupRef ref={innerGroupRef} />
        </AirplaneRigidBody>
      </AirplaneGroup>
    </>
  );
}
