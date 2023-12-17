import { useContext } from "react";
import { controllerInnerType, refsType } from "../../../controller/type";
import { GaesupWorldContext } from "../../../world/context";
import { CharacterInnerGroupRef } from "../character/innerGltf";
import { VehicleCollider } from "./collider";
import { VehicleGroup } from "./group";
import { VehicleInnerGroupRef } from "./innerGltf";
import { VehicleRigidBody } from "./rigidbody";
import { Wheels } from "./wheels";

export function VehicleRef({
  props,
  refs,
}: {
  props: controllerInnerType;
  refs: refsType;
}) {
  const { url } = useContext(GaesupWorldContext);
  return (
    <VehicleGroup ref={refs.outerGroupRef} props={props}>
      <VehicleRigidBody ref={refs.rigidBodyRef} props={props}>
        <VehicleCollider />
        {props.isRider && (
          <CharacterInnerGroupRef
            props={props}
            groundRay={props.groundRay}
            refs={refs}
            ref={refs.characterInnerRef}
          />
        )}
        <VehicleInnerGroupRef ref={refs.innerGroupRef} />
      </VehicleRigidBody>
      {url.wheelUrl && <Wheels props={props} />}
    </VehicleGroup>
  );
}
