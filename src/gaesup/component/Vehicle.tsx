"use client";

import { controllerInnerType, refsType } from "../controller/type";
import calculation from "../physics";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { VehicleInnerGroupRef } from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import setInit from "./setInit";

export function Vehicle({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { rigidBodyRef, outerGroupRef, characterInnerRef, innerGroupRef } =
    refs;
  calculation(props);
  setInit(rigidBodyRef);

  return (
    <VehicleGroup ref={outerGroupRef} props={props}>
      <VehicleRigidBody ref={rigidBodyRef} props={props}>
        <VehicleCollider />
        {props.isRider && (
          <CharacterInnerGroupRef
            props={props}
            groundRay={props.groundRay}
            refs={refs}
            ref={characterInnerRef}
          />
        )}
        <VehicleInnerGroupRef ref={innerGroupRef} />
      </VehicleRigidBody>
      <Wheels props={props} />
    </VehicleGroup>
  );
}
