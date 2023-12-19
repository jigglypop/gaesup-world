import { RapierRigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { gaesupPassivePropsType } from "../../../hooks/useGaesupController";
import mutation from "../../../mutation";
import { PassiveWrapperRef } from "../common/PassiveWrapperRef";
import { VehicleCollider } from "./collider";
import { Wheels } from "./wheels";

export function PassiveVehicle({ props }: { props: gaesupPassivePropsType }) {
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const outerGroupRef = useRef<THREE.Group>(null);
  const innerGroupRef = useRef<THREE.Group>(null);
  const characterInnerRef = useRef<THREE.Group>(null);

  const refs = {
    rigidBodyRef,
    outerGroupRef,
    innerGroupRef,
    characterInnerRef,
  };

  mutation({
    refs,
    props,
    delta: 0.9,
  });

  return (
    <PassiveWrapperRef
      props={props}
      refs={refs}
      url={props.url?.vehicleUrl}
      outerChildren={
        props.url?.wheelUrl ? (
          <Wheels
            props={props}
            rigidBodyRef={rigidBodyRef}
            url={props.url?.wheelUrl}
          />
        ) : (
          <></>
        )
      }
    >
      {props.vehicleCollider && (
        <VehicleCollider collider={props.vehicleCollider} url={props.url} />
      )}
    </PassiveWrapperRef>
  );
}
