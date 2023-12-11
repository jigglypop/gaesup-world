"use client";

import { propType, refsType } from "../controller/type";
import calculation from "../physics";
import { CharacterInnerGroupRef } from "./gltf/CharacterGltf";
import { VehicleInnerGroupRef } from "./gltf/VehicleGltf";
import { Wheels } from "./gltf/WheelJoint";
import { VehicleCollider, VehicleGroup, VehicleRigidBody } from "./ref/vehicle";
import setInit from "./setInit";

export function Vehicle({
  controllerProps,
  refs,
}: {
  controllerProps: propType;
  refs: refsType;
}) {
  const { rigidBodyRef, outerGroupRef, characterInnerRef, innerGroupRef } =
    refs;
  calculation(controllerProps);
  setInit(rigidBodyRef);

  return (
    <VehicleGroup ref={outerGroupRef} controllerProps={controllerProps}>
      <VehicleRigidBody ref={rigidBodyRef} controllerProps={controllerProps}>
        <VehicleCollider />
        {controllerProps.isRider && (
          <CharacterInnerGroupRef
            prop={controllerProps}
            groupProps={controllerProps.groupProps}
            groundRay={controllerProps.groundRay}
            refs={refs}
            callbacks={controllerProps.callbacks}
            ref={characterInnerRef}
            isRider={true}
          />
        )}
        <VehicleInnerGroupRef ref={innerGroupRef} />
      </VehicleRigidBody>
      <Wheels prop={controllerProps} />
    </VehicleGroup>
  );
}
