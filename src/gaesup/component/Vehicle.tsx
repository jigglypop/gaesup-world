"use client";

import check from "../check";
import { propType, refsType } from "../controller/type";
import calculation from "../physics";
import CharacterGltf from "./gltf/CharacterGltf";
import VehicleGltf from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";

export function Vehicle({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
  refs: refsType;
}) {
  const { rigidBodyRef, outerGroupRef } = refs;
  check(controllerProps);
  calculation(controllerProps);

  return (
    <VehicleGroup ref={outerGroupRef}>
      <VehicleRigidBody
        ref={rigidBodyRef}
        groundRay={controllerProps.groundRay}
      >
        <VehicleCollider />
        <CharacterGltf
          prop={controllerProps}
          groupProps={controllerProps.groupProps}
          groundRay={controllerProps.groundRay}
          refs={refs}
          callbacks={controllerProps.callbacks}
          isRider={true}
        />
        <VehicleGltf />
      </VehicleRigidBody>
      <Wheels prop={controllerProps} />
    </VehicleGroup>
  );
}
